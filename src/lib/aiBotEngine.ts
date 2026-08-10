'use client';

import { ChatMessage } from './types';

/**
 * 100% FREE LLM AI Chatbot Engine (Powered by Free Public LLM & Groq/OpenRouter)
 * Provides real, reasonable, human-like AI responses without requiring paid API keys!
 */

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || '';
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';

/**
 * Generates dynamic, human-like AI responses using Free Public LLM endpoints (Pollinations/Groq/OpenRouter)
 */
export const getHumanAiResponse = async (
  userPrompt: string,
  history: ChatMessage[] = [],
  userName: string = 'friend'
): Promise<string> => {
  const cleanPrompt = userPrompt.trim();
  if (!cleanPrompt) return 'I am here with you. What is on your mind today?';

  // 1. Try Backend Server AI Endpoint
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${backendUrl}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: cleanPrompt,
        history,
        userName,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (e) {
    console.warn('Backend AI endpoint notice, trying direct client LLM:', e);
  }

  // 2. Try Groq Free LLM API if key is present
  if (GROQ_API_KEY) {
    try {
      const response = await callGroqApi(cleanPrompt, history, userName);
      if (response) return response;
    } catch (e) {
      console.warn('Groq API fallback:', e);
    }
  }

  // 3. Try OpenRouter Free LLM API if key is present
  if (OPENROUTER_API_KEY) {
    try {
      const response = await callOpenRouterApi(cleanPrompt, history, userName);
      if (response) return response;
    } catch (e) {
      console.warn('OpenRouter API fallback:', e);
    }
  }

  // 4. Try Pollinations Free Public LLM Endpoint
  try {
    const freeLlmResponse = await callPollinationsFreeLlm(cleanPrompt, history, userName);
    if (freeLlmResponse) return freeLlmResponse;
  } catch (e) {
    console.warn('Free LLM endpoint fallback:', e);
  }

  // 5. Fallback to Human Natural Dialogue Engine
  return generateHumanDialogue(cleanPrompt, history, userName);
};

function extractFirstName(rawName: string): string {
  let name = (rawName || '').trim();
  if (!name || name.toLowerCase().includes('mindbloom') || name.toLowerCase().includes('member') || name.toLowerCase().includes('patient')) {
    return 'my friend';
  }
  return name.split(' ')[0];
}

/**
 * 100% FREE Public LLM Endpoint (Pollinations AI)
 */
