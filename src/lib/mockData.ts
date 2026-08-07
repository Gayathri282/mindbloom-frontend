import {
  UserProfile,
  AvailabilitySlot,
  Appointment,
  ChatMessage,
  CrisisLog,
  CarePlan,
  PatientDocument,
  MindfulnessProgram,
  CommunityPost,
  AnalyticsMetrics,
} from './types';

export const SEEDED_THERAPIST: UserProfile = {
  id: 'therapist-1',
  email: 'dr.jenkins@mindbloom.app',
  full_name: 'Dr. Sarah Jenkins, Psy.D.',
  role: 'therapist',
  avatar_url: 'https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=250&auto=format&fit=crop&q=80',
  bio: 'Licensed Clinical Psychologist specializing in Cognitive Behavioral Therapy (CBT), Anxiety Spectrum Disorders, and Mindful Stress Reduction.',
  created_at: new Date().toISOString(),
};

export const SEEDED_ADMIN: UserProfile = {
  id: 'admin-1',
  email: 'admin@mindbloom.app',
  full_name: 'MindBloom Care Operations',
  role: 'admin',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  bio: 'System Administrator & Clinical Operations Lead',
  created_at: new Date().toISOString(),
};

export const SEEDED_PATIENT: UserProfile = {
  id: 'patient-1',
  email: 'maya@example.com',
  full_name: 'Maya Lin',
  role: 'patient',
  avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
  bio: 'Seeking guidance for work-life balance, mindfulness practice, and stress management.',
  created_at: new Date().toISOString(),
};

