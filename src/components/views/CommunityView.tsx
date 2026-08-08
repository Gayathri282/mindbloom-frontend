'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Plus,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export const CommunityView: React.FC = () => {
  const { user, communityPosts, addCommunityPost, addCommunityComment } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Anxiety Support');

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const categories = ['All', 'Anxiety Support', 'Managing Grief', 'Healthy Relationships'];

  const visiblePosts = communityPosts.filter((post) => {
    const categoryMatch = selectedCategory === 'All' || post.category === selectedCategory;
    const statusMatch = post.status === 'approved' || post.author_id === user.id || user.role === 'admin';
    return categoryMatch && statusMatch;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;
    addCommunityPost(postCategory, postTitle, postContent);
    setPostTitle('');
    setPostContent('');
    setShowNewPostModal(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = replyTextMap[postId];
    if (!text || !text.trim()) return;
    addCommunityComment(postId, text);
    setReplyTextMap((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="refreshing-card p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-bold rounded-full mb-2 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Moderated Peer Support Space
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Community Peer Support Forums
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Share experiences and offer gentle encouragement in a safe, moderated environment.
            </p>
          </div>

          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-5 py-2.5 mint-glow text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Start Discussion
          </button>
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
                ? 'mint-glow text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Discussion Posts Feed */}
      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <div
            key={post.id}
            className="refreshing-card p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'}
                  alt={post.author_name}
                  className="w-10 h-10 rounded-full border border-emerald-500 object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{post.author_name}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                  {post.category}
                </span>

                {post.status === 'pending' && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" /> Pending Approval
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{post.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{post.content}</p>
            </div>

            {/* Approved Comments List */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  {post.comments_count} Community Replies
                </span>
              </div>

              {post.comments?.filter((c) => c.status === 'approved' || c.author_id === user.id || user.role === 'admin').map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.author_name}</span>
                    {c.status === 'pending' && (
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                        Pending Moderation
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 text-xs">{c.content}</p>
                </div>
              ))}

              {/* Add Comment Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Share a thoughtful reply (moderated before live)..."
                  value={replyTextMap[post.id] || ''}
                  onChange={(e) =>
                    setReplyTextMap({ ...replyTextMap, [post.id]: e.target.value })
                  }
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={() => handleCommentSubmit(post.id)}
                  className="px-4 py-2 mint-glow text-white font-bold text-xs rounded-xl shadow-2xs transition-all"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-emerald-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Start a Peer Support Discussion
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic Category
                </label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="Anxiety Support">Anxiety Support</option>
                  <option value="Managing Grief">Managing Grief</option>
                  <option value="Healthy Relationships">Healthy Relationships</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your question or insight..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details in a compassionate tone..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 mint-glow text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Submit for Moderation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
