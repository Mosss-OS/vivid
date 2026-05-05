import * as Print from 'expo-print';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

interface Note {
  id: number;
  content: string;
  type: string;
  createdAt: string;
  tags?: string[];
}

export async function exportToPDF(notes: Note[], title: string = 'Vivid Knowledge Summary') {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a2e; }
          h1 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          .note { margin: 20px 0; padding: 15px; border-left: 3px solid #667eea; background: #f8f9fa; }
          .note-type { font-size: 12px; color: #667eea; text-transform: uppercase; }
          .note-content { margin: 10px 0; line-height: 1.6; }
          .note-meta { font-size: 12px; color: #666; }
          .tag { display: inline-block; background: #e0e7ff; color: #667eea; padding: 2px 8px; border-radius: 12px; margin: 2px; font-size: 11px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <hr />
        ${notes.map(note => `
          <div class="note">
            <div class="note-type">${note.type}</div>
            <div class="note-content">${note.content.replace(/\n/g, '<br/>')}</div>
            <div class="note-meta">${new Date(note.createdAt).toLocaleString()}</div>
            ${note.tags ? `<div>${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
          </div>
        `).join('')}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    
    if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
    
    return uri;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}
