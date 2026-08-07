'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  PrescriptionData,
} from '@/lib/types';
import {
  SEEDED_THERAPIST,
  SEEDED_ADMIN,
  SEEDED_PATIENT,
  INITIAL_SLOTS,
  INITIAL_APPOINTMENTS,
  INITIAL_MESSAGES,
  INITIAL_AI_MESSAGES,
  THERAPIST_CARE_PLAN,
  INITIAL_PATIENT_DOCUMENTS,
  MINDFULNESS_PROGRAMS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_CRISIS_LOGS,
  ANALYTICS_METRICS,
} from '@/lib/mockData';
import { detectCrisis } from '@/lib/crisisDetection';

interface AppContextType {
  user: UserProfile;
  setUserRole: (role: 'patient' | 'therapist' | 'admin') => void;
  usersList: UserProfile[];
  
  // Auth simulation
  authError: string | null;
  authSuccess: string | null;
  clearAuthMessages: () => void;
  loginUser: (email: string) => boolean;
  signupUser: (email: string, name: string) => boolean;
  
  // Booking & Slots
  slots: AvailabilitySlot[];
  addSlot: (dayLabel: string, timeLabel: string) => void;
  removeSlot: (slotId: string) => boolean;
  appointments: Appointment[];
  bookAppointment: (slotId: string) => boolean;
  
  // Doctor Initiated Call Flow
  activeIncomingCall: Appointment | null;
  activeSession: Appointment | null;
  therapistStartedCall: boolean;
  patientJoinedCall: boolean;
  therapistJoinedCall: boolean;
  startDoctorCall: (appointmentId: string) => void;
  notifyPatientAgain: () => void;
  acceptIncomingCall: () => void;
  declineIncomingCall: () => void;
  joinSessionAsTherapist: (appointmentId: string) => void;
  joinSessionAsPatient: (appointmentId: string) => void;
  endActiveSession: () => void;
  
  // Chat & AI Assistant
  isChatUnlocked: boolean; // unlocked if patient has at least 1 booking
  therapistMessages: ChatMessage[];
  sendTherapistMessage: (content: string) => void;
  sendPrescription: (prescription: PrescriptionData) => void;
  aiMessages: ChatMessage[];
  sendAiMessage: (content: string) => void;
  lastCrisisTriggered: boolean;
  dismissCrisisAlert: () => void;
  
  // Care Plan & Documents
  carePlan: CarePlan;
  saveTherapistCarePlan: (plan: Partial<CarePlan>) => void;
  generateAiStarterPlan: (intakeGoals: string, feeling: string) => void;
  patientDocuments: PatientDocument[];
  uploadDocument: (fileName: string, fileType: string) => void;
  sessionNotes: Record<string, string>;
  saveSessionNote: (appointmentId: string, notes: string) => void;
  
  // Mindfulness & Community
  mindfulnessPrograms: MindfulnessProgram[];
  communityPosts: CommunityPost[];
  addCommunityPost: (category: string, title: string, content: string) => void;
  addCommunityComment: (postId: string, content: string) => void;
  moderatePost: (postId: string, action: 'approved' | 'rejected') => void;
  moderateComment: (commentId: string, action: 'approved' | 'rejected') => void;
  
