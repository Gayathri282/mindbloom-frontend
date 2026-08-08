'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MindfulnessProgram } from '@/lib/types';
import {
  Sparkles,
  Play,
  Pause,
  Clock,
  Headphones,
  Volume2,
} from 'lucide-react';

export const MindfulnessView: React.FC = () => {
  const { mindfulnessPrograms } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProgram, setActiveProgram] = useState<MindfulnessProgram | null>(
    mindfulnessPrograms[0]
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = ['All', 'Anxiety Relief', 'Sleep & Rest', 'Stress Management'];

  const filteredPrograms =
    selectedCategory === 'All'
      ? mindfulnessPrograms
      : mindfulnessPrograms.filter((p) => p.category === selectedCategory);

  const handlePlayProgram = (prog: MindfulnessProgram) => {
    if (activeProgram?.id === prog.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setActiveProgram(prog);
      setIsPlaying(true);
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Scenery Banner with High Quality Photography */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-200 bg-slate-900 text-white min-h-[200px] flex items-center p-6 sm:p-8">
        <img
          src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1400&auto=format&fit=crop&q=80"
          alt="Serene Nature Scenery"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-teal-950/80 to-transparent"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <div>
            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-bold rounded-full inline-block mb-2 border border-emerald-400/30 backdrop-blur-md">
              Clinical Wellness Audio Library
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Mindfulness & Guided Meditation
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl font-medium">
              Curated audio sessions, body scans, and breathing exercises to calm nervous system arousal.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl emerald-gradient-btn text-white flex items-center justify-center shrink-0 shadow-lg">
            <Headphones className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'emerald-gradient-btn text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Active Media Player Card with High Res Image */}
      {activeProgram && (
        <div className="relative bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden border border-white/10">
          <div className="absolute inset-0 pattern-dots opacity-15 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <img
              src={activeProgram.thumbnail_url}
              alt={activeProgram.title}
              className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl object-cover shadow-2xl border-2 border-white/20 shrink-0"
            />

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 text-emerald-200 text-[11px] font-bold rounded-full border border-white/20 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {activeProgram.category} • {activeProgram.instructor}
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold">{activeProgram.title}</h3>
              <p className="text-xs sm:text-sm text-slate-200 max-w-lg leading-relaxed font-medium">
                {activeProgram.description}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                <button
                  onClick={() => handlePlayProgram(activeProgram)}
                  className="px-6 py-3.5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-emerald-950" /> Pause Session
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-emerald-950" /> Play Guided Audio
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-emerald-200 font-bold bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <Clock className="w-4 h-4 text-emerald-300" />
                  {activeProgram.duration_minutes} Minutes
                </div>
              </div>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={activeProgram.media_url}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* Program Grid with High Res Photography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((prog) => {
          const isSelected = activeProgram?.id === prog.id;
          return (
            <div
              key={prog.id}
              onClick={() => handlePlayProgram(prog)}
              className={`refreshing-card p-5 cursor-pointer flex flex-col justify-between ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : ''
              }`}
            >
              <div>
                <div className="relative mb-3 rounded-2xl overflow-hidden aspect-video shadow-xs">
                  <img
                    src={prog.thumbnail_url}
                    alt={prog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-emerald-800 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-md border border-white/20">
                    {prog.duration_minutes}m
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block mb-1.5 border border-emerald-200">
                  {prog.category}
                </span>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{prog.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 font-medium">
                  {prog.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="text-slate-700">{prog.instructor}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1 hover:underline">
                  {isSelected && isPlaying ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Playing ♪
                    </>
                  ) : (
                    'Listen Now →'
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
