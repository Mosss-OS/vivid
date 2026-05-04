export type KnowledgeType = 'note' | 'idea' | 'task' | 'insight' | 'project' | 'person' | 'reference';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  createdAt: Date;
  tags: string[];
  audioUrl?: string;
  imageUrl?: string;
  pdfUrl?: string;
  linkUrl?: string;
  isFavorite?: boolean;
}