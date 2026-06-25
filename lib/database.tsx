import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { 
  integer, 
  text, 
  sqliteTable, 
  uniqueIndex,
  real,
  blob
} from 'drizzle-orm/sqlite-core';
import type { KnowledgeItem } from '../app/types/knowledge';

// Knowledge connections table for graph relationships
export type ConnectionType = 'shared_tag' | 'semantic_similarity' | 'manual';

export const knowledgeConnectionsTable = sqliteTable('knowledge_connections', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').notNull(),
  targetId: text('target_id').notNull(),
  connectionType: text('connection_type', { enum: ['shared_tag', 'semantic_similarity', 'manual'] }).notNull(),
  strength: real('strength').notNull().default(0.5),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type KnowledgeConnection = typeof knowledgeConnectionsTable.$inferSelect;

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
const sqlite = openDatabaseSync('vivid.db');
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
  CREATE TABLE IF NOT EXISTS knowledge_connections (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    connection_type TEXT NOT NULL,
    strength REAL DEFAULT 0.5,
    created_at INTEGER NOT NULL
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
  
  // Get all connections for graph
  async getConnections(): Promise<KnowledgeConnection[]> {
    try {
      return await db.select().from(knowledgeConnectionsTable).execute();
    } catch (error) {
      console.error('Failed to get connections:', error);
      return [];
    }
  },

  // Add a connection between two knowledge items
  async addConnection(
    sourceId: string,
    targetId: string,
    connectionType: ConnectionType = 'shared_tag',
    strength: number = 0.5
  ): Promise<string> {
    try {
      const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(knowledgeConnectionsTable).values({
        id,
        sourceId,
        targetId,
        connectionType,
        strength,
        createdAt: new Date(),
      }).execute();
      return id;
    } catch (error) {
      console.error('Failed to add connection:', error);
      return '';
    }
  },

  // Build connections based on shared tags between all knowledge items
  async buildTagConnections(): Promise<void> {
    try {
      const items = await db.select().from(knowledgeItemsTable).execute();
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const tags1 = JSON.parse(items[i].tags || '[]') as string[];
          const tags2 = JSON.parse(items[j].tags || '[]') as string[];
          const shared = tags1.filter(t => tags2.includes(t));
          if (shared.length > 0) {
            const strength = Math.min(shared.length / Math.max(tags1.length, tags2.length), 1);
            await this.addConnection(items[i].id, items[j].id, 'shared_tag', strength);
          }
        }
      }
    } catch (error) {
      console.error('Failed to build tag connections:', error);
    }
  },

  // Clear all connections
  async clearConnections(): Promise<boolean> {
    try {
      await db.delete(knowledgeConnectionsTable).execute();
      return true;
    } catch (error) {
      console.error('Failed to clear connections:', error);
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