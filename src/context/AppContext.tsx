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
  CounselorApplication,
  SessionType,
} from '@/lib/types';
import {
  INITIAL_COUNSELORS,
  SEEDED_ADMIN,
  DEFAULT_PATIENT,
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
import { getHumanAiResponse } from '@/lib/aiBotEngine';

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
  removeSlot: (slotId: string) => Promise<boolean> | boolean;
  appointments: Appointment[];
  bookAppointment: (
    slotId: string,
    paymentDetails?: {
      payment_id: string;
      razorpay_order_id: string;
      amount_paid?: number;
      payment_method?: string;
    }
  ) => boolean;
  
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

  // User Directory & Account Management
  allUsersList: UserProfile[];
  deleteUserProfile: (userId: string) => void;

  // Multi-Counselor Verification & Session Types
  counselorApplications: CounselorApplication[];
  sessionTypes: SessionType[];
  submitCounselorApplication: (appData: Omit<CounselorApplication, 'id' | 'status' | 'submitted_at'>) => Promise<boolean>;
  approveCounselorApplication: (applicationId: string) => void;
  rejectCounselorApplication: (applicationId: string, reason: string) => void;
  refreshCounselorApplications: () => Promise<void>;
  addSessionType: (durationMinutes: number, price: number, label: string) => void;
  toggleSessionType: (sessionTypeId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getSavedState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mindbloom_session_v4');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = getSavedState();
    return saved?.user || DEFAULT_PATIENT;
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = getSavedState();
    const demoCounselorIds = new Set(['therapist-1', 'therapist-2', 'therapist-3']);
    if (saved?.usersList && Array.isArray(saved.usersList) && saved.usersList.length > 0) {
      return saved.usersList.filter((u: UserProfile) => !demoCounselorIds.has(u.id));
    }
    return [SEEDED_ADMIN];
  });
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  
  const [slots, setSlots] = useState<AvailabilitySlot[]>(() => {
    const saved = getSavedState();
    if (saved?.slots && Array.isArray(saved.slots) && saved.slots.length > 0) {
      const existingIds = new Set(saved.slots.map((s: AvailabilitySlot) => s.id));
      const missingInitial = INITIAL_SLOTS.filter((s) => !existingIds.has(s.id));
      return [...saved.slots, ...missingInitial];
    }
    return INITIAL_SLOTS;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = getSavedState();
    return saved?.appointments || INITIAL_APPOINTMENTS;
  });
  
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
  const [carePlan, setCarePlan] = useState<CarePlan>(() => {
    const saved = getSavedState();
    return saved?.carePlan || THERAPIST_CARE_PLAN;
  });
  const [patientDocuments, setPatientDocuments] = useState<PatientDocument[]>(INITIAL_PATIENT_DOCUMENTS);
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({
    'appt-past-1': 'Patient showed clear progress with grounding exercises. Mindful breathing recommended.',
  });
  
  // Community & Crisis
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = getSavedState();
    return saved?.communityPosts || INITIAL_COMMUNITY_POSTS;
  });
  const [crisisLogs, setCrisisLogs] = useState<CrisisLog[]>(INITIAL_CRISIS_LOGS);
  const [analytics] = useState<AnalyticsMetrics>(ANALYTICS_METRICS);

  // Multi-Counselor Verification & Session Types
  const [counselorApplications, setCounselorApplications] = useState<CounselorApplication[]>(() => {
    const saved = getSavedState();
    return saved?.counselorApplications || [];
  });

  const [sessionTypes, setSessionTypes] = useState<SessionType[]>(() => {
    const saved = getSavedState();
    if (saved?.sessionTypes && Array.isArray(saved.sessionTypes) && saved.sessionTypes.length > 0) {
      return saved.sessionTypes;
    }
    return [
      {
        id: 'st-30m-therapist-1',
        counselor_id: 'therapist-1',
        duration_minutes: 30,
        price: 499,
        label: '30-Minute Focus Session',
        is_active: true,
      },
      {
        id: 'st-60m-therapist-1',
        counselor_id: 'therapist-1',
        duration_minutes: 60,
        price: 999,
        label: '60-Minute Comprehensive Session',
        is_active: true,
      },
    ];
  });

  // Deleted Slots Tracking
  const [deletedSlotIds, setDeletedSlotIds] = useState<string[]>(() => {
    const saved = getSavedState();
    return saved?.deletedSlotIds || [];
  });

  // Save session state to localStorage on any state modification
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'mindbloom_session_v4',
        JSON.stringify({
          user,
          usersList,
          counselorApplications,
          appointments,
          slots,
          deletedSlotIds,
          carePlan,
          communityPosts,
          sessionTypes,
        })
      );
    } catch (e) {
      console.warn('Error writing session state to localStorage:', e);
    }
  }, [user, usersList, counselorApplications, appointments, slots, deletedSlotIds, carePlan, communityPosts, sessionTypes]);

  // Fetch counselor applications from backend (shared function used on mount and by admin refresh)
  const refreshCounselorApplications = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${backendUrl}/counselors/applications`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.applications) && data.applications.length > 0) {
          setCounselorApplications((prev) => {
            const map = new Map<string, CounselorApplication>();
            // Backend data goes in first (authoritative source)
            data.applications.forEach((app: CounselorApplication) => map.set(app.id, app));
            // Local-only entries (submitted in this session, not yet on backend) are merged in
            prev.forEach((app) => {
              if (!map.has(app.id)) map.set(app.id, app);
            });
            return Array.from(map.values());
          });

          // Sync approved/rejected status from backend into usersList and logged-in user
          data.applications.forEach((app: CounselorApplication) => {
            if (app.status === 'approved' || app.status === 'rejected') {
              setUsersList((prevUsers) =>
                prevUsers.map((u) => {
                  if (
                    u.email.toLowerCase() === app.email.toLowerCase() ||
                    u.id === app.user_id
                  ) {
                    return {
                      ...u,
                      status: app.status as 'approved' | 'rejected',
                      role: app.status === 'approved' ? 'counselor' : u.role,
                      rejection_reason: app.rejection_reason || u.rejection_reason,
                    };
                  }
                  return u;
                })
              );

              setUser((currentUser) => {
                if (
                  currentUser.email.toLowerCase() === app.email.toLowerCase() ||
                  currentUser.id === app.user_id
                ) {
                  return {
                    ...currentUser,
                    status: app.status as 'approved' | 'rejected',
                    role: app.status === 'approved' ? 'counselor' : currentUser.role,
                    rejection_reason: app.rejection_reason || currentUser.rejection_reason,
                  };
                }
                return currentUser;
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Notice fetching backend counselor applications:', e);
    }
  };

  // Fetch authoritative availability slots from backend
  const refreshSlots = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${backendUrl}/slots`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.slots)) {
          setSlots((prev) => {
            const deletedSet = new Set(deletedSlotIds);
            const map = new Map<string, AvailabilitySlot>();

            // 1. Authoritative backend slots (excluding deleted ones)
            data.slots.forEach((s: AvailabilitySlot) => {
              if (!deletedSet.has(s.id)) map.set(s.id, s);
            });

            // 2. Local-only slots (excluding deleted ones)
            prev.forEach((s) => {
              if (!deletedSet.has(s.id) && !map.has(s.id)) {
                map.set(s.id, s);
              }
            });

            return Array.from(map.values());
          });
        }
      }
    } catch (e) {
      console.warn('Notice fetching backend slots:', e);
    }
  };

  // Fetch authoritative session types from backend
  const refreshSessionTypes = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${backendUrl}/session-types`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sessionTypes) && data.sessionTypes.length > 0) {
          setSessionTypes((prev) => {
            const map = new Map<string, SessionType>();
            data.sessionTypes.forEach((st: SessionType) => map.set(st.id, st));
            prev.forEach((st) => {
              if (!map.has(st.id)) map.set(st.id, st);
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (e) {
      console.warn('Notice fetching backend session types:', e);
    }
  };

  // Fetch authoritative appointments from backend
  const refreshAppointments = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${backendUrl}/appointments`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.appointments)) {
          setAppointments((prev) => {
            const map = new Map<string, Appointment>();
            data.appointments.forEach((a: Appointment) => map.set(a.id, a));
            prev.forEach((a) => {
              if (!map.has(a.id)) map.set(a.id, a);
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (e) {
      console.warn('Notice fetching backend appointments:', e);
    }
  };

  // Fetch on mount & poll every 3s + window focus for real-time slot propagation
  useEffect(() => {
    refreshCounselorApplications();
    refreshSlots();
    refreshSessionTypes();
    refreshAppointments();

    const interval = setInterval(() => {
      refreshSlots();
      refreshSessionTypes();
      refreshAppointments();
    }, 3000);

    const onFocus = () => {
      refreshSlots();
      refreshCounselorApplications();
      refreshSessionTypes();
      refreshAppointments();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Auto-refresh applications when admin logs in
  useEffect(() => {
    if (user.role === 'admin') {
      refreshCounselorApplications();
    }
  }, [user.id, user.role]);

  // Reconcile pending counselor users from usersList into counselorApplications
  useEffect(() => {
    const pendingCounselorUsers = usersList.filter(
      (u) => u.role === 'therapist' || u.role === 'counselor'
    );

    if (pendingCounselorUsers.length > 0) {
      setCounselorApplications((prev) => {
        const existingUserIds = new Set(prev.map((app) => app.user_id || app.id));
        const newDerivedApps: CounselorApplication[] = [];

        pendingCounselorUsers.forEach((u) => {
          if (!existingUserIds.has(u.id)) {
            newDerivedApps.push({
              id: `app-user-${u.id}`,
              user_id: u.id,
              full_name: u.full_name,
              email: u.email,
              avatar_url: u.avatar_url,
              bio: u.bio || 'Licensed mental health practitioner application under admin review.',
              license_number: u.license_number || 'PSY-2026-PENDING',
              certifications: ['Clinical Psychology Certification'],
              degree: u.credentials || 'Psy.D. Clinical Psychology',
              specialties: u.specialties || ['Cognitive Behavioral Therapy (CBT)', 'Anxiety & Panic'],
              id_document_name: 'Government_ID_Verification.pdf',
              id_document_url: 'https://rxxlawptbtwrtxpbyoyt.supabase.co/storage/v1/object/public/counselor-docs/govt-id-sample.pdf',
              years_of_experience: u.years_of_experience || 5,
              languages: u.languages || ['English'],
              status: u.status === 'approved' ? 'approved' : u.status === 'rejected' ? 'rejected' : 'pending',
              submitted_at: u.created_at || new Date().toISOString(),
            });
          }
        });

        if (newDerivedApps.length > 0) {
          return [...prev, ...newDerivedApps];
        }
        return prev;
      });
    }
  }, [usersList]);

  const addSessionType = async (durationMinutes: number, price: number, label: string) => {
    const newSt: SessionType = {
      id: `st-${durationMinutes}m-${Date.now()}`,
      counselor_id: user.id,
      duration_minutes: durationMinutes,
      price,
      label,
      is_active: true,
    };
    setSessionTypes((prev) => [...prev, newSt]);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${backendUrl}/session-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSt),
      });
      refreshSessionTypes();
    } catch (e) {
      console.warn('Backend session type publish notice:', e);
    }
  };

  const toggleSessionType = (sessionTypeId: string) => {
    setSessionTypes((prev) =>
      prev.map((st) => (st.id === sessionTypeId ? { ...st, is_active: !st.is_active } : st))
    );
  };

  const submitCounselorApplication = async (
    appData: Omit<CounselorApplication, 'id' | 'status' | 'submitted_at'>
  ): Promise<boolean> => {
    const counselorId = appData.user_id || `counselor-${Date.now()}`;
    const newApp: CounselorApplication = {
      ...appData,
      id: `counselor-app-${Date.now()}`,
      user_id: counselorId,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    setCounselorApplications((prev) => [newApp, ...prev]);

    // Create corresponding pending user profile
    const newCounselorUser: UserProfile = {
      id: counselorId,
      email: appData.email,
      full_name: appData.full_name,
      role: 'counselor',
      status: 'pending',
      avatar_url: appData.avatar_url,
      bio: appData.bio,
      credentials: appData.degree,
      license_number: appData.license_number,
      specialties: appData.specialties,
      years_of_experience: appData.years_of_experience,
      languages: appData.languages,
      starting_price: 499,
      created_at: new Date().toISOString(),
    };

    setUsersList((prev) => [...prev, newCounselorUser]);
    setUser(newCounselorUser);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${backendUrl}/counselors/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: appData.full_name,
          email: appData.email,
          bio: appData.bio,
          licenseNumber: appData.license_number,
          certifications: appData.certifications,
          degree: appData.degree,
          specialties: appData.specialties,
          idDocumentName: appData.id_document_name,
          idDocumentUrl: appData.id_document_url,
          yearsOfExperience: appData.years_of_experience,
          languages: appData.languages,
        }),
      });
    } catch (e) {
      console.warn('Backend counselor application save notice:', e);
    }

    return true;
  };

  const approveCounselorApplication = async (applicationId: string) => {
    // 1. Send approval to backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${backendUrl}/counselors/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action: 'approved' }),
      });
    } catch (e) {
      console.warn('Backend counselor verify notice:', e);
    }

    // 2. Update counselorApplications state
    setCounselorApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: 'approved' } : app))
    );

    // 3. Find target application
    const targetApp = counselorApplications.find((a) => a.id === applicationId);
    const emailToMatch = targetApp?.email.toLowerCase();
    const userIdToMatch = targetApp?.user_id;

    // 4. Update usersList state
    setUsersList((prevUsers) =>
      prevUsers.map((u) => {
        if (
          (emailToMatch && u.email.toLowerCase() === emailToMatch) ||
          (userIdToMatch && u.id === userIdToMatch) ||
          u.id === applicationId
        ) {
          return { ...u, status: 'approved', role: 'counselor' };
        }
        return u;
      })
    );

    // 5. Update logged-in user if matching
    setUser((currentUser) => {
      if (
        (emailToMatch && currentUser.email.toLowerCase() === emailToMatch) ||
        (userIdToMatch && currentUser.id === userIdToMatch) ||
        currentUser.id === applicationId
      ) {
        return { ...currentUser, status: 'approved', role: 'counselor' };
      }
      return currentUser;
    });

    // 6. Seed default session types
    const counselorId = userIdToMatch || `counselor-${Date.now()}`;
    const default30Min: SessionType = {
      id: `st-30m-${counselorId}`,
      counselor_id: counselorId,
      duration_minutes: 30,
      price: 499,
      label: '30-Minute Focus Session',
      is_active: true,
    };
    const default60Min: SessionType = {
      id: `st-60m-${counselorId}`,
      counselor_id: counselorId,
      duration_minutes: 60,
      price: 999,
      label: '60-Minute Comprehensive Consultation',
      is_active: true,
    };

    setSessionTypes((prev) => {
      const exists = prev.some((st) => st.counselor_id === counselorId);
      return exists ? prev : [...prev, default30Min, default60Min];
    });
  };

  const rejectCounselorApplication = async (applicationId: string, reason: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${backendUrl}/counselors/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action: 'rejected', rejectionReason: reason }),
      });
    } catch (e) {
      console.warn('Backend counselor verify rejection notice:', e);
    }

    setCounselorApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: 'rejected', rejection_reason: reason } : app
      )
    );

    const targetApp = counselorApplications.find((a) => a.id === applicationId);
    const emailToMatch = targetApp?.email.toLowerCase();
    const userIdToMatch = targetApp?.user_id;

    setUsersList((prevUsers) =>
      prevUsers.map((u) => {
        if (
          (emailToMatch && u.email.toLowerCase() === emailToMatch) ||
          (userIdToMatch && u.id === userIdToMatch) ||
          u.id === applicationId
        ) {
          return { ...u, status: 'rejected', rejection_reason: reason };
        }
        return u;
      })
    );

    setUser((currentUser) => {
      if (
        (emailToMatch && currentUser.email.toLowerCase() === emailToMatch) ||
        (userIdToMatch && currentUser.id === userIdToMatch) ||
        currentUser.id === applicationId
      ) {
        return { ...currentUser, status: 'rejected', rejection_reason: reason };
      }
      return currentUser;
    });
  };

  // Unlocked check: Chat unlocks if patient has at least 1 appointment record
  const isChatUnlocked = appointments.some(
    (a) => a.patient_id === user.id || a.status === 'scheduled'
  );

  const clearAuthMessages = () => {
    setAuthError(null);
    setAuthSuccess(null);
  };

  const setUserRole = (role: 'patient' | 'therapist' | 'admin') => {
    if (role === 'admin') setUser(SEEDED_ADMIN);
    else setUser(DEFAULT_PATIENT);
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
    const cleanName = name?.trim() || email.split('@')[0] || 'Member';
    const newUser: UserProfile = {
      id: `patient-${Date.now()}`,
      email,
      full_name: cleanName,
      role: 'patient',
      avatar_url: undefined,
      bio: 'MindBloom member focusing on mental wellness.',
      created_at: new Date().toISOString(),
    };
    usersList.push(newUser);
    setUser(newUser);
    setAuthSuccess(`Welcome to MindBloom, ${newUser.full_name}! Your account has been created.`);
    return true;
  };

  // Availability Slots
  const addSlot = async (dayLabel: string, timeLabel: string) => {
    const counselorId = (user.role === 'admin' || user.id === 'admin-1') ? 'therapist-1' : user.id;
    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      therapist_id: counselorId,
      therapist_email: user.email,
      therapist_name: user.full_name,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      is_booked: false,
      day_label: dayLabel || 'Today',
      time_label: timeLabel || '11:00 AM - 11:50 AM',
    };

    setSlots((prev) => [...prev, newSlot]);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${backendUrl}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot),
      });
      refreshSlots();
    } catch (e) {
      console.warn('Backend slot publish notice:', e);
    }
  };

  const removeSlot = async (slotId: string): Promise<boolean> => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return false;
    if (slot.is_booked) {
      alert('Cannot remove an availability slot that is already booked by a patient!');
      return false;
    }

    setDeletedSlotIds((prev) => Array.from(new Set([...prev, slotId])));
    setSlots((prev) => prev.filter((s) => s.id !== slotId));

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/slots/${slotId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        console.error(`Backend DELETE /api/slots/${slotId} failed with HTTP status ${response.status}`);
      } else {
        console.log(`Backend DELETE /api/slots/${slotId} verified successful.`);
      }
      refreshSlots();
    } catch (e) {
      console.warn('Backend slot delete notice:', e);
    }
    return true;
  };

  // Book Appointment (Only called upon Razorpay payment verification)
  const bookAppointment = (
    slotId: string,
    paymentDetails?: {
      payment_id: string;
      razorpay_order_id: string;
      amount_paid?: number;
      payment_method?: string;
    }
  ): boolean => {
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
      therapist_id: slot.therapist_id,
      therapist_name: 'Assigned Counselor',
      slot_id: slot.id,
      scheduled_at: slot.start_time,
      status: 'scheduled',
      payment_id: paymentDetails?.payment_id || `pay_upi_${Date.now()}`,
      razorpay_order_id: paymentDetails?.razorpay_order_id || `order_${Date.now()}`,
      payment_status: 'paid',
      amount_paid: paymentDetails?.amount_paid || 999,
      payment_method: paymentDetails?.payment_method || 'Razorpay UPI',
      created_at: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppt, ...prev]);

    (async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await fetch(`${backendUrl}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAppt),
        });
        refreshAppointments();
      } catch (e) {
        console.warn('Backend appointment save notice:', e);
      }
    })();

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
      receiver_id: user.role === 'therapist' ? 'patient' : 'counselor',
      content,
      is_ai: false,
      created_at: new Date().toISOString(),
    };
    setTherapistMessages((prev) => [...prev, newMsg]);
  };

  const sendPrescription = (prescription: PrescriptionData) => {
    const rxMsg: ChatMessage = {
      id: `rx-${Date.now()}`,
      sender_id: user.id,
      sender_name: user.full_name,
      sender_avatar: user.avatar_url,
      receiver_id: prescription.patient_id || 'patient',
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
      // Dynamic human-like conversational AI response
      getHumanAiResponse(content, aiMessages, user.full_name).then((responseText) => {
        const normalAiMsg: ChatMessage = {
          id: `ai-resp-${Date.now()}`,
          sender_id: 'ai-assistant',
          sender_name: 'MindBloom AI Guide',
          receiver_id: user.id,
          content: responseText,
          is_ai: true,
          is_crisis: false,
          created_at: new Date().toISOString(),
        };

        setAiMessages((prev) => [...prev, normalAiMsg]);
      });
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
    const cleanFeeling = feeling.trim() || 'emotional wellness';
    const cleanGoals = intakeGoals.trim() || 'stress reduction';

    const aiPlan: CarePlan = {
      id: `cp-ai-${Date.now()}`,
      patient_id: user.id,
      source: 'ai_generated',
      title: `Personalized AI Starter Plan: ${cleanFeeling}`,
      summary: `Self-service routine tailored for: "${cleanFeeling}". Primary Goal: "${cleanGoals}".`,
      coping_strategies: [
        {
          id: `cs-1-${Date.now()}`,
          title: `Grounding Protocol for ${cleanFeeling}`,
          description: `Practice 4-7-8 rhythmic breathing whenever experiencing ${cleanFeeling}. Focus on releasing physical tension in your shoulders, chest, and jaw.`,
          category: 'Grounding',
        },
        {
          id: `cs-2-${Date.now()}`,
          title: `Cognitive Reframing: ${cleanGoals}`,
          description: `When unhelpful thoughts arise regarding ${cleanGoals}, pause and ask: "Is this thought 100% factual right now, or is stress talking?"`,
          category: 'Cognitive',
        },
        {
          id: `cs-3-${Date.now()}`,
          title: 'Evening Decompression Routine',
          description: 'Spend 5 minutes before bed writing down 2 small progress wins from today to quiet bedtime mental chatter.',
          category: 'Behavioral',
        },
      ],
      daily_exercises: [
        {
          id: `de-1-${Date.now()}`,
          title: `5-Minute Morning Focus: ${cleanGoals}`,
          duration: '5 mins',
          target_frequency: 'Daily (Morning)',
        },
        {
          id: `de-2-${Date.now()}`,
          title: 'Midday 3-Minute Abdominal Breath Reset',
          duration: '3 mins',
          target_frequency: 'Daily (Midday)',
        },
      ],
      resources: [
        {
          title: 'MindBloom Self-Guided CBT & Grounding Starter Manual (PDF)',
          url: '#',
        },
      ],
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

  const deleteUserProfile = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_deleted: true, deactivated_at: new Date().toISOString() } : u
      )
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
        allUsersList: usersList,
        deleteUserProfile,
        analytics,
        counselorApplications,
        sessionTypes,
        submitCounselorApplication,
        approveCounselorApplication,
        rejectCounselorApplication,
        refreshCounselorApplications,
        addSessionType,
        toggleSessionType,
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
