'use server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path (two levels up from utils)
const dbPath = join(__dirname, '..', '..', 'chat_history.db');

export interface DBMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface DBConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

// Get database connection
async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// Create a new conversation
export async function createConversation(title: string): Promise<number> {
  const db = await getDb();
  try {
    const result = await db.run(
      'INSERT INTO conversations (title) VALUES (?)',
      title
    );
    if (result.lastID === undefined) {
      throw new Error('Failed to create conversation');
    }
    return result.lastID;
  } finally {
    await db.close();
  }
}

// Add a message to a conversation
export async function addMessage(
  conversationId: number,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<number> {
  const db = await getDb();
  try {
    // Update the conversation's updated_at timestamp
    await db.run(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      conversationId
    );
    
    // Insert the new message
    const result = await db.run(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      conversationId,
      role,
      content
    );
    if (result.lastID === undefined) {
      throw new Error('Failed to add message');
    }
    return result.lastID;
  } finally {
    await db.close();
  }
}

// Get all messages for a conversation
export async function getConversationMessages(conversationId: number): Promise<DBMessage[]> {
  const db = await getDb();
  try {
    return await db.all<DBMessage[]>(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      conversationId
    );
  } finally {
    await db.close();
  }
}

// Get conversations with pagination
export async function getConversations(page: number = 1, pageSize: number = 20): Promise<{
  conversations: DBConversation[];
  hasMore: boolean;
  total: number;
}> {
  const db = await getDb();
  try {
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const totalResult = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM conversations');
    const total = totalResult?.count || 0;

    // Get paginated conversations
    const conversations = await db.all<DBConversation[]>(
      'SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ? OFFSET ?',
      pageSize,
      offset
    );

    return {
      conversations,
      hasMore: offset + conversations.length < total,
      total
    };
  } finally {
    await db.close();
  }
}

// Delete a conversation and its messages
export async function deleteConversation(conversationId: number): Promise<void> {
  const db = await getDb();
  try {
    await db.run('DELETE FROM conversations WHERE id = ?', conversationId);
  } finally {
    await db.close();
  }
} 