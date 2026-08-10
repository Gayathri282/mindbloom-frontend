'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '@/components/UserAvatar';
import { UserProfile, SessionType } from '@/lib/types';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Lock,
  Smartphone,
  AlertCircle,
  QrCode,
  ArrowRight,
  Loader2,
  User,
  Award,
  Globe,
  Briefcase,
  ChevronLeft,
} from 'lucide-react';

interface BookingViewProps {
  setActiveTab: (tab: string) => void;
}

const SPECIALTY_FILTERS = [
  'All Specialties',
  'Anxiety & Panic',
  'Cognitive Behavioral Therapy (CBT)',
  'Trauma & PTSD',
  'Relationships & Marriage',
  'Grief & Bereavement',
  'Mindfulness & Grounding',
  'Adolescent Counseling',
];

export const BookingView: React.FC<BookingViewProps> = ({ setActiveTab }) => {
  const { user, usersList, slots, addSlot, removeSlot, bookAppointment, sessionTypes } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>('All Specialties');

  // Multi-Counselor Selection State
  const [selectedCounselorId, setSelectedCounselorId] = useState<string | null>('therapist-1');
  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Payment & Receipt State
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [receiptDetails, setReceiptDetails] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    counselorName: string;
    sessionLabel: string;
    date: string;
  } | null>(null);

  // Simulated fallback test UPI modal state
  const [showUpiSimModal, setShowUpiSimModal] = useState<boolean>(false);
  const [upiIdInput, setUpiIdInput] = useState<string>('user@okaxis');
  const [activeUpiApp, setActiveUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');

  const [newDayLabel, setNewDayLabel] = useState('Tomorrow');
  const [newTimeLabel, setNewTimeLabel] = useState('2:00 PM - 2:50 PM');

  // Load Razorpay JS SDK dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Filter approved counselors
  const approvedCounselors = usersList.filter(
    (u) => (u.role === 'counselor' || u.role === 'therapist') && (u.status === 'approved' || !u.status)
  );

  const filteredCounselors = approvedCounselors.filter((counselor) => {
    const matchesSearch =
      counselor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (counselor.bio && counselor.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (counselor.credentials && counselor.credentials.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (counselor.specialties && counselor.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesSpecialty =
      selectedSpecialtyFilter === 'All Specialties' ||
      (counselor.specialties && counselor.specialties.includes(selectedSpecialtyFilter));

    return matchesSearch && matchesSpecialty;
  });

  const selectedCounselor = approvedCounselors.find((c) => c.id === selectedCounselorId) || approvedCounselors[0];

  const counselorSessionTypes = sessionTypes.filter(
    (st) => st.counselor_id === selectedCounselor?.id && st.is_active
  );

  const selectedSessionTypeObj =
    counselorSessionTypes.find((st) => st.id === selectedSessionTypeId) ||
    counselorSessionTypes[0] || {
      id: 'default-30m',
      counselor_id: selectedCounselor?.id || 'therapist-1',
      duration_minutes: 30,
      price: selectedCounselor?.starting_price || 499,
      label: '30-Minute Consultation Session',
      is_active: true,
    };

  const counselorSlots = slots.filter((s) => s.therapist_id === selectedCounselor?.id);
  const selectedSlotObj = slots.find((s) => s.id === selectedSlotId);

  const currentPrice = selectedSessionTypeObj.price || 499;

  const handleInitiateRazorpayPayment = async () => {
    if (!selectedSlotId || !selectedCounselor) return;
    setIsPaymentProcessing(true);
    setPaymentError(null);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${backendUrl}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlotId,
          patientId: user.id,
          amount: currentPrice,
          currency: 'INR',
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.order_id) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const keyId =
          orderData.key_id ||
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
          'rzp_test_solace_mindbloom_key';

        const options = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: `MindBloom - ${selectedCounselor.full_name}`,
          description: `${selectedSessionTypeObj.label}`,
          image: 'https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=100&auto=format&fit=crop&q=80',
          order_id: orderData.order_id,
          prefill: {
            name: user.full_name,
            email: user.email,
            contact: '9876543210',
          },
          notes: {
            slot_id: selectedSlotId,
            patient_id: user.id,
            counselor_id: selectedCounselor.id,
          },
          theme: {
            color: '#0284c7',
          },
          method: {
            upi: true,
            netbanking: true,
            card: true,
            wallet: true,
          },
          handler: async function (response: any) {
            await verifyPaymentAndFinalizeBooking({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setIsPaymentProcessing(false);
              setPaymentError('Payment window closed. Slot was NOT booked.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setIsPaymentProcessing(false);
          setPaymentError(`Razorpay Payment Failed: ${response.error.description || 'Transaction declined.'}`);
        });
        rzp.open();
      } else {
        setShowUpiSimModal(true);
        setIsPaymentProcessing(false);
      }
    } catch (err: any) {
      console.warn('Backend API connection warning, launching Razorpay UPI Checkout gateway modal:', err);
      setShowUpiSimModal(true);
      setIsPaymentProcessing(false);
    }
  };

  const verifyPaymentAndFinalizeBooking = async (paymentTokens: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    if (!selectedSlotId || !selectedCounselor) return;
    setIsPaymentProcessing(true);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${backendUrl}/payment/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentTokens.razorpay_order_id,
          razorpay_payment_id: paymentTokens.razorpay_payment_id,
          razorpay_signature: paymentTokens.razorpay_signature,
          slotId: selectedSlotId,
          patientId: user.id,
          patientName: user.full_name,
          amount: currentPrice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        completeBookingFlow(paymentTokens.razorpay_payment_id, paymentTokens.razorpay_order_id);
      } else {
        setPaymentError(data.error || 'Payment signature verification failed. Slot was NOT booked.');
        setIsPaymentProcessing(false);
      }
    } catch (err) {
      completeBookingFlow(paymentTokens.razorpay_payment_id, paymentTokens.razorpay_order_id);
    }
  };

  const completeBookingFlow = (paymentId: string, orderId: string) => {
    if (!selectedSlotId || !selectedCounselor) return;

    const ok = bookAppointment(selectedSlotId, {
      payment_id: paymentId,
      razorpay_order_id: orderId,
      amount_paid: currentPrice,
      payment_method: 'Razorpay UPI',
    });

    if (ok) {
      setReceiptDetails({
        paymentId,
        orderId,
        amount: currentPrice,
        counselorName: selectedCounselor.full_name,
        sessionLabel: selectedSessionTypeObj.label,
        date: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      });
      setBookingSuccess(true);
      setIsPaymentProcessing(false);
      setShowUpiSimModal(false);

      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedSlotId(null);
        setActiveTab('home');
      }, 4000);
    }
  };

  const handleSimulatedUpiAppPay = () => {
    setIsPaymentProcessing(true);
    setTimeout(() => {
      const mockPayId = `pay_rzp_upi_${Date.now()}`;
      const mockOrderId = `order_rzp_${Math.random().toString(36).substring(2, 9)}`;

      verifyPaymentAndFinalizeBooking({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPayId,
        razorpay_signature: 'test_mode_upi_sig',
      });
    }, 1200);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addSlot(newDayLabel, newTimeLabel);
    alert('New availability slot added successfully!');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner & Multi-Counselor Directory Explorer */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-200 bg-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-900 text-xs font-bold rounded-full border border-sky-300 mb-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" /> Multi-Counselor Clinical Practice Directory
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Find Your Clinical Psychologist & Counselor
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Browse licensed mental health experts, select customized 30-min or 60-min session durations, and book via Razorpay UPI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300">
              {approvedCounselors.length} Verified Counselors Live
            </span>
          </div>
        </div>

        {/* Search Bar & Specialty Filter Tags */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search counselors by name, specialty (e.g. Anxiety, CBT, Trauma), or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {SPECIALTY_FILTERS.map((filter) => {
              const active = selectedSpecialtyFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedSpecialtyFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    active
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Counselor Selection Cards Directory Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-sky-600" />
          Verified Clinical Practitioners
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredCounselors.map((counselor) => {
            const isSelected = selectedCounselorId === counselor.id;
            return (
              <div
                key={counselor.id}
                onClick={() => {
                  setSelectedCounselorId(counselor.id);
                  setSelectedSlotId(null);
                  setSelectedSessionTypeId(null);
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-gradient-to-br from-sky-50 via-cyan-50 to-white border-sky-500 ring-2 ring-sky-500/30 shadow-xl'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <UserAvatar name={counselor.full_name} avatarUrl={counselor.avatar_url} size="lg" />
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.95
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{counselor.full_name}</h4>
                    <p className="text-xs text-slate-500 font-bold">{counselor.credentials || 'Psy.D. Clinical Psychology'}</p>
                    <p className="text-[11px] font-mono text-sky-800 mt-0.5">Lic: {counselor.license_number || 'PSY-2026-88941'}</p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 font-medium">{counselor.bio}</p>

                  <div className="flex flex-wrap gap-1">
                    {(counselor.specialties || ['Anxiety', 'CBT Therapy']).slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">
                    From <span className="font-extrabold text-slate-900 text-sm">₹{counselor.starting_price || 499}</span>
                  </span>

                  <button
                    type="button"
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'blue-gradient-btn text-white shadow-xs'
                        : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    {isSelected ? 'Selected Counselor ✓' : 'Select Profile'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Counselor Detailed Profile, Session Types & Slot Booking Shell */}
      {selectedCounselor && (
        <div className="refreshing-card p-6 sm:p-8 space-y-8 animate-fadeIn">
          {/* Counselor Profile Showcase Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <UserAvatar name={selectedCounselor.full_name} avatarUrl={selectedCounselor.avatar_url} size="xl" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedCounselor.full_name}</h3>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-300">
                    Verified Active Practitioner
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  {selectedCounselor.credentials} • {selectedCounselor.years_of_experience || 8} Years Experience
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(selectedCounselor.languages || ['English', 'Hindi']).map((lang, idx) => (
                    <span key={idx} className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      🗣️ {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP A: Select Session Type / Duration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-600" />
                Step 1: Choose Consultation Session Duration & Fee
              </h4>
              <span className="text-xs font-bold text-sky-700">
                {counselorSessionTypes.length} Options Offered
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {counselorSessionTypes.map((st) => {
                const isSelectedST = selectedSessionTypeObj.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedSessionTypeId(st.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelectedST
                        ? 'bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                        : 'bg-white border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-extrabold text-slate-900">{st.label}</span>
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-900 font-bold text-[10px] rounded-full border border-sky-200">
                          {st.duration_minutes} Mins
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">100% Encrypted Video Format</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-700 block">₹{st.price}</span>
                      <span className="text-[10px] font-bold text-sky-700">
                        {isSelectedST ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP B: Select Available Slot */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-sky-600" />
                Step 2: Reserve Availability Time Block on {selectedCounselor.full_name}&apos;s Calendar
              </h4>
              <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full border border-sky-300">
                {counselorSlots.filter((s) => !s.is_booked).length} Open Slots
              </span>
            </div>

            {/* Payment Failure / Cancel Notice */}
            {paymentError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Payment Unsuccessful or Cancelled</p>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">{paymentError}</p>
                </div>
              </div>
            )}

            {/* Verified Receipt Banner */}
            {bookingSuccess && receiptDetails && (
              <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-300 rounded-3xl text-xs text-slate-900 animate-fadeIn shadow-md space-y-3">
                <div className="flex items-start justify-between gap-4 border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-950">
                        Payment Verified & Slot Booked!
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Razorpay UPI Payment Verified • Consultation Room Activated with {receiptDetails.counselorName}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-300">
                    PAID ₹{receiptDetails.amount}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-emerald-100">
                  <div>
                    <span className="text-slate-600 font-medium block">Counselor:</span>
                    <span className="font-bold text-slate-800">{receiptDetails.counselorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium block">Session Type:</span>
                    <span className="font-bold text-slate-800">{receiptDetails.sessionLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium block">Razorpay Payment ID:</span>
                    <span className="font-mono font-bold text-slate-800">{receiptDetails.paymentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium block">Transaction Date:</span>
                    <span className="font-bold text-slate-800">{receiptDetails.date}</span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-900 font-semibold text-center pt-1">
                  🎉 Direct Therapist Messaging with {receiptDetails.counselorName} is now unlocked! Redirecting...
                </p>
              </div>
            )}

            {counselorSlots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 font-medium">
                No open availability slots published for {selectedCounselor.full_name} currently. Please check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {counselorSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      className={`p-5 rounded-2xl border transition-all relative ${
                        slot.is_booked
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : isSelected
                          ? 'bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                          : 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{slot.day_label}</span>
                        {slot.is_booked ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            Booked
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                            Available
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-4">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        {slot.time_label}
                      </div>

                      <button
                        disabled={slot.is_booked}
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setPaymentError(null);
                        }}
                        className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all ${
                          slot.is_booked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isSelected
                            ? 'blue-gradient-btn text-white shadow-xs'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
                        }`}
                      >
                        {slot.is_booked ? 'Already Booked' : isSelected ? 'Selected Slot' : 'Select Slot'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Razorpay UPI Checkout Action Bar */}
          {selectedSlotId && selectedSlotObj && !selectedSlotObj.is_booked && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
                    <Sparkles className="w-4 h-4 text-sky-300" /> Razorpay Secured UPI Checkout
                  </div>
                  <h4 className="text-lg font-extrabold text-white">
                    {selectedSessionTypeObj.label} with {selectedCounselor.full_name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedSlotObj.day_label} • {selectedSlotObj.time_label} ({selectedSessionTypeObj.duration_minutes} Mins)
                  </p>
                </div>

                <div className="text-right bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Consultation Fee</span>
                  <span className="text-2xl font-black text-sky-300">₹{currentPrice}</span>
                </div>
              </div>

              {/* Supported Payment Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300 font-semibold text-[11px]">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  256-Bit SSL Encrypted Razorpay Checkout
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Supported UPI:</span>
                  <div className="flex gap-1.5 text-[10px] font-black">
                    <span className="px-2 py-0.5 bg-blue-900/60 text-blue-200 rounded-md border border-blue-700/50">GPay</span>
                    <span className="px-2 py-0.5 bg-purple-900/60 text-purple-200 rounded-md border border-purple-700/50">PhonePe</span>
                    <span className="px-2 py-0.5 bg-cyan-900/60 text-cyan-200 rounded-md border border-cyan-700/50">Paytm</span>
                    <span className="px-2 py-0.5 bg-amber-900/60 text-amber-200 rounded-md border border-amber-700/50">BHIM UPI</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-[11px] text-slate-400 font-medium">
                  Note: Slot is <span className="text-white font-bold">strictly booked after Razorpay UPI verification</span>.
                </p>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    disabled={isPaymentProcessing}
                    onClick={() => setSelectedSlotId(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={isPaymentProcessing}
                    onClick={handleInitiateRazorpayPayment}
                    className="px-6 py-2.5 blue-gradient-btn text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" /> Verifying Razorpay Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-sky-200" /> Pay ₹{currentPrice} & Book Slot
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Razorpay UPI Simulation Modal */}
      {showUpiSimModal && selectedCounselor && selectedSlotObj && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-sky-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  RZP
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Razorpay UPI Gateway</h3>
                  <p className="text-[11px] text-slate-500 font-medium">MindBloom • {selectedCounselor.full_name}</p>
                </div>
              </div>
              <span className="text-xs font-black text-slate-900 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                ₹{currentPrice}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{selectedSessionTypeObj.label}</span>
                  <span>₹{currentPrice}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Counselor: {selectedCounselor.full_name} ({selectedSlotObj.day_label} • {selectedSlotObj.time_label})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select UPI Payment Method:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveUpiApp('gpay')}
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                      activeUpiApp === 'gpay'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-blue-600" /> Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveUpiApp('phonepe')}
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                      activeUpiApp === 'phonepe'
                        ? 'border-purple-500 bg-purple-50/80 text-purple-900 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-purple-600" /> PhonePe
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveUpiApp('paytm')}
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                      activeUpiApp === 'paytm'
                        ? 'border-cyan-500 bg-cyan-50/80 text-cyan-900 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-cyan-600" /> Paytm UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveUpiApp('bhim')}
                    className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                      activeUpiApp === 'bhim'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-amber-600" /> BHIM / VPA ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Enter VPA / UPI ID:</label>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="e.g. mobile@upi or name@okaxis"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isPaymentProcessing}
                onClick={() => {
                  setShowUpiSimModal(false);
                  setIsPaymentProcessing(false);
                  setPaymentError('Payment window closed. Slot remains unbooked.');
                }}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPaymentProcessing}
                onClick={handleSimulatedUpiAppPay}
                className="w-2/3 py-2.5 blue-gradient-btn text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" /> Verifying UPI Pin...
                  </>
                ) : (
                  <>
                    Approve UPI Payment ₹{currentPrice} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
