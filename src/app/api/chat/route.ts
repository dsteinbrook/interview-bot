import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { addMessage } from '@/utils/db';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0].message;
    
    if (!assistantMessage.content) {
      throw new Error('No content in assistant response');
    }

    // Save both the user's last message and the assistant's response to the database
    const lastUserMessage = messages[messages.length - 1];
    await addMessage(conversationId, lastUserMessage.role, lastUserMessage.content);
    await addMessage(conversationId, 'assistant', assistantMessage.content);

    return NextResponse.json(assistantMessage);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
} 