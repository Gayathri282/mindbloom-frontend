'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  Trash2,
  CheckCircle2,
  User,
  ShieldCheck,
  Star,
  Award,
  AlertCircle,
} from 'lucide-react';

interface BookingViewProps {
  setActiveTab: (tab: string) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ setActiveTab }) => {
  const { user, slots, addSlot, removeSlot, bookAppointment, appointments } = useApp();

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Therapist slot creation modal state
  const [newDayLabel, setNewDayLabel] = useState('Tomorrow');
  const [newTimeLabel, setNewTimeLabel] = useState('2:00 PM - 2:50 PM');

  const handleBook = () => {
    if (!selectedSlotId) return;
    const ok = bookAppointment(selectedSlotId);
    if (ok) {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedSlotId(null);
        setActiveTab('home');
      }, 2000);
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addSlot(newDayLabel, newTimeLabel);
    alert('New availability slot added successfully!');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Therapist Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src="https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=300&auto=format&fit=crop&q=80"
              alt="Dr. Sarah Jenkins"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 border-emerald-600 object-cover shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-full">
                  Verified Practitioner
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.98 (124 reviews)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Dr. Sarah Jenkins, Psy.D.
              </h2>
              <p className="text-xs text-slate-600 font-semibold mb-2">
                Licensed Clinical Psychologist • Cognitive Behavioral Therapy (CBT) & Anxiety Specialist
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  Anxiety & Stress
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  Trauma & Burnout
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  Life Transitions
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-center shrink-0 w-full md:w-auto">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
              <Video className="w-4 h-4 text-emerald-700" />
              100% Video Call Format
            </div>
            <p className="text-[11px] text-slate-600">
              50-minute individual consultation
            </p>
          </div>
        </div>
      </div>

      {/* Therapist Slot Management Controls (Visible to Therapist role) */}
      {user.role === 'therapist' && (
        <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-300" />
              Therapist Slot Management Dashboard
            </h3>
            <span className="text-xs text-emerald-200">
              Add or remove consultation availability
            </span>
          </div>

          <form onSubmit={handleAddSlot} className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Day Label (e.g. Tomorrow, Mon Aug 10)"
              value={newDayLabel}
              onChange={(e) => setNewDayLabel(e.target.value)}
              className="px-3.5 py-2 bg-emerald-950/80 border border-emerald-700 text-white rounded-xl text-xs focus:outline-none"
            />
            <input
              type="text"
              placeholder="Time Label (e.g. 2:00 PM - 2:50 PM)"
              value={newTimeLabel}
              onChange={(e) => setNewTimeLabel(e.target.value)}
              className="px-3.5 py-2 bg-emerald-950/80 border border-emerald-700 text-white rounded-xl text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Slot
            </button>
          </form>
        </div>
      )}

      {/* Slot Selection Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-700" />
              Select Available Consultation Slot
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All appointments take place via secure encrypted video.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            {slots.filter((s) => !s.is_booked).length} Slots Open
          </span>
        </div>

        {bookingSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold">Consultation Booked Successfully!</p>
              <p className="text-[11px] text-emerald-800">
                Your consultation chat with Dr. Sarah Jenkins is now permanently unlocked. Redirecting...
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all relative ${
                  slot.is_booked
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isSelected
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{slot.day_label}</span>
                  {slot.is_booked ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Booked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Available
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-4">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {slot.time_label}
                </div>

                {user.role === 'therapist' ? (
                  <button
                    onClick={() => removeSlot(slot.id)}
                    disabled={slot.is_booked}
                    className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                      slot.is_booked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Slot
                  </button>
                ) : (
                  <button
                    disabled={slot.is_booked}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all ${
                      slot.is_booked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {slot.is_booked ? 'Already Booked' : isSelected ? 'Selected' : 'Select Slot'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Slot Confirmation Bar */}
        {selectedSlotId && user.role !== 'therapist' && (
          <div className="mt-8 p-5 bg-emerald-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold">Confirm Session Booking</h4>
              <p className="text-xs text-emerald-200">
                50-minute video session with Dr. Sarah Jenkins
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedSlotId(null)}
                className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Confirm & Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
