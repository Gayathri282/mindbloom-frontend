'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '@/components/UserAvatar';
import {
  MessageSquare,
  Plus,
  ShieldCheck,
  Clock,
  X,
  Users,
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100/80 text-sky-800 text-xs font-bold rounded-full mb-2 border border-sky-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              100% Moderated Peer Support Space
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Community Peer Support Forums
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
              Share experiences and offer gentle encouragement in a safe, moderated environment.
            </p>
          </div>

          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-5 py-2.5 blue-gradient-btn text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 transition-all shrink-0"
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
                ? 'blue-gradient-btn text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-sky-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Discussion Posts Feed */}
      <div className="space-y-4">
        {visiblePosts.length === 0 ? (
          <div className="refreshing-card p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-sky-400 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-slate-900">No discussions posted yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
              Be the first to start a peer support thread in this category. All discussions are reviewed safely by clinical staff.
            </p>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="px-5 py-2.5 blue-gradient-btn text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Start Discussion
            </button>
          </div>
        ) : (
          visiblePosts.map((post) => (
            <div
              key={post.id}
              className="refreshing-card p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={post.author_name} avatarUrl={post.author_avatar} size="sm" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{post.author_name}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-full border border-sky-200">
                    {post.category}
                  </span>

                  {post.status === 'pending' && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md flex items-center gap-1">
                      <Clock className="w-3 3 text-amber-700" /> Pending Approval
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{post.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{post.content}</p>
              </div>

              {/* Approved Comments List */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-sky-600" />
                    {post.comments_count} Community Replies
                  </span>
                </div>

                {post.comments?.filter((c) => c.status === 'approved' || c.author_id === user.id || user.role === 'admin').map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={c.author_name} avatarUrl={c.author_avatar} size="xs" />
                      <span className="text-xs font-bold text-slate-900">{c.author_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 pl-8 font-medium">{c.content}</p>
                  </div>
                ))}

                {/* Comment Reply Form */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Write a supportive reply..."
                    value={replyTextMap[post.id] || ''}
                    onChange={(e) =>
                      setReplyTextMap((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id)}
                    className="px-4 py-2 blue-gradient-btn text-white text-xs font-bold rounded-xl shadow-2xs"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sky-100 relative">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Start a Peer Discussion
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Post will be submitted to the clinical team for quick moderation.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="Anxiety Support">Anxiety Support</option>
                  <option value="Managing Grief">Managing Grief</option>
                  <option value="Healthy Relationships">Healthy Relationships</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discussion Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your question or insight..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details or feelings respectfully..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 blue-gradient-btn text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Submit Discussion Thread
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
