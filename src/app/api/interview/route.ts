import { Interview, ConversationStatus, ConversationState } from "@/utils/interviewController";
import {NextResponse} from 'next/server';
import {classifyUserMessage} from '@/utils/openai'
import {getConversationState, setConversationState, addMessage} from "@/utils/db";

interface BotResponse {
role: 'user' | 'assistant' | 'system';
content: string;
status: ConversationStatus
}

const interview = new Interview('0-0');

interview.addNode({
    id: '0-0',
    text: 'Hello! Are you currently open to discussing the forklift operator role?',
    options: [
        {
            text: 'Yes',
            nextNodeId: '1-0',
        },
        {
            text: 'No',
            nextNodeId: '0-1',
        }
    ]
});

interview.addNode({
    id: '0-1',
    text: 'No problem. Best of luck!',
    onEnter: () => {
        interview.updateStatus(ConversationStatus.Completed)
    },
    options: []

})

interview.addNode({
    id: '1-0',
    text: 'Excellent! Let\'s start with some basic information. What is your name?',
    onEnter: () => {
        interview.setFlag('collectName', true)
    },
    options: [
        {
            nextNodeId: '1-1',
        } 
    ]
});

interview.addNode({
    id: '1-1',
    text: `Nice to meet you, ${interview.getUserName()}! Which location are you applying for?`,
    options: []
})

export async function POST(req: Request) {


    try {

        const {messages, conversationId} = await req.json();

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


        if (messages.length === 0 || interview.getStatus() === ConversationStatus.Completed){

            const response: BotResponse = {role: 'assistant', content: interview.getDialogueText(), status: interview.getStatus()};
            return NextResponse.json(response);

        }


        const lastUserMessage = messages[messages.length-1];
        const availableOptions = interview.getAvailableOptions();
  
        const optionIndex = await classifyUserMessage(lastUserMessage.content, availableOptions);
        
        if (interview.getFlag('collectName')){
            
            interview.processUserResponse(optionIndex || 0, lastUserMessage.content)
        } else {
            interview.processUserResponse(optionIndex || 0);
        }
        
        const botMessageText = interview.getDialogueText();
        const response: BotResponse = {role: 'assistant', content: botMessageText, status: interview.getStatus()}

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