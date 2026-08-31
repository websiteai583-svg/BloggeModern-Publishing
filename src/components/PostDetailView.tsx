import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Clock, 
  MessageSquare, 
  Send, 
  Coffee, 
  CornerDownRight, 
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  User as UserIcon
} from 'lucide-react';
import { sanitizeHtml } from '../utils/sanitize';

export const PostDetailView: React.FC = () => {
  const { 
    posts, 
    selectedPostSlug, 
    setViewMode, 
    comments, 
    addComment, 
    likePost, 
    settings, 
    setSelectedPostSlug, 
    setSelectedAuthorId,
    addToReadingList,
    removeFromReadingList,
    isPostInReadingList,
    toggleLikePost,
    isPostLiked,
    setIsDonationModalOpen,
    language, 
    t, 
    showToast,
    incrementPostView
  } = useApp();

  const post = posts.find((p) => p.slug === selectedPostSlug) || posts[0];
  
  // Trigger single post view count
  useEffect(() => {
    if (post?.id) {
      incrementPostView(post.id);
    }
  }, [post?.id]);
  
  // Comment Form States
  const [commentBody, setCommentBody] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  const isLiked = post ? isPostLiked(post.id) : false;
  const isBookmarked = post ? isPostInReadingList(post.id) : false;

  // Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Post comments
  const postComments = comments.filter((c) => c.postId === post?.id && c.status === 'approved');

  const handleLike = () => {
    if (!post) return;
    toggleLikePost(post.id);
  };

  const handleBookmarkToggle = () => {
    if (!post) return;
    if (isBookmarked) {
      removeFromReadingList(post.id);
    } else {
      addToReadingList(post);
    }
  };

  const handleViewAuthorBlog = () => {
    if (post?.author?.id) {
      setSelectedAuthorId(post.author.id);
      setViewMode('view-blog');
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      showToast(t('copiedLink'));
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    addComment(post.id, commentBody.trim());
    setCommentBody('');
  };

  const handleReplySubmit = (commentId: string) => {
    if (!replyBody.trim()) return;
    addComment(post.id, replyBody.trim(), commentId);
    setReplyBody('');
    setReplyingCommentId(null);
  };

  if (!post) return null;

  // Suggested / Related posts
  const relatedPosts = posts.filter((p) => p.id !== post.id && p.status === 'published').slice(0, 3);

  return (
    <div id="post-detail-wrapper" className="min-h-screen text-slate-100 pb-20 transition-colors">
      
      {/* Top Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-150 shadow-lg shadow-indigo-500/50"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation Top Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <button
          id="btn-back-to-blog"
          onClick={() => setViewMode('reader')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white py-2 px-4 rounded-full glass-panel border border-white/10 shadow-lg backdrop-blur-md transition hover:border-indigo-400/50"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>{language === 'bn' ? 'ব্লগের মূল পাতায় ফিরে যান' : 'Back to Articles'}</span>
        </button>
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Post Metadata & Title */}
        <header className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {post.categories?.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase rounded-lg"
              >
                {cat}
              </span>
            ))}
            <span className="text-xs text-slate-400 font-medium">
              {post.readingTimeMinutes} {t('minRead')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed italic">
            {post.summary}
          </p>

          {/* Author Byline & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/50"
              />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{post.author.name}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{new Date(post.publishedAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'long' })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-indigo-400" />
                {post.views.toLocaleString()} {t('views')}
              </span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition ${
                  isLiked 
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold' 
                    : 'glass-panel border-white/10 hover:border-rose-400/50 text-slate-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{post.likes}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <figure className="space-y-2">
            <div className="rounded-3xl overflow-hidden aspect-[16/9] shadow-2xl border border-white/10 glass-panel">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            {post.imageCaption && (
              <figcaption className="text-center text-xs text-slate-400 italic">
                {post.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* In-Article Sponsor / Ad Placement */}
        {settings?.adSlots?.inPostAdEnabled && (
          <div className="p-4 glass-panel rounded-2xl border border-dashed border-indigo-500/30 text-center shadow-lg">
            <span className="text-[9px] uppercase font-bold text-indigo-400 block mb-1">PROMOTED STORY</span>
            <p className="text-xs font-semibold text-slate-200">
              💡 {language === 'bn' ? 'আপনার ওয়েবসাইটের স্পিড বাড়ান ১০ গুণ - আজই ট্রাই করুন ক্লাউডফ্লেয়ার।' : 'Supercharge your website loading speed with high performance CDN.'}
            </p>
          </div>
        )}

        {/* Rich Article Body */}
        <div
          id="single-post-article-content"
          className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl prose prose-invert lg:prose-lg max-w-none text-slate-200 leading-relaxed font-sans"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* Affiliate Discount Recommendation Box (If any) */}
        {post.affiliateLinks && post.affiliateLinks.length > 0 && (
          <div className="p-6 glass-panel rounded-3xl border border-emerald-500/30 shadow-2xl space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 block">
              {language === 'bn' ? 'বিশেষ ডিসকাউন্ট ও রেকমেন্ডেশন' : 'Special Recommendation & Discounts'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.affiliateLinks.map((aff, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{aff.title}</h5>
                    {aff.discountCode && (
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        Code: {aff.discountCode}
                      </span>
                    )}
                  </div>
                  <a
                    href={aff.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1"
                  >
                    <span>Get Deal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-bold text-slate-400">{t('tags')}:</span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Social Share, Bookmark & Like Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 glass-panel rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              <span>{isLiked ? (language === 'bn' ? 'লাইক করেছেন' : 'Liked') : (language === 'bn' ? 'পছন্দ করুন' : 'Like Post')}</span>
            </button>

            <button
              onClick={handleBookmarkToggle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition ${
                isBookmarked
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সংরক্ষিত' : 'Saved'}</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>{language === 'bn' ? 'রিডিং লিস্টে রাখুন' : 'Save for Later'}</span>
                </>
              )}
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">{t('sharePost')}:</span>
            <button
              onClick={() => handleShare('facebook')}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition text-xs font-bold border border-white/10"
              title="Share on Facebook"
            >
              FB
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition text-xs font-bold border border-white/10"
              title="Share on X"
            >
              X
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition text-xs font-bold border border-white/10"
              title="Share on WhatsApp"
            >
              WA
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="p-2 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition text-xs font-bold border border-white/10"
              title="Copy Link"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Author Bio Box with Coffee Donation & View Blog Button */}
        <div className="p-6 sm:p-8 glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            onClick={handleViewAuthorBlog}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 flex-shrink-0 cursor-pointer hover:opacity-90 transition"
          />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 
                  onClick={handleViewAuthorBlog}
                  className="text-base sm:text-lg font-bold text-white hover:text-indigo-300 cursor-pointer transition inline-flex items-center gap-1.5"
                >
                  <span>{post.author.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </h3>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                  {language === 'bn' ? 'ব্লগার প্রো প্রধান কন্টেন্ট ক্রিয়েটর' : 'Blogge Pro Author'}
                </p>
              </div>

              <button
                onClick={handleViewAuthorBlog}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 self-center sm:self-auto"
              >
                <span>{language === 'bn' ? 'লেখকের ব্লগ দেখুন' : 'View Author Blog'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {post.author.bio}
            </p>

            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 transition border border-white/10"
            >
              <Coffee className="w-4 h-4" />
              <span>{language === 'bn' ? 'লেখককে কফি খাওয়ান (Tip / Coffee)' : 'Buy the Author a Coffee'}</span>
            </button>
          </div>
        </div>

        {/* Nested Comments Section */}
        <section id="comments-section" className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <span>{language === 'bn' ? `মন্তব্যসমূহ (${postComments.length})` : `Comments (${postComments.length})`}</span>
            </h3>
          </div>

          {/* New Comment Submission Form in Frosted Glass */}
          <form onSubmit={handleCommentSubmit} className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'bn' ? 'আপনার মূল্যবান মতামত বা প্রশ্ন লিখুন' : 'Leave a Comment'}
            </h4>

            <textarea
              rows={3}
              required
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder={language === 'bn' ? 'মন্তব্য লিখুন...' : 'Write your comment...'}
              className="w-full p-3.5 text-xs rounded-xl glass-input placeholder-slate-400 focus:outline-none"
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center gap-2 border border-white/15"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'bn' ? 'মন্তব্য প্রকাশ করুন' : 'Submit Comment'}</span>
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {postComments.map((comment) => (
              <div
                key={comment.id}
                className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.authorName}`}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-500/50"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{comment.authorName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setReplyingCommentId(replyingCommentId === comment.id ? null : comment.id)}
                    className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'উত্তর' : 'Reply'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {comment.content}
                </p>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 space-y-2 border-l-2 border-indigo-500/40 pl-4 pt-1">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="p-3 bg-white/5 rounded-2xl text-xs space-y-1 border border-white/5">
                        <div className="flex items-center justify-between font-bold text-[11px] text-slate-200">
                          <span>{reply.authorName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingCommentId === comment.id && (
                  <div className="pt-2 border-t border-white/10 flex gap-2">
                    <input
                      type="text"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder={language === 'bn' ? 'উত্তর লিখুন...' : 'Write reply...'}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(comment.id)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md border border-white/15"
                    >
                      {language === 'bn' ? 'পাঠান' : 'Reply'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Related Posts Grid */}
        <section className="space-y-4 pt-10 border-t border-white/10">
          <h3 className="text-lg font-bold text-white">
            {language === 'bn' ? 'সম্পর্কিত অন্যান্য আর্টিকেল' : 'Related Articles'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rPost) => (
              <div
                key={rPost.id}
                onClick={() => {
                  setSelectedPostSlug(rPost.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group glass-panel glass-panel-hover rounded-2xl border border-white/10 overflow-hidden shadow-xl cursor-pointer transition"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={rPost.featuredImage} alt={rPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-3.5">
                  <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-indigo-300 transition">
                    {rPost.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-1 block">{rPost.readingTimeMinutes} {t('minRead')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </article>

    </div>
  );
};
