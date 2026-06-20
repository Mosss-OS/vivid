import { Groq } from 'groq';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { detectLanguage, translateText, isIndianLanguage } from './sarvam';
import { getApiKey } from './secureConfig';

let groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || 'dummy_key_for_dev';
let geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'dummy_key_for_dev';

// Initialize clients lazily
let groq: Groq | null = null;
let gemini: GoogleGenerativeAI | null = null;

async function initClients() {
  const storedGroqKey = await getApiKey('GROQ_API_KEY');
  const storedGeminiKey = await getApiKey('GEMINI_API_KEY');
  groqApiKey = storedGroqKey || groqApiKey;
  geminiApiKey = storedGeminiKey || geminiApiKey;
  groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
  gemini = geminiApiKey ? new GoogleGenerativeAI({ apiKey: geminiApiKey }) : null;
}

initClients();

// Rate limiting
const requestLog: Array<{ timestamp: number; tokens: number }> = [];
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_TOKENS_PER_DAY = 10000;
let dailyTokensUsed = 0;
let dailyResetTime = new Date().setHours(24, 0, 0, 0);

function canMakeRequest(tokens: number = 100): boolean {
  const now = Date.now();
  
  // Reset daily tokens if needed
  if (now > dailyResetTime) {
    dailyTokensUsed = 0;
    dailyResetTime = new Date().setHours(24, 0, 0, 0);
  }
  
  // Check daily token limit
  if (dailyTokensUsed + tokens > MAX_TOKENS_PER_DAY) {
    console.warn('Daily token limit reached');
    return false;
  }
  
  // Check per-minute rate limit
  const oneMinuteAgo = now - 60000;
  const recentRequests = requestLog.filter(req => req.timestamp > oneMinuteAgo);
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    console.warn('Rate limit reached');
    return false;
  }
  
  return true;
}

function logRequest(tokens: number = 100) {
  const now = Date.now();
  requestLog.push({ timestamp: now, tokens });
  dailyTokensUsed += tokens;
  
  // Clean up old entries
  const fiveMinutesAgo = now - 300000;
  const index = requestLog.findIndex(req => req.timestamp < fiveMinutesAgo);
  if (index > -1) {
    requestLog.splice(0, index + 1);
  }
}

// Types for AI responses
export type TaggingResult = {
  tags: string[];
  category: 'note' | 'idea' | 'task' | 'insight' | 'project' | 'person' | 'reference';
  summary?: string;
};

export type ChatResponse = {
  response: string;
  citations: Array<{
    id: string;
    title: string;
    type: string;
    relevance: number;
  }>;
  suggestedFollowUps?: string[];
  detectedLanguage?: string;
  originalLanguage?: string;
};

