export interface CrisisDetectionResult {
  isCrisis: boolean;
  category?: string;
  matchedKeywords?: string[];
  crisisResponseText?: string;
}

const CRISIS_PATTERNS: { category: string; regex: RegExp }[] = [
  {
    category: 'Suicidal Ideation & Ending Life',
    regex: /(want to (die|end my life|kill myself)|suicide|suicidal|thinking of ending it|no reason to live|better off dead|don't want to live|wish i was dead|wish i were dead|end it all)/i,
  },
  {
    category: 'Self-Harm & Injury Intent',
    regex: /(harm (myself|self)|cut myself|hurting myself|self-harm|self harm|inflict pain|overdose|overdosing|take all my pills)/i,
  },
  {
    category: 'Immediate Danger to Self or Others',
    regex: /(in immediate danger|going to hurt someone|cannot keep myself safe|can't keep myself safe|safety risk|emergency assistance|hopeless and dangerous)/i,
  },
  {
    category: 'Severe Hopelessness & Despair Spikes',
    regex: /(can't go on anymore|no hope left|completely hopeless|i can't take this pain|goodbye forever)/i,
  },
];

export function detectCrisis(message: string): CrisisDetectionResult {
  if (!message || typeof message !== 'string') {
    return { isCrisis: false };
  }

  const cleanText = message.toLowerCase().trim();

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.regex.test(cleanText)) {
      return {
        isCrisis: true,
        category: pattern.category,
        crisisResponseText: `I hear how much pain you are experiencing right now, and your safety is the most important priority. Because your message suggests you may be in distress, I am immediately providing crisis resources below. Please reach out to one of these free, confidential support lines right away. You do not have to carry this alone.`,
      };
    }
  }

  return { isCrisis: false };
}

export const CRISIS_RESOURCES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    contact: 'Call or Text 988',
    detail: 'Free, confidential, 24/7 support across North America.',
    actionUrl: 'tel:988',
    type: 'phone',
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    detail: 'Free 24/7 crisis support via text message.',
    actionUrl: 'sms:741741?body=HOME',
    type: 'text',
  },
  {
    name: 'Urgent Therapist Notification',
    contact: 'Notify Dr. Sarah Jenkins',
    detail: 'Sends an urgent priority alert to your consulting therapist.',
    type: 'therapist_alert',
  },
  {
    name: 'Emergency Medical Services',
    contact: 'Call 911 / Local Emergency',
    detail: 'For immediate life-threatening medical emergencies.',
    actionUrl: 'tel:911',
    type: 'emergency',
  },
];
