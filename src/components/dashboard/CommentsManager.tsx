import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Comment } from '../../types';
import { 
  MessageSquare, 
  Check, 
  Trash2, 
  AlertOctagon, 
  CornerDownRight, 
  User, 
  Clock, 
  Send,
  Sparkles
} from 'lucide-react';

export const CommentsManager: React.FC = () => {
  const { comments, updateCommentStatus, addCommentReply, deleteComment, posts, language, t } = useApp();
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'spam'>('all');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const safeComments = Array.isArray(comments) ? comments : [];
  const safePosts = Array.isArray(posts) ? posts : [];

  const filteredComments = safeComments.filter((c) => {
    if (!c) return false;
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const handleSendReply = (commentId: string) => {
    if (!replyText.trim()) return;
    addCommentReply(commentId, replyText.trim());
    setReplyText('');
    setReplyingToId(null);
  };

  return (
    <div id="comments-manager-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('comments')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'মন্তব্য অনুমোদন ও স্প্যাম সুরক্ষা নিয়ন্ত্রণ' : 'Moderate reader comments and spam prevention'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {[
            { key: 'all', label: language === 'bn' ? 'সকল' : 'All', count: safeComments.length },
            { key: 'approved', label: language === 'bn' ? 'অনুমোদিত' : 'Approved', count: safeComments.filter(c => c?.status === 'approved').length },
            { key: 'pending', label: language === 'bn' ? 'অপেক্ষমাণ' : 'Pending', count: safeComments.filter(c => c?.status === 'pending').length },
            { key: 'spam', label: language === 'bn' ? 'স্প্যাম' : 'Spam', count: safeComments.filter(c => c?.status === 'spam').length }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === item.key
                  ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {item.label} <span className="opacity-70 text-[10px]">({item.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {language === 'bn' ? 'কোনো মন্তব্য নেই' : 'No comments found'}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => {
            const post = safePosts.find((p) => p.id === comment.postId);
            return (
              <div
                key={comment.id}
                id={`comment-card-${comment.id}`}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                {/* Author Info & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.authorName}`}
                      alt={comment.authorName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-orange-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({comment.authorEmail})</span>
                      </div>
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium truncate max-w-sm">
                        অন: {post ? post.title : 'Deleted Post'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        comment.status === 'approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : comment.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {comment.status}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                  {comment.content}
                </p>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 space-y-2 border-l-2 border-orange-500/40 pl-4 py-1">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-orange-50/50 dark:bg-orange-950/20 p-3 rounded-2xl text-xs space-y-1">
                        <div className="flex items-center gap-2 font-bold text-orange-800 dark:text-orange-300 text-[11px]">
                          <span>{reply.authorName || 'Admin'}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{new Date(reply.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {comment.status !== 'approved' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'অনুমোদন' : 'Approve'}</span>
                      </button>
                    )}

                    {comment.status !== 'spam' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'spam')}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-semibold transition"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'স্প্যাম হিসেবে চিহ্নিত' : 'Spam'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-500 rounded-xl text-xs font-semibold transition"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'উত্তর দিন' : 'Reply'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl transition"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct Reply Input */}
                {replyingToId === comment.id && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={language === 'bn' ? 'অ্যাডমিন হিসেবে উত্তর লিখুন...' : 'Type your reply as Admin...'}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'পাঠান' : 'Reply'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
