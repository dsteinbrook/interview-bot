import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database will be created in the root of the project (two levels up from utils)
const dbPath = join(__dirname, '..', '..', 'chat_history.db');

async function createDatabase() {
  try {
    // Open the database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create conversations table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER,
        role TEXT CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);
    `);

    console.log('Database setup completed successfully');
    await db.close();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the database creation
createDatabase();
