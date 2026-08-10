export type UserRole = 'patient' | 'therapist' | 'counselor' | 'admin';
export type CounselorVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  status?: CounselorVerificationStatus;
  specialties?: string[];
  credentials?: string;
  license_number?: string;
  years_of_experience?: number;
  languages?: string[];
  starting_price?: number;
  rejection_reason?: string;
  is_deleted?: boolean;
  deactivated_at?: string;
  created_at: string;
}

export interface SessionType {
  id: string;
  counselor_id: string;
  duration_minutes: number;
  price: number;
  label: string;
  is_active: boolean;
}

export interface CounselorApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio: string;
  license_number: string;
  certifications: string[];
  degree: string;
  specialties: string[];
  id_document_name: string;
  id_document_url: string;
  years_of_experience: number;
  languages: string[];
  status: CounselorVerificationStatus;
  rejection_reason?: string;
  submitted_at: string;
}

export interface AvailabilitySlot {
  id: string;
  therapist_id: string;
  therapist_email?: string;
  therapist_name?: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  is_booked: boolean;
  day_label: string;  // e.g. "Today", "Tomorrow", "Mon, Aug 10"
  time_label: string; // e.g. "10:00 AM - 10:50 AM"
}

export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_avatar?: string;
  therapist_id: string;
  therapist_name: string;
  slot_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  therapist_joined_at?: string;
  patient_joined_at?: string;
  completed_at?: string;
  payment_id?: string;
  razorpay_order_id?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  amount_paid?: number;
  payment_method?: string;
  created_at: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionData {
  id: string;
  appointment_id?: string;
  patient_id: string;
  patient_name: string;
  therapist_name: string;
  diagnosis: string;
  medications: PrescriptionItem[];
  general_instructions: string;
  issued_at: string;
  doctor_signature: string;
  rx_number: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  receiver_id: string;
  appointment_id?: string;
  content: string;
  is_ai: boolean;
  is_crisis?: boolean;
  is_prescription?: boolean;
  prescription_data?: PrescriptionData;
  created_at: string;
}

export interface CrisisLog {
  id: string;
  patient_id: string;
  patient_name: string;
  trigger_phrase_category: string;
  resolved: boolean;
  created_at: string;
}

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: 'Breathing' | 'Cognitive' | 'Behavioral' | 'Grounding';
}

export interface DailyExercise {
  id: string;
  title: string;
  duration: string;
  target_frequency: string;
}

export interface CarePlan {
  id: string;
  patient_id: string;
  therapist_id?: string;
  source: 'therapist' | 'ai_generated';
  title: string;
  summary: string;
  coping_strategies: CopingStrategy[];
  daily_exercises: DailyExercise[];
  resources: { title: string; url: string }[];
  updated_at: string;
}

export interface PatientDocument {
  id: string;
  patient_id: string;
  file_name: string;
  file_type: string;
  file_size: string;
  storage_path: string;
  signed_url: string;
  created_at: string;
}

export interface MindfulnessProgram {
  id: string;
  category: 'Anxiety Relief' | 'Sleep & Rest' | 'Stress Management';
  title: string;
  description: string;
  duration_minutes: number;
  media_url: string;
  thumbnail_url: string;
  instructor: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  category: 'Anxiety Support' | 'Managing Grief' | 'Healthy Relationships';
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  comments_count: number;
  created_at: string;
  comments?: CommunityComment[];
}

export interface AnalyticsMetrics {
  mrr: number;
  activePatients: number;
  completedSessions: number;
  churnRate: number;
  signupFunnel: { step: string; count: number; percentage: number }[];
  monthlySessionsData: { month: string; count: number }[];
}
