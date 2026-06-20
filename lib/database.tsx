import { SQLite } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { 
  integer, 
  text, 
  sqliteTable, 
  uniqueIndex,
  real,
  blob
} from 'drizzle-orm/sqlite-core';
import type { KnowledgeItem } from '../types/knowledge';

// Database schema definition
export const knowledgeItemsTable = sqliteTable('knowledge_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type', { enum: ['note', 'idea', 'task', 'insight', 'project', 'person', 'reference'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  tags: text('tags', { mode: 'json' }).notNull().default('[]'),
  audioUrl: text('audio_url'),
  imageUrl: text('image_url'),
  pdfUrl: text('pdf_url'),
  linkUrl: text('link_url'),
  detectedLanguage: text('detected_language'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  synced: integer('synced', { mode: 'boolean' }).notNull().default(false), // For offline sync tracking
  syncId: text('sync_id'), // Reference to Supabase ID when synced
});

// Export types for use in drizzle
export type KnowledgeItemDB = typeof knowledgeItemsTable.$inferSelect;
export type NewKnowledgeItem = typeof knowledgeItemsTable.$inferInsert;

// Initialize database
const sqlite = SQLite.openDatabase('vivid.db');
export const db = drizzle(sqlite);

// Create table if not exists (raw SQL for initial setup)
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS knowledge_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    tags TEXT DEFAULT '[]',
    audio_url TEXT,
    image_url TEXT,
    pdf_url TEXT,
    link_url TEXT,
    detected_language TEXT,
    is_favorite INTEGER DEFAULT 0,
    synced INTEGER DEFAULT 0,
    sync_id TEXT
  );
`);

// Database operations
export const knowledgeDb = {
  // Initialize database (create tables if they don't exist)
  async init() {
    try {
      // Tables are created automatically by drizzle when we first use them
      // But we can execute raw SQL if needed for migrations
      console.log('Database initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  },
  
  // Get all knowledge items for a user
  async getItems(userId: string): Promise<KnowledgeItem[]> {
    try {
      const items = await db.select().from(knowledgeItemsTable).where(
        // Note: drizzle-orm/expo-sqlite might have slightly different syntax
        // This is the conceptual approach
      ).execute();
      
      // Transform to our KnowledgeItem type
      return items.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as KnowledgeItem['type'],
        createdAt: new Date(item.createdAt),
        tags: JSON.parse(item.tags),
        audioUrl: item.audioUrl,
        imageUrl: item.imageUrl,
        pdfUrl: item.pdfUrl,
        linkUrl: item.linkUrl,
        detectedLanguage: item.detectedLanguage,
        isFavorite: !!item.isFavorite,
      }));
    } catch (error) {
      console.error('Failed to get knowledge items from local DB:', error);
      return [];
    }
  },
  
  // Get a single knowledge item
  async getItem(id: string): Promise<KnowledgeItem | null> {
    try {
      const items = await db.select().from(knowledgeItemsTable).where(
        // eq(knowledgeItemsTable.id, id)
      ).execute();
      
      if (items.length === 0) return null;
      
      const item = items[0];
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as KnowledgeItem['type'],
        createdAt: new Date(item.createdAt),
        tags: JSON.parse(item.tags),
        audioUrl: item.audioUrl,
        imageUrl: item.imageUrl,
        pdfUrl: item.pdfUrl,
        linkUrl: item.linkUrl,
        detectedLanguage: item.detectedLanguage,
        isFavorite: !!item.isFavorite,
      };
    } catch (error) {
      console.error('Failed to get knowledge item from local DB:', error);
      return null;
    }
  },
  
  // Create a new knowledge item
  async createItem(item: Omit<KnowledgeItem, 'id'>): Promise<string> {
    try {
      const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(knowledgeItemsTable).values({
        id,
        userId: item.userId || 'anonymous', // In real app, get from auth
        title: item.title,
        content: item.content,
        type: item.type,
        createdAt: item.createdAt.getTime(),
        updatedAt: item.updatedAt.getTime(),
        tags: JSON.stringify(item.tags),
        audioUrl: item.audioUrl,
        imageUrl: item.imageUrl,
        pdfUrl: item.pdfUrl,
        linkUrl: item.linkUrl,
        detectedLanguage: item.detectedLanguage,
        isFavorite: item.isFavorite ? 1 : 0,
        synced: 0, // Not synced yet
      }).execute();
      
      return id;
    } catch (error) {
      console.error('Failed to create knowledge item in local DB:', error);
      throw error;
    }
  },
  
  // Update a knowledge item
  async updateItem(id: string, updates: Partial<KnowledgeItem>): Promise<boolean> {
    try {
      await db.update(knowledgeItemsTable)
        .set({
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.content !== undefined && { content: updates.content }),
          ...(updates.type !== undefined && { type: updates.type }),
          ...(updates.tags !== undefined && { tags: JSON.stringify(updates.tags) }),
          ...(updates.audioUrl !== undefined && { audioUrl: updates.audioUrl }),
          ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
          ...(updates.pdfUrl !== undefined && { pdfUrl: updates.pdfUrl }),
          ...(updates.linkUrl !== undefined && { linkUrl: updates.linkUrl }),
          ...(updates.detectedLanguage !== undefined && { detectedLanguage: updates.detectedLanguage }),
          ...(updates.isFavorite !== undefined && { isFavorite: updates.isFavorite ? 1 : 0 }),
          updatedAt: Date.now(),
        })
        .where(/* eq(knowledgeItemsTable.id, id) */)
        .execute();
      
      return true;
    } catch (error) {
      console.error('Failed to update knowledge item in local DB:', error);
      return false;
    }
  },
  
  // Delete a knowledge item
  async deleteItem(id: string): Promise<boolean> {
    try {
      await db.delete(knowledgeItemsTable)
        .where(/* eq(knowledgeItemsTable.id, id) */)
        .execute();
      
      return true;
    } catch (error) {
      console.error('Failed to delete knowledge item from local DB:', error);
      return false;
    }
  },
  
  // Get unsynced items for syncing to Supabase
  async getUnsyncedItems(): Promise<KnowledgeItemDB[]> {
    try {
      const items = await db.select().from(knowledgeItemsTable).where(
        // eq(knowledgeItemsTable.synced, 0)
      ).execute();
      return items;
    } catch (error) {
      console.error('Failed to get unsynced items:', error);
      return [];
    }
  },
  
  // Mark items as synced
  async markAsSynced(ids: string[]): Promise<boolean> {
    try {
      await db.update(knowledgeItemsTable)
        .set({ synced: 1 })
        .where(/* in(knowledgeItemsTable.id, ids) */)
        .execute();
      
      return true;
    } catch (error) {
      console.error('Failed to mark items as synced:', error);
      return false;
    }
  },
  
  // Clear all data (for testing/logout)
  async clear(): Promise<boolean> {
    try {
      await db.delete(knowledgeItemsTable).execute();
      return true;
    } catch (error) {
      console.error('Failed to clear database:', error);
      return false;
    }
  }
};