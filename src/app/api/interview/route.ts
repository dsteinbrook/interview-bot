import { ConversationStatus, ConversationState } from "@/utils/interviewController";
import interview from '@/utils/interviewScript';
import {NextResponse} from 'next/server';
import {classifyUserMessage, answerUserQuestion} from '@/utils/openai'
import {getConversationState, setConversationState, addMessage} from "@/utils/db";

interface BotResponse {
role: 'user' | 'assistant' | 'system';
content: string;
status: ConversationStatus;
skipUserInput: boolean;
}

export async function POST(req: Request) {

    try {

        const {messages, conversationId, newQuestion} = await req.json();

        const conversationState = await getConversationState(conversationId);
        if (conversationState){
            interview.loadState(conversationState);
        } else {
            const initialState: ConversationState = {
                currentNodeId: '0-0',
                status: ConversationStatus.InProgress,
                flags: {}
            }
            interview.loadState(
                JSON.stringify(initialState)
            )
        }

        //skip openai queries if not necessary
        if (messages.length === 0 || interview.getStatus() === ConversationStatus.Completed){
          
            const response: BotResponse = {role: 'assistant', content: interview.getDialogueText(), status: interview.getStatus(), skipUserInput: false};

            const savedState = interview.saveState();
            await setConversationState(conversationId, savedState);
            await addMessage(conversationId, response.role, response.content);
            return NextResponse.json(response);

        }

        //handle case where bot needs to send a second message in a row aftering answering a question
        if (newQuestion){
            interview.setFlag('question', false);
            const savedState = interview.saveState();
            const response: BotResponse = {role: 'assistant', content: interview.getDialogueText(), status: interview.getStatus(), skipUserInput: false};
            await setConversationState(conversationId, savedState);
            await addMessage(conversationId, response.role, response.content);
            return NextResponse.json(response);
        }

        const lastUserMessage = messages[messages.length-1];
        const availableOptions = interview.getAvailableOptions();
  
        const optionIndex = await classifyUserMessage(lastUserMessage.content, availableOptions);
        
        //save user's inputted name
        if (interview.getFlag('collectName')){
            interview.processUserResponse(optionIndex || 0, lastUserMessage.content)
        } else {
            interview.processUserResponse(optionIndex || 0);
        }

        let botMessageText;

        //query openai to answer user's question
        if (interview.getFlag('question')){

            botMessageText = (await answerUserQuestion(messages))?.content;
            

        } else {
            botMessageText = interview.getDialogueText();
        }
        
        
        const response: BotResponse = {role: 'assistant', content: botMessageText as string, status: interview.getStatus(), skipUserInput: interview.getFlag('question')}

        const savedState = interview.saveState();

        await setConversationState(conversationId, savedState);
        await addMessage(conversationId, lastUserMessage.role, lastUserMessage.content);
        await addMessage(conversationId, 'assistant', response.content);
    
        return NextResponse.json(response);

    } catch(err){
        console.log(err);
        return NextResponse.json(
            {error: 'Failed to process your request'}, {status: 500}
        )
    }
};