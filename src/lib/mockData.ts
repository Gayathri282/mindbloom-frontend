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

// Default seeded profiles (without demo Unsplash avatars for new profiles)
export const SEEDED_THERAPIST: UserProfile = {
  id: 'therapist-1',
  email: 'dr.jenkins@mindbloom.app',
  full_name: 'Dr. Sarah Jenkins, Psy.D.',
  role: 'therapist',
  avatar_url: undefined, // No demo image required
  bio: 'Licensed Clinical Psychologist specializing in Cognitive Behavioral Therapy (CBT), Anxiety Spectrum Disorders, and Mindful Stress Reduction.',
  created_at: new Date().toISOString(),
};

export const SEEDED_ADMIN: UserProfile = {
  id: 'admin-1',
  email: 'admin@mindbloom.app',
  full_name: 'MindBloom Operations',
  role: 'admin',
  avatar_url: undefined, // No demo image required
  bio: 'System Administrator & Clinical Operations Lead',
  created_at: new Date().toISOString(),
};

export const SEEDED_PATIENT: UserProfile = {
  id: 'patient-1',
  email: 'patient@example.com',
  full_name: 'New Patient Profile',
  role: 'patient',
  avatar_url: undefined, // Optional avatar - user may or may not add an image
  bio: 'Seeking guidance for mindfulness practice and stress management.',
  created_at: new Date().toISOString(),
};

// Clean Empty State Collections (No Demo Data Pre-populated)
export const INITIAL_SLOTS: AvailabilitySlot[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_MESSAGES: ChatMessage[] = [];

export const INITIAL_AI_MESSAGES: ChatMessage[] = [];

export const THERAPIST_CARE_PLAN: CarePlan = {
  id: 'cp-default',
  patient_id: SEEDED_PATIENT.id,
  therapist_id: SEEDED_THERAPIST.id,
  source: 'ai_generated',
  title: 'Personalized Care Plan',
  summary: 'Your custom care plan will appear here after your intake form or first therapist consultation.',
  coping_strategies: [],
  daily_exercises: [],
  resources: [],
  updated_at: new Date().toISOString(),
};

export const INITIAL_PATIENT_DOCUMENTS: PatientDocument[] = [];

// Curated Audio Library for Mindfulness
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
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [];

export const INITIAL_CRISIS_LOGS: CrisisLog[] = [];

export const ANALYTICS_METRICS: AnalyticsMetrics = {
  mrr: 0,
  activePatients: 0,
  completedSessions: 0,
  churnRate: 0,
  signupFunnel: [
    { step: 'Landing Visitors', count: 0, percentage: 100 },
    { step: 'Account Signups', count: 0, percentage: 0 },
    { step: 'First Booking', count: 0, percentage: 0 },
    { step: 'Recurring Consultations', count: 0, percentage: 0 },
  ],
  monthlySessionsData: [
    { month: 'Aug', count: 0 },
  ],
};
