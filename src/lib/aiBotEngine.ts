'use client';

/**
 * Intelligent, Context-Aware Interactive AI Response Generator
 * Analyzes user input intent, emotional tone, and specific topics to produce
 * empathetic, interactive, and actionable psychoeducational responses.
 */

interface AIResponse {
  text: string;
  isCrisis?: boolean;
  suggestedActions?: string[];
}

export const generateInteractiveAiResponse = (userPrompt: string, userName: string = 'friend'): AIResponse => {
  const input = userPrompt.trim().toLowerCase();
  const firstName = userName.split(' ')[0] || 'friend';

  // 1. ANXIETY & PANIC ATTACKS
  if (
    input.includes('anxi') ||
    input.includes('panic') ||
    input.includes('chest') ||
    input.includes('nervous') ||
    input.includes('scared') ||
    input.includes('worry') ||
    input.includes('shaky') ||
    input.includes('heart')
  ) {
    return {
      text: `I hear you, ${firstName}, and I want to reassure you that feeling anxious or overwhelmed is completely valid. When anxiety peaks, your body's nervous system is simply trying to protect you.\n\nHere is a quick, grounded exercise we can do right now:\n\n1. **Physiological Sigh**: Take two deep inhales through your nose, then one long, slow exhale through your mouth.\n2. **5-4-3-2-1 Sensory Reset**: Look around you and notice 5 objects, touch 4 textures, listen for 3 sounds, notice 2 scents, and take 1 deep breath.\n\nHow is your breathing feeling right now? Where in your body are you holding the most tension?`,
      suggestedActions: ['Try 4-7-8 Breathing', 'Open Mindfulness Audio', 'Book Doctor Session'],
    };
  }

  // 2. SLEEP, INSOMNIA & NIGHT RACING THOUGHTS
  if (
    input.includes('sleep') ||
    input.includes('insomnia') ||
    input.includes('tired') ||
    input.includes('night') ||
    input.includes('bed') ||
    input.includes('rest') ||
    input.includes('awake')
  ) {
    return {
      text: `Rest is so vital for emotional healing, ${firstName}. Racing thoughts at night often happen when our minds finally have quiet time to process the day.\n\nSome evidence-based sleep hygiene tips:\n- **Brain Dump**: Write down tomorrow's to-do list on paper so your brain knows it won't forget.\n- **Progressive Body Scan**: Focus on relaxing your feet, then ankles, knees, up to your jaw and eyelids.\n- **Screen Sunset**: Dim electronic screens 30–60 minutes before lying down.\n\nAre racing thoughts about work or life keeping you awake, or is it more of a physical restlessness tonight?`,
      suggestedActions: ['Play Sleep Audio Scan', 'View Care Plan', 'Chat with Dr. Jenkins'],
    };
  }

  // 3. SADNESS, LONELINESS & DEPRESSIVE MOOD
  if (
    input.includes('sad') ||
    input.includes('lonely') ||
    input.includes('depress') ||
    input.includes('cry') ||
    input.includes('empty') ||
    input.includes('hopeless') ||
    input.includes('down') ||
    input.includes('alone')
  ) {
    return {
      text: `Thank you for sharing this with me, ${firstName}. Feeling heavy, sad, or lonely can feel exhausting, but please know you are not carrying this alone.\n\nWhen energy feels low, we practice **micro-steps**:\n- Drink a glass of cool water.\n- Step outside for 2 minutes of natural light.\n- Wrap yourself in a warm blanket and listen to a comforting audio track.\n\nWhat is one gentle, comforting thing you can do for yourself in the next 10 minutes?`,
      suggestedActions: ['Check Peer Forums', 'Try Grounding Exercise', 'Contact Support'],
    };
  }

  // 4. WORK STRESS, OVERWHELM & BURNOUT
  if (
    input.includes('work') ||
    input.includes('stress') ||
    input.includes('burnout') ||
    input.includes('overwhelmed') ||
    input.includes('boss') ||
    input.includes('job') ||
    input.includes('deadline') ||
    input.includes('busy')
  ) {
    return {
      text: `Work stress and overwhelm can really drain your vital energy, ${firstName}. When everything feels urgent, it helps to pause and separate what is within your control right now from what isn't.\n\nA helpful strategy:\n- Pick **just ONE priority task** for the next 25 minutes.\n- Give yourself permission to pause non-essential notifications.\n- Take a 5-minute micro-break to stretch your shoulders and neck.\n\nWhat is the single biggest task weighing on your mind right now? Let's break it down together into smaller steps.`,
      suggestedActions: ['Set Care Plan Goal', '5-Min Micro-Break', 'Book Doctor Session'],
    };
  }

  // 5. RELATIONSHIPS, CONFLICT & BOUNDARIES
  if (
    input.includes('relationship') ||
    input.includes('family') ||
    input.includes('friend') ||
    input.includes('partner') ||
    input.includes('fight') ||
    input.includes('boundar') ||
    input.includes('conflict') ||
    input.includes('argument')
  ) {
    return {
      text: `Navigating relationships and setting clear boundaries requires emotional energy, ${firstName}. Remember that setting healthy boundaries is an act of self-respect, not selfishness.\n\nA simple script for gentle boundary setting:\n*"I care about our relationship, but I need some quiet time right now to recharge. Let's talk more tomorrow."*\n\nWould you like guidance on framing a specific boundary, or would you prefer to explore emotional grounding strategies first?`,
      suggestedActions: ['View Community Posts', 'Practice Reframing', 'Ask Dr. Jenkins'],
    };
  }

  // 6. MINDFULNESS, BREATHING & MEDITATION
  if (
    input.includes('meditat') ||
    input.includes('breath') ||
    input.includes('mindful') ||
    input.includes('exercise') ||
    input.includes('grounding') ||
    input.includes('cbt') ||
    input.includes('technique')
  ) {
    return {
      text: `Mindfulness and CBT exercises are wonderful tools for training your nervous system, ${firstName}!\n\nHere are 3 popular practices available in your MindBloom hub:\n1. **Box Breathing (4-4-4-4)**: Calms fight-or-flight nervous arousal.\n2. **Cognitive Reframing**: Identifies catastrophic self-talk and replaces it with evidence-based thoughts.\n3. **Guided Audio Body Scan**: Releases muscle tension.\n\nWhich of these would you like to practice right now?`,
      suggestedActions: ['Start Box Breathing', 'Browse Audio Library', 'Build Care Plan'],
    };
  }

  // 7. GREETINGS & INTROS
  if (
    input.includes('hello') ||
    input.includes('hi') ||
    input.includes('hey') ||
    input.includes('help') ||
    input.startsWith('who are you') ||
    input.includes('good morning') ||
    input.includes('good evening')
  ) {
    return {
      text: `Hello ${firstName}! 👋 I am your 24/7 MindBloom AI Assistant. I am here to offer interactive mindfulness grounding exercises, CBT thought-reframing tools, sleep guidance, and emotional support.\n\nHow are you feeling today? You can tell me what's on your mind, or ask for a specific exercise like breathing or stress relief!`,
      suggestedActions: ['I feel anxious', 'I need sleep tips', 'Guide my breathing'],
    };
  }

  // 8. GENERAL DYNAMIC FALLBACK RESPONSE (Contextually extracts user keywords)
  const topicKeywords = userPrompt.split(' ').filter((w) => w.length > 3).slice(0, 4).join(' ');
  const topicText = topicKeywords ? `regarding "${topicKeywords}"` : 'on your mind';

  return {
    text: `Thank you for sharing that with me, ${firstName}. I hear what you are experiencing ${topicText}.\n\nWhen dealing with these thoughts, it helps to pause and check in with yourself:\n- **Acknowledge**: What emotion is most present for you right now?\n- **Observe**: Notice any physical sensations without judging them.\n- **Act**: Choose one small action (a deep breath, a glass of water, or a quiet moment) that supports your peace.\n\nTell me a bit more about what you'd like to focus on next—would you prefer a guided breathing exercise, a CBT thought reframe, or to explore your personalized Care Plan?`,
    suggestedActions: ['Guided Breathing', 'Thought Reframing', 'Explore Care Plan'],
  };
};
