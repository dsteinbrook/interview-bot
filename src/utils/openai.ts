import {OpenAI} from 'openai';
import {zodResponseFormat} from "openai/helpers/zod";
import {z} from "zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

//schema for structured format of classifyUserMessage function
const ClassificationSchema = z.object({
    selectedOptionIndex: z.number()
  });

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }


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

 export async function answerUserQuestion(previousMessages: ChatMessage[]){
    try {

        const systemPrompt = `You are conducting an interview for a forklift operator role in New Jersey. Answer the user's question about the role based on the following job description. If you are not able to answer, inform the user that you are not able to answer their question.

        Job Title: Forklift Operator

        Location: Jersey City, NJ / Trenton, NJ
        Company: [Company Name]
        Job Type: Full-time

        Job Description:
        We are seeking a reliable and safety-conscious Forklift Operator to join our team at [Company Name]. As a Forklift Operator, you will play a key role in ensuring smooth and efficient warehouse operations. You will be responsible for moving materials, loading/unloading shipments, and maintaining a safe working environment while operating various types of forklifts.

        Key Responsibilities:

        Operate sit-down and stand-up forklifts to move materials throughout the warehouse.
        Load and unload shipments from trucks and containers.
        Organize and stack inventory in designated areas to ensure efficient storage.
        Inspect and maintain forklift equipment to ensure it is in good working condition.
        Safely handle goods and materials, ensuring proper stacking and placement to prevent damage.
        Follow all safety protocols and comply with OSHA regulations.
        Assist with inventory control, including periodic stock counts and reporting discrepancies.
        Perform other warehouse duties as assigned.
        Qualifications:

        High school diploma or GED.
        Valid forklift certification (or willing to obtain upon hire).
        Prior experience operating forklifts in a warehouse or industrial setting preferred.
        Strong attention to detail and ability to maintain accurate records.
        Ability to work in a fast-paced environment and meet deadlines.
        Excellent communication and teamwork skills.
        Must be able to lift up to 50 lbs and stand for extended periods.
        Availability to work in Jersey City or Trenton, NJ.
        Working Conditions:

        Full-time position.
        Monday through Friday, with occasional overtime based on business needs.
        Warehouse environment with potential exposure to loud noise, temperature changes, and heavy machinery.
        Benefits:

        Competitive pay and overtime opportunities.
        Health, dental, and vision insurance.
        Paid time off (PTO) and holidays.
        401(k) with company match.
        Training and development opportunities.`;

        const messages = [{role: 'system', content: systemPrompt}, ...previousMessages] as ChatMessage[];

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages.map((msg: ChatMessage) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: 0.1,
          });
        
          const assistantMessage = response.choices[0].message;

          if (!assistantMessage.content) {
            throw new Error('No content in assistant response');
          }

          return assistantMessage;

    } catch (err) {
        console.log(err);
    }
   
 }