  // Crisis & Analytics
  crisisLogs: CrisisLog[];
  resolveCrisisLog: (logId: string) => void;
  analytics: AnalyticsMetrics;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(SEEDED_PATIENT);
  const [usersList] = useState<UserProfile[]>([SEEDED_PATIENT, SEEDED_THERAPIST, SEEDED_ADMIN]);
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  
  const [slots, setSlots] = useState<AvailabilitySlot[]>(INITIAL_SLOTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  
  // Call state
  const [activeIncomingCall, setActiveIncomingCall] = useState<Appointment | null>(null);
  const [activeSession, setActiveSession] = useState<Appointment | null>(null);
  const [therapistStartedCall, setTherapistStartedCall] = useState<boolean>(false);
  const [patientJoinedCall, setPatientJoinedCall] = useState<boolean>(false);
  const [therapistJoinedCall, setTherapistJoinedCall] = useState<boolean>(false);
  
  // Chat state
  const [therapistMessages, setTherapistMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(INITIAL_AI_MESSAGES);
  const [lastCrisisTriggered, setLastCrisisTriggered] = useState<boolean>(false);
  
  // Care plan & Documents
  const [carePlan, setCarePlan] = useState<CarePlan>(THERAPIST_CARE_PLAN);
  const [patientDocuments, setPatientDocuments] = useState<PatientDocument[]>(INITIAL_PATIENT_DOCUMENTS);
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({
    'appt-past-1': 'Patient showed clear progress with grounding exercises. Mindful breathing recommended.',
  });
  
  // Community & Crisis
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [crisisLogs, setCrisisLogs] = useState<CrisisLog[]>(INITIAL_CRISIS_LOGS);
  const [analytics] = useState<AnalyticsMetrics>(ANALYTICS_METRICS);

  // Unlocked check: Chat unlocks if patient has at least 1 appointment record
  const isChatUnlocked = appointments.some(
    (a) => a.patient_id === SEEDED_PATIENT.id || a.patient_id === user.id
  );

  const clearAuthMessages = () => {
    setAuthError(null);
    setAuthSuccess(null);
  };

  const setUserRole = (role: 'patient' | 'therapist' | 'admin') => {
    if (role === 'patient') setUser(SEEDED_PATIENT);
    else if (role === 'therapist') setUser(SEEDED_THERAPIST);
    else setUser(SEEDED_ADMIN);
  };

  const loginUser = (email: string): boolean => {
    clearAuthMessages();
    const existing = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      setAuthError('No account found with this email address. Please click Sign Up to create your account first.');
      return false;
    }
    setUser(existing);
    setAuthSuccess(`Welcome back, ${existing.full_name}!`);
    return true;
  };

  const signupUser = (email: string, name: string): boolean => {
    clearAuthMessages();
    const existing = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setAuthError('An account with this email already exists! Please click Sign In to access your account.');
      return false;
    }
    const newUser: UserProfile = {
      id: `patient-${Date.now()}`,
      email,
      full_name: name || 'New Patient',
      role: 'patient',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
      bio: 'MindBloom member focusing on mental wellness.',
      created_at: new Date().toISOString(),
    };
    usersList.push(newUser);
    setUser(newUser);
    setAuthSuccess(`Welcome to MindBloom, ${newUser.full_name}! Your account has been created.`);
    return true;
  };