// AI Service Class
export class AIService {
  // Tag and categorize content
  static async tagContent(content: string): Promise<TaggingResult> {
    // Check rate limits
    if (!canMakeRequest(50)) {
      console.warn('Rate limit exceeded, using fallback tagging');
      return AIService.basicTagging(content);
    }
    
    try {
      // Try Groq first
      if (groq) {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that tags and categorizes personal knowledge items. Analyze the content and return relevant tags and a category. Categories: note, idea, task, insight, project, person, reference. Return JSON with tags array and category string."
            },
            {
              role: "user",
              content: `Analyze this content and provide tags and category:\n\n${content}`
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.3,
          max_tokens: 200,
          response_format: { type: "json_object" }
        });

        logRequest(50);
        const result = JSON.parse(completion.choices[0].message.content);
        return {
          tags: result.tags || [],
          category: result.category as TaggingResult['category'] || 'note',
          summary: result.summary
        };
      }
    } catch (groqError) {
      console.warn('Groq API failed, trying Gemini:', groqError);
    }

    try {
      // Fallback to Gemini
      if (gemini) {
        const model = gemini.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
          You are an AI assistant that tags and categorizes personal knowledge items. 
          Analyze the content and return relevant tags and a category.
          Categories: note, idea, task, insight, project, person, reference.
          Return JSON with tags array and category string.
          
          Content: ${content}
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            tags: parsed.tags || [],
            category: parsed.category as TaggingResult['category'] || 'note',
            summary: parsed.summary
          };
        }
        
        // Fallback if JSON parsing fails
        return {
          tags: ['general'],
          category: 'note' as const
        };
      }
    } catch (geminiError) {
      console.error('Gemini API also failed:', geminiError);
    }

    // Final fallback - basic keyword extraction
    return AIService.basicTagging(content);
  }

  // Generate chat response with RAG and multilingual support
  static async generateChatResponse(
    message: string,
    knowledgeItems: Array<any>,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<ChatResponse> {
    let originalLanguage = 'en-IN';
    let detectedLang = 'en-IN';

    try {
      detectedLang = await detectLanguage(message);
      originalLanguage = detectedLang;
    } catch (error) {
      console.warn('Language detection failed, defaulting to English:', error);
    }

    const needsTranslation = isIndianLanguage(detectedLang) && detectedLang !== 'en-IN';
    const queryForRag = needsTranslation
      ? await translateText(message, detectedLang, 'en-IN')
      : message;

    try {
      if (groq) {
        const context = knowledgeItems
          .map(item => `- ${item.title}: ${item.content.substring(0, 200)}...`)
          .join('\n');

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are Vivid, an AI-powered Second Brain assistant. You help users find information in their personal knowledge base. 
              Use the provided knowledge items to answer the user's question. 
              Always cite specific items when referencing information.
              If you don't know something from the knowledge base, say so.
              Keep responses concise but informative.`
            },
            {
              role: "user",
              content: `Knowledge Base:\n${context}\n\nQuestion: ${queryForRag}`
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.7,
          max_tokens: 500
        });

        let aiResponse = completion.choices[0].message.content;

        if (needsTranslation) {
          aiResponse = await translateText(aiResponse, 'en-IN', detectedLang);
        }

        const citations = knowledgeItems
          .slice(0, 3)
          .map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            relevance: 0.9 - (knowledgeItems.indexOf(item) * 0.1)
          }));

        return {
          response: aiResponse,
          citations: citations,
          suggestedFollowUps: [
            "Can you elaborate on that?",
            "What else do I have on this topic?",
            "How does this connect to my other notes?"
          ],
          detectedLanguage: detectedLang,
          originalLanguage,
        };
      }
    } catch (groqError) {
      console.warn('Groq API failed for chat, trying Gemini:', groqError);
    }

    try {
      if (gemini) {
        const model = gemini.getGenerativeModel({ model: "gemini-pro" });
        const context = knowledgeItems
          .map(item => `- ${item.title}: ${item.content.substring(0, 200)}...`)
          .join('\n');

        const historyText = conversationHistory
          .map(msg => `${msg.role === 'user' ? 'User' : 'Vivid'}: ${msg.content}`)
          .join('\n');

        const prompt = `
          You are Vivid, an AI-powered Second Brain assistant. 
          Use the provided knowledge items to answer the user's question. 
          Always cite specific items when referencing information.
          If you don't know something from the knowledge base, say so.
          Keep responses concise but informative.
          
          Previous Conversation:
          ${historyText}
          
          Knowledge Base:
          ${context}
          
          Question: ${queryForRag}
        `;

        const result = await model.generateContent(prompt);
        const aiResult = await result.response;
        let aiResponse = aiResult.text();

        if (needsTranslation) {
          aiResponse = await translateText(aiResponse, 'en-IN', detectedLang);
        }

        const citations = knowledgeItems
          .slice(0, 3)
          .map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            relevance: 0.9 - (knowledgeItems.indexOf(item) * 0.1)
          }));

        return {
          response: aiResponse,
          citations: citations,
          suggestedFollowUps: [
            "Tell me more about this",
            "What are related topics?",
            "Any action items from this?"
          ],
          detectedLanguage: detectedLang,
          originalLanguage,
        };
      }
    } catch (geminiError) {
      console.error('Gemini API also failed for chat:', geminiError);
    }

    return AIService.basicChatResponse(message, knowledgeItems);
  }

  // Basic tagging fallback
  private static basicTagging(content: string): TaggingResult {
    const lowerContent = content.toLowerCase();
    
    // Simple keyword-based categorization
    if (lowerContent.includes('task') || lowerContent.includes('todo') || lowerContent.includes('need to')) {
      return {
        tags: ['task', 'todo'],
        category: 'task' as const
      };
    }
    
    if (lowerContent.includes('idea') || lowerContent.includes('think') || lowerContent.includes('maybe')) {
      return {
        tags: ['idea', 'thought'],
        category: 'idea' as const
      };
    }
    
    if (lowerContent.includes('learn') || lowerContent.includes('discover') || lowerContent.includes('realize')) {
      return {
        tags: ['insight', 'learning'],
        category: 'insight' as const
      };
    }
    
    if (lowerContent.includes('project') || lowerContent.includes('build') || lowerContent.includes('develop')) {
      return {
        tags: ['project', 'work'],
        category: 'project' as const
      };
    }
    
    if (lowerContent.includes('person') || lowerContent.includes('met') || lowerContent.includes('talked to')) {
      return {
        tags: ['person', 'contact'],
        category: 'person' as const
      };
    }
    
    if (lowerContent.includes('http') || lowerContent.includes('www.') || lowerContent.includes('.com')) {
      return {
        tags: ['reference', 'link'],
        category: 'reference' as const
      };
    }
    
    return {
      tags: ['general', 'note'],
      category: 'note' as const
    };
  }

  // Basic chat fallback
  private static basicChatResponse(
    message: string,
    knowledgeItems: Array<any>
  ): ChatResponse {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword matching
    const relevantItems = knowledgeItems.filter(item => 
      item.title.toLowerCase().includes(lowerMessage) ||
      item.content.toLowerCase().includes(lowerMessage) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerMessage))
    );
    
    if (relevantItems.length === 0) {
    return {
      response: response,
      citations: [],
      suggestedFollowUps: [
        "What do I have in my knowledge base?",
        "Help me capture a new note",
        "Show me my recent items"
      ]
    };
  }

  // Extract tasks from notes using AI
  static async extractTasks(content: string): Promise<Array<{ title: string; description: string; dueDate?: string }>> {
    try {
      if (groq) {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a task extraction AI. Analyze the content and extract any tasks, action items, or to-dos. Return JSON array with title, description, and optional dueDate fields."
            },
            {
              role: "user",
              content: `Extract tasks from this content:\n\n${content}`
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.3,
          max_tokens: 300,
          response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return result.tasks || [];
      }
    } catch (error) {
      console.error('Task extraction failed:', error);
    }

    // Fallback: simple keyword-based extraction
    return AIService.basicTaskExtraction(content);
  }

  // Basic task extraction fallback
  private static basicTaskExtraction(content: string): Array<{ title: string; description: string }> {
    const tasks: Array<{ title: string; description: string }> = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('todo') || lowerContent.includes('task') || lowerContent.includes('need to')) {
      tasks.push({
        title: 'Extracted Task',
        description: content.substring(0, 100)
      });
    }
    
    return tasks;
  }
}
    
    // Generate simple response
    const response = `I found ${relevantItems.length} relevant item${relevantItems.length > 1 ? 's' : ''} in your knowledge base:\n\n` +
      relevantItems.slice(0, 3).map((item, index) => 
        `${index + 1}. ${item.title} (${item.type}) - ${item.content.substring(0, 100)}...`
      ).join('\n\n');
    
    const citations = relevantItems
      .slice(0, 3)
      .map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        relevance: 0.9 - (relevantItems.indexOf(item) * 0.1)
      }));
    
    return {
      response,
      citations: citations,
      suggestedFollowUps: [
        "Can you tell me more about the first item?",
        "How are these related?",
        "Any action items from this?"
      ]
    };
  }
}