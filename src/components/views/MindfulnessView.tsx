'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MindfulnessProgram } from '@/lib/types';
import {
  Sparkles,
  Play,
  Pause,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  Heart,
  Headphones,
} from 'lucide-react';

export const MindfulnessView: React.FC = () => {
  const { mindfulnessPrograms } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProgram, setActiveProgram] = useState<MindfulnessProgram | null>(
    mindfulnessPrograms[0]
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full inline-block mb-2">
              Clinical Wellness Media Library
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Mindfulness & Self-Care Sessions
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Curated audio meditations, body scans, and breathing exercises crafted to reduce nervous system arousal and foster peaceful sleep.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <Headphones className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Active Media Player Card */}
      {activeProgram && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={activeProgram.thumbnail_url}
              alt={activeProgram.title}
              className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl object-cover shadow-lg border border-white/10 shrink-0"
            />

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                {activeProgram.category} • {activeProgram.instructor}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold">{activeProgram.title}</h3>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                {activeProgram.description}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                <button
                  onClick={() => handlePlayProgram(activeProgram)}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all transform active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" /> Pause Session
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" /> Start Guided Audio
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  {activeProgram.duration_minutes} Minutes
                </div>
              </div>
            </div>
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={activeProgram.media_url}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* Program Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((prog) => {
          const isSelected = activeProgram?.id === prog.id;
          return (
            <div
              key={prog.id}
              onClick={() => handlePlayProgram(prog)}
              className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between ${
                isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="relative mb-3 rounded-2xl overflow-hidden aspect-video">
                  <img
                    src={prog.thumbnail_url}
                    alt={prog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-emerald-800 flex items-center justify-center shadow-md">
                      <Play className="w-5 h-5 fill-emerald-800 ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                    {prog.duration_minutes}m
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                  {prog.category}
                </span>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{prog.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {prog.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{prog.instructor}</span>
                <span className="text-emerald-700 font-bold hover:underline">
                  {isSelected && isPlaying ? 'Playing ♪' : 'Listen Now →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