const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const getFutureDate = (daysAhead: number, hours: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

export const INITIAL_SLOTS: AvailabilitySlot[] = [
  {
    id: 'slot-1',
    therapist_id: SEEDED_THERAPIST.id,
    start_time: getFutureDate(0, 14),
    end_time: getFutureDate(0, 15),
    is_booked: true,
    day_label: 'Today',
    time_label: '2:00 PM - 2:50 PM',
  },
  {
    id: 'slot-2',
    therapist_id: SEEDED_THERAPIST.id,
    start_time: getFutureDate(0, 16),
    end_time: getFutureDate(0, 17),
    is_booked: false,
    day_label: 'Today',
    time_label: '4:00 PM - 4:50 PM',
  },
  {
    id: 'slot-3',
    therapist_id: SEEDED_THERAPIST.id,
    start_time: getFutureDate(1, 10),
    end_time: getFutureDate(1, 11),
    is_booked: false,
    day_label: 'Tomorrow',
    time_label: '10:00 AM - 10:50 AM',
  },
  {
    id: 'slot-4',
    therapist_id: SEEDED_THERAPIST.id,
    start_time: getFutureDate(1, 15),
    end_time: getFutureDate(1, 16),
    is_booked: false,
    day_label: 'Tomorrow',
    time_label: '3:00 PM - 3:50 PM',
  },
  {
    id: 'slot-5',
    therapist_id: SEEDED_THERAPIST.id,
    start_time: getFutureDate(3, 11),
    end_time: getFutureDate(3, 12),
    is_booked: false,
    day_label: 'In 3 Days',
    time_label: '11:00 AM - 11:50 AM',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    patient_id: SEEDED_PATIENT.id,
    patient_name: SEEDED_PATIENT.full_name,
    patient_avatar: SEEDED_PATIENT.avatar_url,
    therapist_id: SEEDED_THERAPIST.id,
    therapist_name: SEEDED_THERAPIST.full_name,
    slot_id: 'slot-1',
    scheduled_at: getFutureDate(0, 14),
    status: 'scheduled',
    created_at: new Date().toISOString(),
    notes: 'Intake focus: Mild social anxiety, sleep disturbance, work stress.',
  },
  {
    id: 'appt-past-1',
    patient_id: SEEDED_PATIENT.id,
    patient_name: SEEDED_PATIENT.full_name,
    patient_avatar: SEEDED_PATIENT.avatar_url,
    therapist_id: SEEDED_THERAPIST.id,
    therapist_name: SEEDED_THERAPIST.full_name,
    slot_id: 'slot-past-1',
    scheduled_at: getFutureDate(-7, 14),
    status: 'completed',
    therapist_joined_at: getFutureDate(-7, 14),
    patient_joined_at: getFutureDate(-7, 14),
    completed_at: getFutureDate(-7, 15),
    created_at: getFutureDate(-10, 10),
    notes: 'Initial Consultation: Introduced 4-7-8 breathing techniques and daily reflection journaling.',
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender_id: SEEDED_THERAPIST.id,
    sender_name: SEEDED_THERAPIST.full_name,
    sender_avatar: SEEDED_THERAPIST.avatar_url,
    receiver_id: SEEDED_PATIENT.id,
    content: 'Welcome to MindBloom, Maya! I am looking forward to our upcoming consultation. Feel free to review the Care Plan tab beforehand.',
    is_ai: false,
    created_at: getFutureDate(-1, 9),
  },
  {
    id: 'msg-2',
    sender_id: SEEDED_PATIENT.id,
    sender_name: SEEDED_PATIENT.full_name,
    sender_avatar: SEEDED_PATIENT.avatar_url,
    receiver_id: SEEDED_THERAPIST.id,
    content: 'Thank you Dr. Jenkins! I uploaded my intake notes and have been practicing the 4-7-8 breathing exercises.',
    is_ai: false,
    created_at: getFutureDate(-1, 10),
  },
];

export const INITIAL_AI_MESSAGES: ChatMessage[] = [
  {
    id: 'ai-msg-1',
    sender_id: 'ai-assistant',
    sender_name: 'MindBloom AI Guide',
    receiver_id: SEEDED_PATIENT.id,
    content: 'Hello Maya! I am your 24/7 AI Mindfulness Companion. I can assist with grounding exercises, sleep tips, and general psychoeducation. How are you feeling today?',
    is_ai: true,
    created_at: getFutureDate(0, 8),
  },
];

export const THERAPIST_CARE_PLAN: CarePlan = {
  id: 'cp-therapist-1',
  patient_id: SEEDED_PATIENT.id,
  therapist_id: SEEDED_THERAPIST.id,
  source: 'therapist',
  title: 'Dr. Jenkins Personal Care Plan for Maya',
  summary: 'Customized clinical wellness strategy focusing on cognitive reframing, sleep hygiene, and body-scan relaxation.',
  coping_strategies: [
    {
      id: 'cs-1',
      title: 'Box Breathing (4-4-4-4)',
      description: 'Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat 4 times when feeling overwhelmed.',
      category: 'Breathing',
    },
    {
      id: 'cs-2',
      title: '5-4-3-2-1 Sensory Grounding',
      description: 'Acknowledge 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste to stay anchored.',
      category: 'Grounding',
    },
    {
      id: 'cs-3',
      title: 'Cognitive Reframing Journaling',
      description: 'Write down catastrophic thoughts and reframe them with balanced, evidence-based alternatives.',
      category: 'Cognitive',
    },
  ],
  daily_exercises: [
    {
      id: 'de-1',
      title: 'Morning 10-Min Mindfulness Meditation',
      duration: '10 mins',
      target_frequency: 'Every Morning',
    },
    {
      id: 'de-2',
      title: 'Evening Digital Screen Sunset',
      duration: '60 mins before sleep',
      target_frequency: 'Nightly',
    },
  ],
  resources: [
    { title: 'Understanding CBT Basics & Thought Patterns', url: '#' },
    { title: 'Guided Progressive Muscle Relaxation (Audio)', url: '#' },
  ],
  updated_at: new Date().toISOString(),
};

export const INITIAL_PATIENT_DOCUMENTS: PatientDocument[] = [
  {
    id: 'doc-1',
    patient_id: SEEDED_PATIENT.id,
    file_name: 'Patient_Intake_Assessment_Summary.pdf',
    file_type: 'application/pdf',
    file_size: '1.2 MB',
    storage_path: 'patient-docs/maya_intake_2026.pdf',
    signed_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    created_at: getFutureDate(-2, 14),
  },
  {
    id: 'doc-2',
    patient_id: SEEDED_PATIENT.id,
    file_name: 'Previous_Psychologist_Referral_Letter.pdf',
    file_type: 'application/pdf',
    file_size: '840 KB',
    storage_path: 'patient-docs/referral_note_2025.pdf',
    signed_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    created_at: getFutureDate(-5, 9),
  },
];

export const MINDFULNESS_PROGRAMS: MindfulnessProgram[] = [
  {
    id: 'mp-1',
    category: 'Anxiety Relief',
    title: 'Calming Anxious Thoughts',
    description: 'A gentle 12-minute guided meditation focusing on releasing nervous tension in the chest and throat.',
    duration_minutes: 12,
    media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80',
    instructor: 'Dr. Sarah Jenkins',
  },
  {
    id: 'mp-2',
    category: 'Anxiety Relief',
    title: 'Deep Diaphragmatic Breathwork',
    description: 'Learn the physiology of nervous system regulation through rhythmic abdominal breathing.',
    duration_minutes: 8,
    media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500&auto=format&fit=crop&q=80',
    instructor: 'MindBloom Audio Guide',
  },
  {
    id: 'mp-3',
    category: 'Sleep & Rest',
    title: 'Restful Sleep Body Scan',
    description: 'Slow down racing thoughts before bed with a soothing toe-to-head progressive relaxation wave.',
    duration_minutes: 20,
    media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=500&auto=format&fit=crop&q=80',
    instructor: 'Dr. Sarah Jenkins',
  },
  {
    id: 'mp-4',
    category: 'Sleep & Rest',
    title: 'Raindrops & Gentle Forest Waves',
    description: 'Continuous white noise ambient soundscape crafted for deep uninterrupted sleep cycles.',
    duration_minutes: 45,
    media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80',
    instructor: 'Nature Ambient Studio',
  },
  {
    id: 'mp-5',
    category: 'Stress Management',
    title: 'Workplace De-Stress Reset',
    description: 'A 5-minute micro-break session to reset your cognitive load during busy workdays.',
    duration_minutes: 5,
    media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&auto=format&fit=crop&q=80',
    instructor: 'MindBloom Audio Guide',
  },
  {
    id: 'mp-6',
    category: 'Stress Management',
    title: 'Releasing Tension in the Shoulders',
    description: 'Guided physical awareness session combined with gentle neck stretches and breath release.',
    duration_minutes: 15,
    media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop&q=80',
    instructor: 'Dr. Sarah Jenkins',
  },
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author_id: SEEDED_PATIENT.id,
    author_name: SEEDED_PATIENT.full_name,
    author_avatar: SEEDED_PATIENT.avatar_url,
    category: 'Anxiety Support',
    title: 'How do you handle physical chest tightness during anxiety spikes?',
    content: 'Hi everyone, lately I have been noticing physical tightness when starting new projects at work. Does anyone have favorite grounding exercises that help right away?',
    status: 'approved',
    comments_count: 2,
    created_at: getFutureDate(-2, 11),
    comments: [
      {
        id: 'comm-1',
        post_id: 'post-1',
        author_id: 'user-sample-2',
        author_name: 'David K.',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Holding ice cubes or running cold water on my wrists instantly triggers the mammalian dive reflex for me! It slows my heart rate down within 30 seconds.',
        status: 'approved',
        created_at: getFutureDate(-2, 12),
      },
      {
        id: 'comm-2',
        post_id: 'post-1',
        author_id: SEEDED_THERAPIST.id,
        author_name: SEEDED_THERAPIST.full_name,
        author_avatar: SEEDED_THERAPIST.avatar_url,
        content: 'Great tip David! Combining physical temperature shifts with slow physiological sighs (two quick inhales through the nose, one long exhale through the mouth) works wonders.',
        status: 'approved',
        created_at: getFutureDate(-2, 14),
      },
    ],
  },
  {
    id: 'post-2',
    author_id: 'user-sample-3',
    author_name: 'Elena R.',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'Managing Grief',
    title: 'Navigating anniversaries of loss with compassion',
    content: 'This week marks one year since losing my grandmother. I am trying to give myself permission to rest and feel whatever comes up.',
    status: 'approved',
    comments_count: 1,
    created_at: getFutureDate(-1, 16),
    comments: [
      {
        id: 'comm-3',
        post_id: 'post-2',
        author_id: SEEDED_PATIENT.id,
        author_name: SEEDED_PATIENT.full_name,
        author_avatar: SEEDED_PATIENT.avatar_url,
        content: 'Sending you so much warmth Elena. Honoring your pace is the truest form of self-care.',
        status: 'approved',
        created_at: getFutureDate(-1, 18),
      },
    ],
  },
  {
    id: 'post-pending-1',
    author_id: 'user-sample-4',
    author_name: 'Julian M.',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    category: 'Healthy Relationships',
    title: 'Setting emotional boundaries with family members',
    content: 'I struggle with saying no to extra weekend events when feeling drained. Looking for polite phrases to protect my energy without causing drama.',
    status: 'pending', // Held for moderation
    comments_count: 0,
    created_at: getFutureDate(0, 9),
    comments: [],
  },
];

export const INITIAL_CRISIS_LOGS: CrisisLog[] = [
  {
    id: 'crisis-log-1',
    patient_id: SEEDED_PATIENT.id,
    patient_name: SEEDED_PATIENT.full_name,
    trigger_phrase_category: 'Suicidal Ideation Intent Keyword',
    resolved: true,
    created_at: getFutureDate(-5, 14),
  },
];

export const ANALYTICS_METRICS: AnalyticsMetrics = {
  mrr: 14850,
  activePatients: 248,
  completedSessions: 412,
  churnRate: 2.1,
  signupFunnel: [
    { step: 'Landing Visitors', count: 4800, percentage: 100 },
    { step: 'Account Signups', count: 1440, percentage: 30 },
    { step: 'First Booking', count: 864, percentage: 18 },
    { step: 'Recurring Consultations', count: 620, percentage: 12.9 },
  ],
  monthlySessionsData: [
    { month: 'Mar', count: 180 },
    { month: 'Apr', count: 240 },
    { month: 'May', count: 310 },
    { month: 'Jun', count: 350 },
    { month: 'Jul', count: 390 },
    { month: 'Aug', count: 412 },
  ],
};
