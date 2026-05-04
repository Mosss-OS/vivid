import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google-ai/generativelanguage';

// Initialize AI clients
const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || 'dummy_key_for_dev';
const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'dummy_key_for_dev';

// Initialize Groq client (primary)
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

// Initialize Gemini client (fallback)
const gemini = geminiApiKey 
  ? new GoogleGenerativeAI({ apiKey: geminiApiKey })
  : null;

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
};

// AI Service Class
export class AIService {
  // Tag and categorize content
  static async tagContent(content: string): Promise<TaggingResult> {
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

  // Generate chat response with RAG
  static async generateChatResponse(
    message: string,
    knowledgeItems: Array<any>,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<ChatResponse> {
    try {
      // Try Groq first
      if (groq) {
        // Prepare context from knowledge items
        const context = knowledgeItems
          .map(item => `- ${item.title}: ${item.content.substring(0, 200)}...`)
          .join('\n');

        // Build messages array with conversation history
        const messages = [
          {
            role: "system",
            content: `You are Vivid, an AI-powered Second Brain assistant. 
                      Use the provided knowledge items to answer the user's question. 
                      Always cite specific items when referencing information by mentioning the title.
                      If you don't know something from the knowledge base, say so.
                      Keep responses concise but informative.`
          },
          // Add conversation history for context
          ...conversationHistory.map(msg => ({
            role: msg.role === 'assistant' ? "assistant" : "user",
            content: msg.content
          })),
          {
            role: "user",
            content: `Knowledge Base:\n${context}\n\nQuestion: ${message}`
          }
        ];

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
              content: `Knowledge Base:\n${context}\n\nQuestion: ${message}`
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.7,
          max_tokens: 500
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Extract citations (simplified - in reality would be more sophisticated)
        const citations = knowledgeItems
          .slice(0, 3) // Top 3 most relevant
          .map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            relevance: 0.9 - (knowledgeItems.indexOf(item) * 0.1) // Decreasing relevance
          }));

        return {
          response: aiResponse,
          citations: citations,
          suggestedFollowUps: [
            "Can you elaborate on that?",
            "What else do I have on this topic?",
            "How does this connect to my other notes?"
          ]
        };
      }
    } catch (groqError) {
      console.warn('Groq API failed for chat, trying Gemini:', groqError);
    }

    try {
        // Fallback to Gemini for chat
        if (gemini) {
          const model = gemini.getGenerativeModel({ model: "gemini-pro" });
          
          // Prepare context
          const context = knowledgeItems
            .map(item => `- ${item.title}: ${item.content.substring(0, 200)}...`)
            .join('\n');
          
          // Build conversation history for Gemini
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
            
            Question: ${message}
          `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();
        
        // Extract citations (simplified)
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
          ]
        };
      }
    } catch (geminiError) {
      console.error('Gemini API also failed for chat:', geminiError);
    }

    // Final fallback - basic response based on knowledge items
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
        response: "I don't see any specific information about that in your knowledge base yet. Try capturing some notes first, or ask about something else!",
        citations: [],
        suggestedFollowUps: [
          "What do I have in my knowledge base?",
          "Help me capture a new note",
          "Show me my recent items"
        ]
      };
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