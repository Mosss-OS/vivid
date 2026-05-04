-- Vivid App Database Schema for Supabase
-- This schema defines the tables needed for the Vivid Second Brain app

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Knowledge items table
create table knowledge_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth(id) on delete cascade,
  title text not null,
  content text not null,
  type text not null check (type in ('note', 'idea', 'task', 'insight', 'project', 'person', 'reference')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tags text[] default '{}',
  audio_url text,
  image_url text,
  pdf_url text,
  link_url text,
  is_favorite boolean default false
);

-- Indexes for better query performance
create index idx_knowledge_items_user_id on knowledge_items(user_id);
create index idx_knowledge_items_type on knowledge_items(type);
create index idx_knowledge_items_created_at on knowledge_items(created_at desc);
create index idx_knowledge_items_tags on knowledge_items using gin(tags);
create index idx_knowledge_items_is_favorite on knowledge_items(is_favorite) where is_favorite = true;

-- Enable row level security
alter table knowledge_items enable row level security;

-- Create policies for knowledge items
create policy "Users can view their own knowledge items"
  on knowledge_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own knowledge items"
  on knowledge_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own knowledge items"
  on knowledge_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own knowledge items"
  on knowledge_items for delete
  using (auth.uid() = user_id);

-- Updated at trigger
create trigger update_knowledge_items_updated_at
  before update on knowledge_items
  for each row
  execute procedure moddatetime (updated_at);

-- Create moddatetime function if it doesn't exist
create or replace function moddatetime(column_name text default 'updated_at'::text)
  returns trigger as $$
begin
  new.$1 := now();
  return new;
end;
$$ language 'plpgsql';