  // Availability Slots
  const addSlot = (dayLabel: string, timeLabel: string) => {
    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}`,
      therapist_id: SEEDED_THERAPIST.id,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      is_booked: false,
      day_label: dayLabel || 'Upcoming',
      time_label: timeLabel || '11:00 AM - 11:50 AM',
    };
    setSlots((prev) => [...prev, newSlot]);
  };

  const removeSlot = (slotId: string): boolean => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return false;
    if (slot.is_booked) {
      alert('Cannot remove an availability slot that is already booked by a patient!');
      return false;
    }
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    return true;
  };

  // Book Appointment
  const bookAppointment = (slotId: string): boolean => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.is_booked) return false;

    // Mark slot booked
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, is_booked: true } : s))
    );

    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      patient_id: user.id,
      patient_name: user.full_name,
      patient_avatar: user.avatar_url,
      therapist_id: SEEDED_THERAPIST.id,
      therapist_name: SEEDED_THERAPIST.full_name,
      slot_id: slot.id,
      scheduled_at: slot.start_time,
      status: 'scheduled',
      created_at: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppt, ...prev]);
    return true;
  };

  // Doctor Initiated Call Flow
  const startDoctorCall = (appointmentId: string) => {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return;

    setTherapistStartedCall(true);
    setTherapistJoinedCall(true);
    setActiveIncomingCall(appt);
    setActiveSession(appt);

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'in_progress', therapist_joined_at: new Date().toISOString() }
          : a
      )
    );
  };

  const notifyPatientAgain = () => {
    if (!activeIncomingCall) return;
    // Re-trigger alert notification
    setActiveIncomingCall({ ...activeIncomingCall });
  };

  const acceptIncomingCall = () => {
    if (!activeIncomingCall) return;
    const appt = activeIncomingCall;
    setPatientJoinedCall(true);
    setActiveSession(appt);
    setActiveIncomingCall(null);

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appt.id
          ? { ...a, patient_joined_at: new Date().toISOString() }
          : a
      )
    );
  };

  const declineIncomingCall = () => {
    setActiveIncomingCall(null);
    // Note: Declining does NOT mark session missed. It remains scheduled.
  };

  const joinSessionAsTherapist = (appointmentId: string) => {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return;
    setTherapistJoinedCall(true);
    setActiveSession(appt);
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'in_progress', therapist_joined_at: new Date().toISOString() }
          : a
      )
    );
  };

  const joinSessionAsPatient = (appointmentId: string) => {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return;
    setPatientJoinedCall(true);
    setActiveSession(appt);
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, patient_joined_at: new Date().toISOString() }
          : a
      )
    );
  };

  const endActiveSession = () => {
    if (!activeSession) return;
    const apptId = activeSession.id;

    // Both joined check: session marked completed ONLY if therapist & patient verifiably joined
    const bothJoined = therapistJoinedCall && patientJoinedCall;
    const finalStatus = bothJoined ? 'completed' : 'scheduled';

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apptId
          ? {
              ...a,
              status: finalStatus,
              completed_at: bothJoined ? new Date().toISOString() : a.completed_at,
            }
          : a
      )
    );

    setActiveSession(null);
    setActiveIncomingCall(null);
    setTherapistStartedCall(false);
    setPatientJoinedCall(false);
    setTherapistJoinedCall(false);
  };

  // Chat
  const sendTherapistMessage = (content: string) => {
    if (!content.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender_id: user.id,
      sender_name: user.full_name,
      sender_avatar: user.avatar_url,
      receiver_id: user.role === 'therapist' ? SEEDED_PATIENT.id : SEEDED_THERAPIST.id,
      content,
      is_ai: false,
      created_at: new Date().toISOString(),
    };
    setTherapistMessages((prev) => [...prev, newMsg]);
  };

  const sendPrescription = (prescription: PrescriptionData) => {
    const rxMsg: ChatMessage = {
      id: `rx-${Date.now()}`,
      sender_id: SEEDED_THERAPIST.id,
      sender_name: SEEDED_THERAPIST.full_name,
      sender_avatar: SEEDED_THERAPIST.avatar_url,
      receiver_id: prescription.patient_id || SEEDED_PATIENT.id,
      appointment_id: prescription.appointment_id,
      content: `Official Prescription (Rx #${prescription.rx_number}) issued for ${prescription.patient_name}.`,
      is_ai: false,
      is_prescription: true,
      prescription_data: prescription,
      created_at: new Date().toISOString(),
    };
    setTherapistMessages((prev) => [...prev, rxMsg]);
  };

  // AI Assistant with Crisis Detection
  const sendAiMessage = (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `ai-user-${Date.now()}`,
      sender_id: user.id,
      sender_name: user.full_name,
      sender_avatar: user.avatar_url,
      receiver_id: 'ai-assistant',
      content,
      is_ai: false,
      created_at: new Date().toISOString(),
    };

    setAiMessages((prev) => [...prev, userMsg]);

    // Perform Crisis Language Detection
    const crisisResult = detectCrisis(content);

    if (crisisResult.isCrisis) {
      setLastCrisisTriggered(true);

      // Create Crisis Audit Log for Therapist/Admin dashboard (privacy protected, category logged)
      const newCrisisLog: CrisisLog = {
        id: `crisis-${Date.now()}`,
        patient_id: user.id,
        patient_name: user.full_name,
        trigger_phrase_category: crisisResult.category || 'High Risk Distress Intent',
        resolved: false,
        created_at: new Date().toISOString(),
      };
      setCrisisLogs((prev) => [newCrisisLog, ...prev]);

      // Immediate Crisis AI Response (No conversational delay!)
      const crisisAiMsg: ChatMessage = {
        id: `ai-resp-${Date.now()}`,
        sender_id: 'ai-assistant',
        sender_name: 'MindBloom AI Guide',
        receiver_id: user.id,
        content: crisisResult.crisisResponseText!,
        is_ai: true,
        is_crisis: true,
        created_at: new Date().toISOString(),
      };

      setTimeout(() => {
        setAiMessages((prev) => [...prev, crisisAiMsg]);
      }, 300);
    } else {
      // Normal psychoeducation AI response
      const normalAiMsg: ChatMessage = {
        id: `ai-resp-${Date.now()}`,
        sender_id: 'ai-assistant',
        sender_name: 'MindBloom AI Guide',
        receiver_id: user.id,
        content: `Thank you for sharing that with me. Grounding and self-reflection are wonderful tools for emotional clarity. Remember that I am here to share coping exercises like 4-7-8 breathing or guided relaxation anytime you need!`,
        is_ai: true,
        is_crisis: false,
        created_at: new Date().toISOString(),
      };

      setTimeout(() => {
        setAiMessages((prev) => [...prev, normalAiMsg]);
      }, 500);
    }
  };

  const dismissCrisisAlert = () => {
    setLastCrisisTriggered(false);
  };

  // Care Plan
  const saveTherapistCarePlan = (planData: Partial<CarePlan>) => {
    setCarePlan((prev) => ({
      ...prev,
      ...planData,
      source: 'therapist', // Therapist authority override
      updated_at: new Date().toISOString(),
    }));
  };

  const generateAiStarterPlan = (intakeGoals: string, feeling: string) => {
    // Only used if source is not therapist-assigned
    const aiPlan: CarePlan = {
      id: `cp-ai-${Date.now()}`,
      patient_id: user.id,
      source: 'ai_generated',
      title: `AI Starter MindBloom Plan for ${user.full_name}`,
      summary: `Personalized starter routine created based on intake focus: "${feeling}" & goal: "${intakeGoals}".`,
      coping_strategies: [
        {
          id: 'cs-ai-1',
          title: '3-Minute Mindful Reset',
          description: 'Take three deep abdominal breaths whenever feeling tense.',
          category: 'Breathing',
        },
        {
          id: 'cs-ai-2',
          title: 'Daily Evening Reflection',
          description: 'Acknowledge three wins or positive moments before sleep.',
          category: 'Cognitive',
        },
      ],
      daily_exercises: [
        {
          id: 'de-ai-1',
          title: '5-Minute Morning Guided Meditation',
          duration: '5 mins',
          target_frequency: 'Daily',
        },
      ],
      resources: [{ title: 'MindBloom Self-Care Starter Guide', url: '#' }],
      updated_at: new Date().toISOString(),
    };

    setCarePlan(aiPlan);
  };

  // Documents
  const uploadDocument = (fileName: string, fileType: string) => {
    const newDoc: PatientDocument = {
      id: `doc-${Date.now()}`,
      patient_id: user.id,
      file_name: fileName || 'Uploaded_Medical_Report.pdf',
      file_type: fileType || 'application/pdf',
      file_size: '1.5 MB',
      storage_path: `supabase-storage/patient-docs/${fileName}`,
      signed_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };
    setPatientDocuments((prev) => [newDoc, ...prev]);
  };

  // Session Notes
  const saveSessionNote = (appointmentId: string, notes: string) => {
    setSessionNotes((prev) => ({
      ...prev,
      [appointmentId]: notes,
    }));
  };

  // Community & Moderation
  const addCommunityPost = (category: string, title: string, content: string) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author_id: user.id,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      category: category as any,
      title,
      content,
      status: 'pending', // Held for moderation
      comments_count: 0,
      created_at: new Date().toISOString(),
      comments: [],
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
    alert('Thank you! Your post has been submitted for admin moderation and will appear once approved.');
  };

  const addCommunityComment = (postId: string, content: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      post_id: postId,
      author_id: user.id,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content,
      status: 'pending' as const, // Held for moderation
      created_at: new Date().toISOString(),
    };

    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedComments = [...(post.comments || []), newComment];
          return {
            ...post,
            comments: updatedComments,
          };
        }
        return post;
      })
    );
    alert('Your comment has been submitted for moderation!');
  };

  const moderatePost = (postId: string, action: 'approved' | 'rejected') => {
    setCommunityPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, status: action } : post))
    );
  };

  const moderateComment = (commentId: string, action: 'approved' | 'rejected') => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        const hasComment = post.comments?.some((c) => c.id === commentId);
        if (hasComment) {
          const updatedComments = post.comments?.map((c) =>
            c.id === commentId ? { ...c, status: action } : c
          );
          // Atomic comment count reconciliation: count approved comments only!
          const approvedCount = updatedComments?.filter((c) => c.status === 'approved').length || 0;
          return {
            ...post,
            comments: updatedComments,
            comments_count: approvedCount,
          };
        }
        return post;
      })
    );
  };

  // Crisis logs
  const resolveCrisisLog = (logId: string) => {
    setCrisisLogs((prev) =>
      prev.map((log) => (log.id === logId ? { ...log, resolved: true } : log))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUserRole,
        usersList,
        authError,
        authSuccess,
        clearAuthMessages,
        loginUser,
        signupUser,
        slots,
        addSlot,
        removeSlot,
        appointments,
        bookAppointment,
        activeIncomingCall,
        activeSession,
        therapistStartedCall,
        patientJoinedCall,
        therapistJoinedCall,
        startDoctorCall,
        notifyPatientAgain,
        acceptIncomingCall,
        declineIncomingCall,
        joinSessionAsTherapist,
        joinSessionAsPatient,
        endActiveSession,
        isChatUnlocked,
        therapistMessages,
        sendTherapistMessage,
        sendPrescription,
        aiMessages,
        sendAiMessage,
        lastCrisisTriggered,
        dismissCrisisAlert,
        carePlan,
        saveTherapistCarePlan,
        generateAiStarterPlan,
        patientDocuments,
        uploadDocument,
        sessionNotes,
        saveSessionNote,
        mindfulnessPrograms: MINDFULNESS_PROGRAMS,
        communityPosts,
        addCommunityPost,
        addCommunityComment,
        moderatePost,
        moderateComment,
        crisisLogs,
        resolveCrisisLog,
        analytics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