async function callPollinationsFreeLlm(
  userPrompt: string,
  history: ChatMessage[],
  userName: string
): Promise<string | null> {
  const firstName = extractFirstName(userName);
  const systemPrompt = `You are MindBloom, a warm, reasonable, highly empathetic human clinical psychologist companion.
You are conversing with ${firstName}.
- Speak like a real, caring human therapist in natural conversation.
- Do NOT output robotic bulleted list dumps or rigid pre-written templates.
- Respond directly to what ${firstName} shared with warmth and wisdom.
- Keep responses concise (2-3 short paragraphs max) and ask a natural open question.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map((msg) => ({
      role: msg.is_ai ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: userPrompt },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'openai',
        seed: Math.floor(Math.random() * 10000),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const text = await res.text();
    if (!text || text.length < 5 || text.startsWith('<')) return null;

    try {
      const data = JSON.parse(text);
      return data.choices?.[0]?.message?.content || data.text || null;
    } catch {
      // Direct raw text response from Pollinations AI
      return text;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Groq Free API Integration
 */
async function callGroqApi(
  userPrompt: string,
  history: ChatMessage[],
  userName: string
): Promise<string | null> {
  const firstName = extractFirstName(userName);
  const messages = [
    {
      role: 'system',
      content: `You are MindBloom, a warm, reasonable human clinical psychologist assistant conversing with ${firstName}. Speak naturally like a real human being. Avoid robotic templates.`,
    },
    ...history.slice(-6).map((msg) => ({
      role: msg.is_ai ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: userPrompt },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 450,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

/**
 * OpenRouter Free API Integration
 */
async function callOpenRouterApi(
  userPrompt: string,
  history: ChatMessage[],
  userName: string
): Promise<string | null> {
  const firstName = extractFirstName(userName);
  const messages = [
    {
      role: 'system',
      content: `You are MindBloom, a warm, reasonable human psychologist companion for ${firstName}. Speak in natural human language with genuine empathy.`,
    },
    ...history.slice(-6).map((msg) => ({
      role: msg.is_ai ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: userPrompt },
  ];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

/**
 * Dynamic Human Natural Dialogue Engine (Local Fallback)
 */
function generateHumanDialogue(userPrompt: string, history: ChatMessage[], userName: string): string {
  const input = userPrompt.trim();
  const lower = input.toLowerCase();
  const firstName = extractFirstName(userName);
  const historyLen = history.length;

  // Natural greeting detection
  const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|hi there|hey there|howdy)(\s|!|\.|\?|$)/i.test(lower);
  if (isGreeting) {
    const greetings = [
      `Hello ${firstName}! 👋 It's wonderful to connect with you today. How are you feeling right now, and what's on your mind?`,
      `Hi ${firstName}! 😊 Good to see you. How has your day been going so far?`,
      `Hey ${firstName}! 👋 I'm here and ready to listen. What would you like to talk about today?`,
    ];
    return greetings[historyLen % greetings.length];
  }

  const words = input.split(/\s+/).filter((w) => w.length > 3 && !['this', 'that', 'with', 'have', 'from', 'what', 'your', 'about', 'there', 'they', 'them'].includes(w.toLowerCase()));
  const concept = words.length > 0 ? words[Math.floor(Math.random() * words.length)].replace(/[^a-zA-Z]/g, '') : '';

  if (lower.includes('stress') || lower.includes('tired') || lower.includes('overwhelm') || lower.includes('busy') || lower.includes('exhausted')) {
    const options = [
      `I hear you, ${firstName}. Carrying all of this around can take a real toll on your spirit, and feeling ${concept ? `drained by ${concept}` : 'exhausted'} is completely understandable.\n\nYou don't have to carry every single responsibility tonight. What is one small task or expectation we can set aside for now so you can give yourself room to rest?`,
      `That sounds genuinely exhausting, ${firstName}. When life gets this busy, it feels like there's no moment to catch your breath.\n\nIf you could pause everything for just 30 minutes, what would bring you the most peace right now?`,
    ];
    return options[historyLen % options.length];
  }

  if (lower.includes('anxi') || lower.includes('panic') || lower.includes('worry') || lower.includes('fear') || lower.includes('scared')) {
    const options = [
      `I can feel the tension in what you're sharing, ${firstName}. Take a slow, gentle breath with me right now. You are safe here in this moment.\n\nIs there a specific thought about ${concept || 'this situation'} that feels most intimidating right now, or is it more of a heavy overall feeling? We can take it one small step at a time.`,
      `Worry has a way of making everything feel urgent and overwhelming, ${firstName}. I'm here with you.\n\nWhat is one grounded fact you know to be true right now, amidst all the uncertain thoughts?`,
    ];
    return options[historyLen % options.length];
  }

  if (lower.includes('sad') || lower.includes('lonely') || lower.includes('hurt') || lower.includes('depress') || lower.includes('down')) {
    const options = [
      `I'm really sorry you're going through this, ${firstName}. Sitting with sadness or feeling ${concept ? `hurt by ${concept}` : 'alone'} is really heavy, but I appreciate you trusting me with your feelings.\n\nYou don't have to pretend to be okay here. How long have you been carrying this feeling around?`,
      `Thank you for being so honest with me, ${firstName}. It takes strength to acknowledge when you're feeling down.\n\nWhat has been the hardest part of your day today? I'm right here listening.`,
    ];
    return options[historyLen % options.length];
  }

  // General conversational natural replies
  const generalReplies = [
    `Thank you for opening up to me about this, ${firstName}. ${concept ? `Thinking through ${concept} seems to be really on your mind right now.` : "It sounds like there's a lot going on in your mind right now."}\n\nHow has this been impacting how you feel throughout your day?`,
    `I hear where you're coming from, ${firstName}. ${concept ? `It makes total sense that ${concept} is playing a role in how you're reflecting today.` : "Every step of this journey is worth exploring."}\n\nWhat feels like the most helpful focus for us to talk through together right now?`,
    `I really appreciate you sharing your thoughts with me, ${firstName}. When you reflect on ${concept || 'what you just mentioned'}, what is the main emotion that comes up for you?`,
    `That's really insightful, ${firstName}. Staying connected with how you're feeling is such an important part of mindfulness.\n\nWhat would feel like a gentle, supportive step for yourself as you move through today?`,
  ];

  return generalReplies[historyLen % generalReplies.length];
}
