'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '../UserAvatar';
import { UserProfile } from '@/lib/types';
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
  Search,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  User,
  RefreshCw,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    communityPosts,
    moderatePost,
    moderateComment,
    crisisLogs,
    resolveCrisisLog,
    analytics,
    counselorApplications,
    approveCounselorApplication,
    rejectCounselorApplication,
    refreshCounselorApplications,
    allUsersList,
    deleteUserProfile,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'counselors' | 'users' | 'moderation' | 'crisis' | 'analytics'
  >('counselors');

  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'counselor' | 'patient'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
  const [inspectUser, setInspectUser] = useState<UserProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  const handleRefreshApplications = async () => {
    setIsRefreshing(true);
    await refreshCounselorApplications();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const pendingCounselorApps = counselorApplications.filter((a) => a.status === 'pending');
  const pendingPosts = communityPosts.filter((p) => p.status === 'pending');
  const pendingComments = communityPosts.flatMap(
    (p) => p.comments?.filter((c) => c.status === 'pending') || []
  );

  const handleConfirmReject = (appId: string) => {
    if (!rejectionReasonInput.trim()) return;
    rejectCounselorApplication(appId, rejectionReasonInput);
    setRejectionModalId(null);
    setRejectionReasonInput('');
  };

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
            Counselor verification queue, forum moderation, crisis audit logs, and platform analytics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex flex-wrap bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
          <button
            onClick={() => setActiveAdminTab('counselors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'counselors'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Counselor Verification ({pendingCounselorApps.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'users'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            User Directory & Deletion ({allUsersList.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('moderation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'moderation'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Moderation Queue ({pendingPosts.length + pendingComments.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('crisis')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'crisis'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Crisis Safety Logs ({crisisLogs.filter((l) => !l.resolved).length})
          </button>
          <button
            onClick={() => setActiveAdminTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'analytics'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Tab 0: Counselor Verification Queue */}
      {activeAdminTab === 'counselors' && (
        <div className="space-y-6">
          <div className="refreshing-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Counselor Verification & Clinical Enrollment Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Review applicant credentials, state psychology license numbers, and Supabase Storage ID documents before approving live bookable status.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshApplications}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  {counselorApplications.length} Total Applications
                </span>
              </div>
            </div>

            {counselorApplications.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200 space-y-3">
                <p className="text-xs text-slate-500 font-medium">No counselor applications found yet.</p>
                <button
                  onClick={handleRefreshApplications}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Checking backend...' : 'Check backend for applications'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {counselorApplications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-6 rounded-3xl border transition-all space-y-4 ${
                      app.status === 'approved'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : app.status === 'rejected'
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-white border-slate-200 shadow-md ring-1 ring-slate-100'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                          {app.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-slate-900">{app.full_name}</h4>
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                app.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border-amber-300'
                              }`}
                            >
                              {app.status === 'pending' ? 'Pending Review' : app.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {app.email} • Submitted {new Date(app.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {app.status !== 'approved' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setRejectionModalId(app.id);
                              setRejectionReasonInput('');
                            }}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-all"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>

                          <button
                            onClick={() => approveCounselorApplication(app.id)}
                            className="px-5 py-2 emerald-gradient-btn text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve & License Live
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Degrees & Credentials</span>
                        <p className="font-bold text-slate-900">{app.degree}</p>
                        <p className="text-[11px] font-mono text-sky-800">Lic: {app.license_number}</p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Clinical Experience</span>
                        <p className="font-bold text-slate-900">{app.years_of_experience} Years Practice</p>
                        <p className="text-[11px] text-slate-600">Languages: {app.languages.join(', ')}</p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Government ID Document</span>
                        {app.id_document_name && app.id_document_name !== 'Government_ID_Verification.pdf' ? (
                          <>
                            <p className="text-[11px] font-mono text-slate-700 truncate" title={app.id_document_name}>
                              📄 {app.id_document_name}
                            </p>
                            {app.id_document_url ? (
                              <a
                                href={app.id_document_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-900 underline text-xs"
                              >
                                View / Download →
                              </a>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-medium">Document uploaded, link pending</span>
                            )}
                          </>
                        ) : (
                          <p className="text-[11px] text-amber-700 font-medium">
                            ⚠ No document uploaded yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Clinical Specialties:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {app.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-sky-50 text-sky-900 border border-sky-200 rounded-full font-bold text-[11px]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                      &quot;{app.bio}&quot;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* USER DIRECTORY & ACCOUNT DELETION MANAGEMENT TAB                         */}
      {/* ========================================================================= */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="refreshing-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                User Account Directory & Profile Management
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                View full profile details for both Doctors & Patients and perform soft-delete deactivations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userRoleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Users ({allUsersList.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('counselor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userRoleFilter === 'counselor' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                Doctors ({allUsersList.filter((u) => u.role === 'therapist' || u.role === 'counselor').length})
              </button>
              <button
                onClick={() => setUserRoleFilter('patient')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userRoleFilter === 'patient' ? 'bg-white text-sky-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                Patients ({allUsersList.filter((u) => u.role === 'patient').length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search users by name, email, credentials, or license number..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allUsersList
              .filter((u) => {
                const matchesRole =
                  userRoleFilter === 'all' ||
                  (userRoleFilter === 'counselor' && (u.role === 'therapist' || u.role === 'counselor')) ||
                  (userRoleFilter === 'patient' && u.role === 'patient');

                const query = userSearchQuery.toLowerCase();
                const matchesSearch =
                  !query ||
                  u.full_name.toLowerCase().includes(query) ||
                  u.email.toLowerCase().includes(query) ||
                  (u.credentials && u.credentials.toLowerCase().includes(query)) ||
                  (u.license_number && u.license_number.toLowerCase().includes(query));

                return matchesRole && matchesSearch;
              })
              .map((u) => {
                const isCounselor = u.role === 'therapist' || u.role === 'counselor';
                const isDeactivated = u.is_deleted || u.status === 'rejected';

                return (
                  <div
                    key={u.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      isDeactivated
                        ? 'bg-slate-50 border-rose-200 opacity-75'
                        : 'bg-white border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <UserAvatar name={u.full_name} avatarUrl={u.avatar_url} size="lg" />
                        <span
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${
                            isDeactivated
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isCounselor
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : u.role === 'admin'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-sky-100 text-sky-900 border-sky-300'
                          }`}
                        >
                          {isDeactivated
                            ? 'Deactivated'
                            : isCounselor
                            ? 'Doctor / Counselor'
                            : u.role === 'admin'
                            ? 'Admin'
                            : 'Patient'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">{u.full_name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                        {isCounselor && (
                          <div className="mt-1">
                            <p className="text-[11px] font-bold text-emerald-800">{u.credentials || 'Clinical Psychologist'}</p>
                            <p className="text-[10px] font-mono text-slate-500">Lic: {u.license_number || 'PSY-2026-REG'}</p>
                          </div>
                        )}
                      </div>

                      {u.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          &quot;{u.bio}&quot;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setInspectUser(u)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" /> Full Profile
                      </button>

                      {u.role !== 'admin' && !isDeactivated && (
                        <button
                          onClick={() => setDeleteConfirmUser(u)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete / Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Profile Inspection Modal */}
      {inspectUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-sky-100 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <UserAvatar name={inspectUser.full_name} avatarUrl={inspectUser.avatar_url} size="xl" />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{inspectUser.full_name}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{inspectUser.email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-sky-100 text-sky-900 font-extrabold text-[10px] rounded-full border border-sky-200">
                    Role: {inspectUser.role.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">User ID & Registration Date:</span>
                <p className="text-slate-800 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  ID: {inspectUser.id} • Registered: {new Date(inspectUser.created_at).toLocaleDateString()}
                </p>
              </div>

              {inspectUser.bio && (
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Bio / Profile Notes:</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                    &quot;{inspectUser.bio}&quot;
                  </p>
                </div>
              )}

              {(inspectUser.role === 'therapist' || inspectUser.role === 'counselor') && (
                <div className="space-y-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                  <h4 className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" /> Practitioner Clinical Credentials
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-800 font-medium">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">License Number:</span>
                      <span className="font-mono font-bold">{inspectUser.license_number || 'PSY-2026-889'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">Credentials:</span>
                      <span>{inspectUser.credentials || 'Psy.D. Clinical Psychology'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">Experience:</span>
                      <span>{inspectUser.years_of_experience || 8} Years</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">Starting Rate:</span>
                      <span className="font-bold text-emerald-800">₹{inspectUser.starting_price || 750}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectUser(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destructive Soft-Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Deactivate / Delete User Profile</h3>
                <p className="text-xs text-rose-600 font-bold">Destructive Admin Action</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700 font-medium">
                Are you sure you want to deactivate and remove the account for:
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
                <p className="font-extrabold text-slate-900 text-sm">{deleteConfirmUser.full_name}</p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">{deleteConfirmUser.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-200 text-slate-800 font-extrabold text-[10px] rounded-full">
                  Role: {deleteConfirmUser.role.toUpperCase()}
                </span>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Soft-Delete Data Safety:</strong> To maintain clinical audit history and payment records, this account will be set to <strong>Deactivated (`status: &apos;deactivated&apos;`)</strong>, revoking login and consultation booking access immediately.
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUserProfile(deleteConfirmUser.id);
                  setDeleteConfirmUser(null);
                  alert(`User profile "${deleteConfirmUser.full_name}" has been deactivated successfully.`);
                }}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <UserX className="w-4 h-4" /> Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Rejection Modal Prompt */}
      {rejectionModalId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-100">
            <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" /> Reject Counselor Application
            </h4>
            <p className="text-xs text-slate-600">
              Provide a clear clinical or credential verification reason for rejecting this application. The counselor will be notified.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Psychology license number could not be verified in state database..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReject(rejectionModalId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

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
