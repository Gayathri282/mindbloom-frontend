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
  Star,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface BookingViewProps {
  setActiveTab: (tab: string) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ setActiveTab }) => {
  const { user, slots, addSlot, removeSlot, bookAppointment } = useApp();

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

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
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Rich Practitioner Showcase Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-200 bg-white">
        <div className="h-32 bg-gradient-to-r from-sky-800 via-cyan-800 to-indigo-900 relative">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80"
            alt="Clinic Environment"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-200" /> Verified Clinical Practitioner
          </span>
        </div>

        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-12 sm:-mt-14 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <img
                src="https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=400&auto=format&fit=crop&q=80"
                alt="Dr. Sarah Jenkins"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white object-cover shadow-lg shrink-0 bg-white"
              />
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Dr. Sarah Jenkins, Psy.D.
                  </h2>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    4.98 (124 reviews)
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mb-2">
                  Licensed Clinical Psychologist • Cognitive Behavioral Therapy & Anxiety Specialist
                </p>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2.5 py-0.5 bg-sky-50 text-sky-800 rounded-full font-bold border border-sky-200">
                    CBT Therapy
                  </span>
                  <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-800 rounded-full font-bold border border-cyan-200">
                    Anxiety & Stress
                  </span>
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-800 rounded-full font-bold border border-indigo-200">
                    Mindfulness Grounding
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-2xl p-4 text-center shrink-0 w-full md:w-auto">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-900 mb-1">
                <Video className="w-4 h-4 text-sky-600" />
                100% Encrypted Video Format
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                50-minute individual session
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Therapist Slot Management Controls */}
      {user.role === 'therapist' && (
        <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-200" />
              Therapist Availability Management
            </h3>
            <span className="text-xs text-sky-100">
              Publish consultation slots
            </span>
          </div>

          <form onSubmit={handleAddSlot} className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Day Label (e.g. Tomorrow)"
              value={newDayLabel}
              onChange={(e) => setNewDayLabel(e.target.value)}
              className="px-3.5 py-2 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-xl text-xs focus:outline-none"
            />
            <input
              type="text"
              placeholder="Time Label (e.g. 2:00 PM - 2:50 PM)"
              value={newTimeLabel}
              onChange={(e) => setNewTimeLabel(e.target.value)}
              className="px-3.5 py-2 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-xl text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white text-sky-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:bg-sky-50"
            >
              <Plus className="w-4 h-4 text-sky-700" /> Add Slot
            </button>
          </form>
        </div>
      )}

      {/* Slot Selection Grid */}
      <div className="refreshing-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-sky-600" />
              Select Available Consultation Slot
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Click a slot to reserve your 50-minute video session with Dr. Sarah Jenkins.
            </p>
          </div>
          <span className="text-xs font-bold text-sky-800 bg-sky-100/90 px-3 py-1 rounded-full border border-sky-300">
            {slots.filter((s) => !s.is_booked).length} Open Slots
          </span>
        </div>

        {bookingSuccess && (
          <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 text-xs text-sky-900 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Consultation Booked Successfully!</p>
              <p className="text-[11px] text-sky-800 font-medium">
                Your consultation room with Dr. Sarah Jenkins is active. Redirecting...
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

                {user.role === 'therapist' ? (
                  <button
                    onClick={() => removeSlot(slot.id)}
                    disabled={slot.is_booked}
                    className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                      slot.is_booked
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Slot
                  </button>
                ) : (
                  <button
                    disabled={slot.is_booked}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all ${
                      slot.is_booked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isSelected
                        ? 'blue-gradient-btn text-white shadow-xs'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
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
          <div className="mt-8 p-5 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-300" /> Confirm Session Booking
              </h4>
              <p className="text-xs text-sky-100 font-medium">
                50-minute video session with Dr. Sarah Jenkins
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedSlotId(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                className="px-5 py-2 blue-gradient-btn text-white font-bold text-xs rounded-xl shadow-md transition-all"
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
