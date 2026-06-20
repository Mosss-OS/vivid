import type { KnowledgeItem } from '../app/types/knowledge';

export function getDemoItems(): KnowledgeItem[] {
  return [
    {
      id: 'demo-1',
      title: 'Atomic Habits Discovery',
      content: 'Just discovered the concept of "atomic habits" - the idea that tiny changes can lead to remarkable results. Starting with just 2 minutes of reading daily.',
      type: 'insight',
      createdAt: new Date(),
      tags: ['learning', 'productivity', 'habits'],
    },
    {
      id: 'demo-2',
      title: 'Project Architecture Breakthrough',
      content: 'Voice memo: Had a breakthrough on the project architecture today. Realized we should use a modular approach with clear separation of concerns.',
      type: 'idea',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tags: ['work', 'architecture', 'insights'],
    },
    {
      id: 'demo-3',
      title: 'Deep Work Practices',
      content: 'Fascinating article on deep work practices. Key takeaway: Schedule blocks of 90-120 minutes for focused work. No notifications, no distractions.',
      type: 'reference',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['productivity', 'focus', 'reading'],
    },
    {
      id: 'demo-4',
      title: 'Review Project Proposal',
      content: 'Task: Review project proposal by Friday. Need to prepare slides and budget estimate.',
      type: 'task',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tags: ['tasks', 'work', 'deadline'],
    },
    {
      id: 'demo-5',
      title: 'Feature Flow Whiteboard',
      content: 'Photo: Whiteboard sketch of the new feature flow. Shows user journey from capture to AI insights.',
      type: 'note',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      tags: ['design', 'ideas', 'visual'],
    },
    {
      id: 'demo-6',
      title: 'ध्यान की आदतें (Meditation Habits)',
      content: 'हर सुबह 10 मिनट ध्यान करने की आदत डालनी है। इससे मानसिक शांति मिलती है और काम पर ध्यान केंद्रित करने में मदद मिलती है। कल से शुरू करूंगा।',
      type: 'note',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ['health', 'meditation', 'hindi'],
      detectedLanguage: 'hi-IN',
    },
    {
      id: 'demo-7',
      title: 'தமிழ் குறிப்புகள் (Tamil Notes)',
      content: 'இன்று ஒரு புதிய கருத்தை கற்றுக்கொண்டேன் - செயற்கை நுண்ணறிவு பற்றிய வலைப்பதிவு படித்தேன். மொழிபெயர்ப்பு மற்றும் இயற்கை மொழி செயலாக்கத்தில் மிகப்பெரிய முன்னேற்றங்கள் நடந்துள்ளன.',
      type: 'insight',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      tags: ['AI', 'learning', 'tamil'],
      detectedLanguage: 'ta-IN',
    },
    {
      id: 'demo-8',
      title: 'हिंदी प्रोजेक्ट आइडिया',
      content: 'एक नया प्रोजेक्ट शुरू करना चाहता हूँ जो ग्रामीण क्षेत्रों में डिजिटल शिक्षा को बढ़ावा देगा। इसके लिए एक मोबाइल ऐप बनाना होगा जो हिंदी और अन्य भारतीय भाषाओं में काम करे।',
      type: 'project',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ['project', 'education', 'hindi'],
      detectedLanguage: 'hi-IN',
    },
    {
      id: 'demo-9',
      title: 'Weekly Team Meeting Notes',
      content: 'Team meeting discussed Q3 roadmap. Key decisions: (1) Launch beta by August, (2) Hire 2 more engineers, (3) Focus on performance optimization.',
      type: 'note',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['work', 'meeting', 'planning'],
    },
    {
      id: 'demo-10',
      title: 'మల్టీలింగ్వల్ AI విజన్ (Multilingual AI Vision)',
      content: 'భారతదేశంలోని అన్ని భాషలలో పని చేసే AI సహాయకుడిని అభివృద్ధి చేయాలనేది నా దీర్ఘకాలిక దృష్టి. ప్రతి ఒక్కరూ వారి మాతృభాషలో సాంకేతికతను ఉపయోగించుకోవాలి.',
      type: 'idea',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      tags: ['AI', 'vision', 'telugu'],
      detectedLanguage: 'te-IN',
    },
  ];
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('demo') === 'true';
}
