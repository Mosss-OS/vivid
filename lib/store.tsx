import { create } from 'zustand';
import { supabase } from './supabase';
import { knowledgeDb } from './database';
import type { KnowledgeItem } from '../types/knowledge';

// Define the store interface
interface KnowledgeState {
  items: KnowledgeItem[];
  loading: boolean;
  error: string | null;
  currentUserId: string | null;
  
  // Actions
  setItems: (items: KnowledgeItem[]) => void;
  addItem: (item: KnowledgeItem) => void;
  updateItem: (id: string, updates: Partial<KnowledgeItem>) => void;
  deleteItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentUserId: (userId: string | null) => void;
  
  // Async actions
  init: () => Promise<void>;
  saveItems: () => Promise<void>;
  fetchItems: () => Promise<void>;
  createItem: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

// Create the store
export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  currentUserId: null,
  
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) => 
    set((state) => ({
      items: state.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    })),
  deleteItem: (id) => 
    set((state) => ({
      items: state.items.filter(item => item.id !== id)
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentUserId: (userId) => set({ currentUserId: userId }),
  
  // Initialize: load current user and items from local DB
  init: async () => {
    set({ loading: true, error: null });
    try {
      // Initialize database first
      await knowledgeDb.init();
      
      // Get current user from Supabase (optional)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          set({ currentUserId: user.id });
        }
      } catch (authError) {
        console.log('No authenticated user, using anonymous mode');
      }
      
      // Load items from local database
      const userId = get().currentUserId || 'anonymous';
      const items = await knowledgeDb.getItems(userId);
      set({ items, loading: false });
    } catch (error: any) {
      console.error('Failed to initialize knowledge store:', error);
      // Don't show error, just set loading to false and continue
      set({ 
        loading: false, 
        error: null
      });
    }
  },
  
  // Save current items to local database
  saveItems: async () => {
    const { items, currentUserId } = get();
    if (!currentUserId) return;
    
    set({ loading: true, error: null });
    try {
      // Clear existing items for this user and re-add all
      // In a real app, we would do upserts or track changes
      await knowledgeDb.clear(); // Be careful in production!
      
      // Add each item
      for (const item of items) {
        await knowledgeDb.createItem({
          ...item,
          userId: currentUserId,
        });
      }
      
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to save items to local DB:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to save knowledge items' 
      });
    }
  },
  
  // Fetch items from local database (wrapper for init's loading part)
  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const { currentUserId } = get();
      const items = await knowledgeDb.getItems(currentUserId || 'anonymous');
      set({ items, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch knowledge items:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to load knowledge items' 
      });
    }
  },
  
  // Create a new item (optimistic update)
  createItem: async (itemData) => {
    set({ loading: true, error: null });
    try {
      const { currentUserId } = get();
      if (!currentUserId) {
        set({ loading: false, error: 'No authenticated user' });
        return;
      }
      
      // Create item locally first (optimistic)
      const tempId = `temp_${Date.now()}`;
      const tempItem: KnowledgeItem = {
        id: tempId,
        title: itemData.title,
        content: itemData.content,
        type: itemData.type,
        createdAt: new Date(),
        tags: itemData.tags,
        audioUrl: itemData.audioUrl,
        imageUrl: itemData.imageUrl,
        pdfUrl: itemData.pdfUrl,
        linkUrl: itemData.linkUrl,
        isFavorite: itemData.isFavorite,
      };
      
      // Add optimistically
      get().addItem(tempItem);
      
      // Save to local DB
      const id = await knowledgeDb.createItem({
        ...itemData,
        userId: currentUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Update the item with the real ID
      get().updateItem(tempId, { id });
      
      // Save to local DB (update the item with the real ID)
      await get().saveItems();
      
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to create knowledge item:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to create knowledge item' 
      });
      // Remove the optimistic item on error
      get().deleteItem(`temp_${Date.now()}`); // This is not ideal, but for demo
    }
  },
  
  // Sync local database with Supabase
  syncWithSupabase: async () => {
    const { currentUserId } = get();
    if (!currentUserId) return;
    
    set({ loading: true, error: null });
    try {
      // 1. Get unsynced items from local DB
      const unsyncedItems = await knowledgeDb.getUnsyncedItems();
      
      // 2. Upload unsynced items to Supabase
      for (const item of unsyncedItems) {
        await supabase
          .from('knowledge_items')
          .upsert({
            id: item.id,
            user_id: currentUserId,
            title: item.title,
            content: item.content,
            type: item.type,
            created_at: item.createdAt.toISOString(),
            updated_at: item.updatedAt.toISOString(),
            tags: item.tags,
            audio_url: item.audioUrl,
            image_url: item.imageUrl,
            pdf_url: item.pdfUrl,
            link_url: item.linkUrl,
            is_favorite: item.isFavorite,
          });
      }
      
      // 3. Mark local items as synced
      if (unsyncedItems.length > 0) {
        const ids = unsyncedItems.map(item => item.id);
        await knowledgeDb.markAsSynced(ids);
      }
      
      // 4. Fetch latest from Supabase to ensure we have everything
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform and set items
      const transformedItems: KnowledgeItem[] = data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as KnowledgeItem['type'],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        tags: item.tags || [],
        audioUrl: item.audio_url,
        imageUrl: item.image_url,
        pdfUrl: item.pdf_url,
        linkUrl: item.link_url,
        isFavorite: item.is_favorite,
      }));
      
      set({ items: transformedItems });
      
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to sync with Supabase:', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to sync with Supabase' 
      });
    }
  },
  
  // Background sync (can be called periodically or on app focus)
  backgroundSync: async () => {
    const { currentUserId, items } = get();
    if (!currentUserId) return;
    
    try {
      // Quick check: are there unsynced items?
      const unsyncedItems = await knowledgeDb.getUnsyncedItems();
      if (unsyncedItems.length > 0) {
        console.log(`Background sync: ${unsyncedItems.length} items to sync`);
        await get().syncWithSupabase();
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}));