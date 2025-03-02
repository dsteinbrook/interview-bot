import { Interview } from "@/utils/interviewController";
import {NextResponse} from 'next/server';
import {OpenAI} from 'openai';
import {zodResponseFormat} from "openai/helpers/zod";
import {z} from "zod";
import {ChatMessage} from "@/app/page"

// Define the Zod schema for the structured output
const ClassificationSchema = z.object({
    selectedOptionIndex: z.number()
  });


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// const interview = new Interview('start');

// interview.addNode({
//     id: 'start',
//     text: 'Hello! Are you currently open to discussing the forklift operator role?',
//     options: [
//         {
//             text: 'Yes',
//             nextNodeId: 'open_to_discuss',
//         },
//         {
//             text: 'No',
//             nextNodeId: null,
//         }
//     ]
// });

// interview.addNode({
//     id: 'open_to_discuss',
//     text: 'Great! I can send you some more information about the role and the application process.',
//     options: [
        
//     ]
// });

async function classifyUserMessage(userMessage: string, options: string[]) {
   try {

    console.log('userMessage', userMessage);
    console.log('options', options);

    if (!userMessage.trim()) {
        throw new Error('User message cannot be empty');
      }
      
      if (!options.length) {
        throw new Error('Options array cannot be empty');
      }

        // Format options for the prompt
    const formattedOptions = options
    .map((option, index) => `${index}: ${option}`)
    .join('\n');
  
  // Create the system prompt
  const systemPrompt = `
You are a classification assistant. Your task is to classify the user's message into exactly one of the provided options.
Choose the option that best matches the user's message.

Available options:
${formattedOptions}

Respond with the index of the selected option (0 to ${options.length - 1}).
You must select exactly one option.
`;

  // Make the API call with structured output
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [

        {
            role: 'system',
            content: systemPrompt
        }, {
            role: 'user',
            content: userMessage
        }

    ],
    response_format: zodResponseFormat(ClassificationSchema, 'option')
  });

  const optionIndex = response.choices[0].message.parsed?.selectedOptionIndex || 0;
  return optionIndex;

   } catch(err){
    console.error('Error classifying message:', err);
    
   }
}

export async function POST(req: Request) {

    const interview = new Interview('start');

interview.addNode({
    id: 'start',
    text: 'Hello! Are you currently open to discussing the forklift operator role?',
    options: [
        {
            text: 'Yes',
            nextNodeId: 'open_to_discuss',
        },
        {
            text: 'No',
            nextNodeId: null,
        }
    ]
});

interview.addNode({
    id: 'open_to_discuss',
    text: 'Great! I can send you some more information about the role and the application process.',
    options: [
        
    ]
});
    try {

        const {userMessage} = await req.json();
        const availableOptions = interview.getAvailableOptions();
        const optionIndex = await classifyUserMessage(userMessage.content, availableOptions);
        interview.processUserResponse(optionIndex || 0);
        const botMessageText = interview.getDialogueText();
        const response: ChatMessage = {role: 'assistant', content: botMessageText}
    
        return NextResponse.json(response);

    } catch(err){
        console.log(err);
        return NextResponse.json(
            {error: 'Failed to process your request'}, {status: 500}
        )
    }
    
};