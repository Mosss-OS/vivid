import type { KnowledgeItem } from '../app/(tabs)/types/knowledge';

export function getDemoItems(): KnowledgeItem[] {
  return [
    {
      id: 1,
      userId: 'demo-user',
      type: 'text',
      content: 'Just discovered the concept of "atomic habits" - the idea that tiny changes can lead to remarkable results. Starting with just 2 minutes of reading daily.',
      rawText: 'Just discovered the concept of "atomic habits"',
      tags: ['learning', 'productivity', 'habits'],
      category: 'Ideas',
      embedding: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: true,
    },
    {
      id: 2,
      userId: 'demo-user',
      type: 'voice',
      content: 'Voice memo: Had a breakthrough on the project architecture today. Realized we should use a modular approach with clear separation of concerns. This will make testing much easier.',
      rawText: 'Voice memo: breakthrough on project architecture',
      tags: ['work', 'architecture', 'insights'],
      category: 'Projects',
      embedding: [],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      synced: true,
    },
    {
      id: 3,
      userId: 'demo-user',
      type: 'link',
      content: 'https://example.com/article/on-deep-work\n\nFascinating article on deep work practices. Key takeaway: Schedule blocks of 90-120 minutes for focused work. No notifications, no distractions.',
      rawText: 'https://example.com/article/on-deep-work',
      tags: ['productivity', 'focus', 'reading'],
      category: 'All Notes',
      embedding: [],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      synced: true,
    },
    {
      id: 4,
      userId: 'demo-user',
      type: 'text',
      content: 'Task extracted: Review project proposal by Friday. Need to prepare slides and budget estimate.',
      rawText: 'Task: Review project proposal by Friday',
      tags: ['tasks', 'work', 'deadline'],
      category: 'Tasks',
      embedding: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      synced: true,
    },
    {
      id: 5,
      userId: 'demo-user',
      type: 'image',
      content: 'Photo: Whiteboard sketch of the new feature flow. Shows user journey from capture to AI insights.',
      rawText: 'Photo: Whiteboard sketch',
      tags: ['design', 'ideas', 'visual'],
      category: 'Ideas',
      embedding: [],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      synced: true,
    },
  ];
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('demo') === 'true';
}
