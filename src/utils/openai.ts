import {OpenAI} from 'openai';
import {zodResponseFormat} from "openai/helpers/zod";
import {z} from "zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ClassificationSchema = z.object({
    selectedOptionIndex: z.number()
  });


export async function classifyUserMessage(userMessage: string, options: string[]) {
    if (options.length === 1){
        return 0
    }
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