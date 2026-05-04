import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type KnowledgeItem = {
  id: string
  title: string
  content: string
  type: 'note' | 'idea' | 'task' | 'insight' | 'project' | 'person' | 'reference'
  created_at: string
  updated_at: string
  tags: string[]
  audio_url?: string | null
  image_url?: string | null
  pdf_url?: string | null
  link_url?: string | null
  is_favorite: boolean
  user_id: string
}

// Knowledge item with relations
export type KnowledgeItemWithRelations = KnowledgeItem & {}

// Database functions
export const knowledgeApi = {
  // Get all knowledge items for a user
  getItems: async (userId: string) => {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as KnowledgeItem[]
  },

  // Get a single knowledge item
  getItem: async (id: string) => {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as KnowledgeItem
  },

  // Create a new knowledge item
  createItem: async (item: Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at' | 'user_id'> & { user_id: string }) => {
    const { data, error } = await supabase
      .from('knowledge_items')
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data as KnowledgeItem
  },

  // Update a knowledge item
  updateItem: async (id: string, updates: Partial<KnowledgeItem>) => {
    const { data, error } = await supabase
      .from('knowledge_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as KnowledgeItem
  },

  // Delete a knowledge item
  deleteItem: async (id: string) => {
    const { error } = await supabase
      .from('knowledge_items')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  },

  // Toggle favorite status
  toggleFavorite: async (id: string, isFavorite: boolean) => {
    const { data, error } = await supabase
      .from('knowledge_items')
      .update({ is_favorite: !isFavorite })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as KnowledgeItem
  },

  // Search knowledge items
  searchItems: async (userId: string, query: string) => {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as KnowledgeItem[]
  },

  // Get items by type
  getItemsByType: async (userId: string, type: KnowledgeItem['type']) => {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as KnowledgeItem[]
  }
}