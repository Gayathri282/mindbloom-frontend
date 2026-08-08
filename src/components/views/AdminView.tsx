'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    communityPosts,
    moderatePost,
    moderateComment,
    crisisLogs,
    resolveCrisisLog,
    analytics,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'moderation' | 'crisis' | 'analytics'
  >('moderation');

  const pendingPosts = communityPosts.filter((p) => p.status === 'pending');
  const pendingComments = communityPosts.flatMap(
    (p) => p.comments?.filter((c) => c.status === 'pending') || []
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Admin Top Header Banner with SVG Pattern */}
      <div className="relative bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-emerald-200 text-xs font-bold rounded-full border border-white/20 mb-2 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Clinical Operations & Admin Console
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">MindBloom Admin Control Center</h2>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Moderation queues, safety audit logs, and platform MRR analytics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
          <button
            onClick={() => setActiveAdminTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'moderation'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Moderation Queue ({pendingPosts.length + pendingComments.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('crisis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'crisis'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Crisis Safety Logs ({crisisLogs.filter((l) => !l.resolved).length})
          </button>
          <button
            onClick={() => setActiveAdminTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'analytics'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Business Analytics
          </button>
        </div>
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeAdminTab === 'moderation' && (
        <div className="space-y-6">
          <div className="refreshing-card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Pending Forum Posts Requiring Clinical Review
            </h3>

            {pendingPosts.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 font-medium">
                All community posts have been reviewed and moderated! ✓
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-xs">
                          {post.author_name}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          {post.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{post.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 max-w-xl">{post.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => moderatePost(post.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => moderatePost(post.id, 'approved')}
                        className="px-4 py-1.5 emerald-gradient-btn text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Live
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Comments Queue */}
          <div className="refreshing-card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Pending Forum Comments Queue
            </h3>

            {pendingComments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 font-medium">
                No pending comments awaiting review.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingComments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{comm.author_name}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{comm.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => moderateComment(comm.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => moderateComment(comm.id, 'approved')}
                        className="px-4 py-1.5 emerald-gradient-btn text-white font-bold text-xs rounded-xl shadow-2xs"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Crisis Safety Audit Logs */}
      {activeAdminTab === 'crisis' && (
        <div className="refreshing-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                AI Crisis Detection Audit Logs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Privacy-protected audit flags. Message content remains confidential.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {crisisLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  log.resolved
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-amber-50/90 border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      Patient: {log.patient_name}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-bold text-[10px] rounded-full">
                      {log.trigger_phrase_category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Flagged at {new Date(log.created_at).toLocaleString()} • Crisis Card Surfaced
                  </p>
                </div>

                <div>
                  {log.resolved ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Resolved & Followed Up ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => resolveCrisisLog(log.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                    >
                      Mark Reviewed & Followed Up
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Business Analytics */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="refreshing-card p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Monthly Revenue</span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-2xl font-extrabold text-emerald-700">
                ${analytics.mrr.toLocaleString()}
              </h4>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" /> ↑ 14% vs last month
              </span>
            </div>

            <div className="refreshing-card p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Patients</span>
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-2xl font-extrabold text-slate-900">
                {analytics.activePatients}
              </h4>
              <span className="text-[11px] font-bold text-emerald-600">↑ 8 new this week</span>
            </div>

            <div className="refreshing-card p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Completed Sessions</span>
                <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-2xl font-extrabold text-slate-900">
                {analytics.completedSessions}
              </h4>
              <span className="text-[11px] font-bold text-sky-600">100% verified present</span>
            </div>

            <div className="refreshing-card p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Monthly Churn</span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-2xl font-extrabold text-slate-900">
                {analytics.churnRate}%
              </h4>
              <span className="text-[11px] font-bold text-emerald-600">Healthy retention benchmark</span>
            </div>
          </div>

          {/* Signup Funnel Breakdown */}
          <div className="refreshing-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Patient Signup & Booking Funnel Conversion
            </h3>

            <div className="space-y-3">
              {analytics.signupFunnel.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{step.step}</span>
                    <span>
                      {step.count.toLocaleString()} ({step.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="emerald-gradient-btn h-full rounded-full transition-all duration-500"
                      style={{ width: `${step.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
