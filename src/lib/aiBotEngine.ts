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

  // 1. Try Groq Free LLM API if key is present
  if (GROQ_API_KEY) {
    try {
      const response = await callGroqApi(cleanPrompt, history, userName);
      if (response) return response;
    } catch (e) {
      console.warn('Groq API fallback:', e);
    }
  }

  // 2. Try OpenRouter Free LLM API if key is present
  if (OPENROUTER_API_KEY) {
    try {
      const response = await callOpenRouterApi(cleanPrompt, history, userName);
      if (response) return response;
    } catch (e) {
      console.warn('OpenRouter API fallback:', e);
    }
  }

  // 3. Try Pollinations Free Public LLM Endpoint (100% Free, No Key Required!)
  try {
    const freeLlmResponse = await callPollinationsFreeLlm(cleanPrompt, history, userName);
    if (freeLlmResponse) return freeLlmResponse;
  } catch (e) {
    console.warn('Free LLM endpoint fallback:', e);
  }

  // 4. Fallback to Human Natural Dialogue Engine
  return generateHumanDialogue(cleanPrompt, history, userName);
};

/**
 * 100% FREE Public LLM Endpoint (Pollinations AI - Llama 3 / Mistral)
 * Requires NO API key, completely free and open.
 */
async function callPollinationsFreeLlm(
  userPrompt: string,
  history: ChatMessage[],
  userName: string
): Promise<string | null> {
  const systemPrompt = `You are MindBloom, a warm, reasonable, highly empathetic human clinical psychologist companion.
You are conversing with ${userName}.
- Speak like a real, caring human therapist in natural conversation.
- Do NOT output robotic bulleted list dumps or rigid pre-written templates.
- Respond directly to what ${userName} shared with warmth, wisdom, and genuine human empathy.
- Keep responses concise (2-3 paragraphs max) and ask a natural, caring open question to keep the conversation flowing.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map((msg) => ({
      role: msg.is_ai ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: userPrompt },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'openai', // Uses free high-quality Llama 3 / GPT-4o-mini model
        seed: Math.floor(Math.random() * 1000),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    return reply || null;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Groq Free API Integration (Llama 3.3 70B / 8B)
 */
async function callGroqApi(
  userPrompt: string,
  history: ChatMessage[],
  userName: string
): Promise<string | null> {
  const messages = [
    {
      role: 'system',
      content: `You are MindBloom, a warm, reasonable, highly empathetic human clinical therapist assistant conversing with ${userName}. Speak naturally like a real human being. Avoid robotic templates or list dumps.`,
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
 * OpenRouter Free API Integration (Llama 3 / Gemma 2)
 */
async function callOpenRouterApi(
  userPrompt: string,
  history: ChatMessage[],
  userName: string
): Promise<string | null> {
  const messages = [
    {
      role: 'system',
      content: `You are MindBloom, a warm, reasonable human psychologist companion for ${userName}. Speak in natural human language with genuine empathy.`,
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
 * Human Natural Dialogue Engine (Local Fallback)
 */
function generateHumanDialogue(userPrompt: string, history: ChatMessage[], userName: string): string {
  const input = userPrompt.trim();
  const lower = input.toLowerCase();
  const firstName = userName.split(' ')[0] || 'friend';

  const words = input.split(/\s+/).filter((w) => w.length > 3);
  const keyConcept = words.length > 0 ? words[Math.floor(Math.random() * words.length)].replace(/[^a-zA-Z]/g, '') : '';

  if (lower.includes('stress') || lower.includes('tired') || lower.includes('overwhelm')) {
    return `I hear you, ${firstName}. It sounds like you've been carrying a heavy load lately, and feeling ${keyConcept || 'exhausted'} makes complete sense.\n\nWhen we're drained, even small decisions feel massive. You don't have to fix everything today. What is one small burden we can set aside for tonight so you can give yourself a little breathing room?`;
  }

  if (lower.includes('anxi') || lower.includes('panic') || lower.includes('worry')) {
    return `I can feel the worry in your words, ${firstName}, and I want you to take a slow breath with me right now. Your mind is trying to protect you, but you are safe right here.\n\nTell me—is there a specific scenario about ${keyConcept || 'this'} that feels most intimidating right now, or is it more of a general sense of unease? We can take it as slow as you need.`;
  }

  if (lower.includes('sad') || lower.includes('lonely') || lower.includes('hurt')) {
    return `I'm really sorry you're feeling this way, ${firstName}. Sitting with sadness or feeling ${keyConcept || 'alone'} can feel so heavy, but I appreciate you trusting me enough to share it.\n\nYou don't have to put on a brave face here. How long have you been feeling this coming on? I'm here to listen to whatever you want to share.`;
  }

  return `I really appreciate you telling me that, ${firstName}. It sounds like ${keyConcept ? `thinking about ${keyConcept}` : 'this'} is playing a big role in how you're feeling today.\n\nI'm curious—how has this been affecting your daily energy, and what would feel like the most supportive thing for us to focus on together right now?`;
}
