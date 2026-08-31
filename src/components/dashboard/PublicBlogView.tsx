import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Globe, 
  Github, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail, 
  Calendar, 
  Users, 
  FileText, 
  Heart, 
  Share2, 
  Bookmark, 
  Sparkles,
  ExternalLink,
  Search,
  Check
} from 'lucide-react';

export const PublicBlogView: React.FC = () => {
  const { 
    currentUser, 
    posts, 
    allUsers, 
    selectedAuthorId, 
    setViewMode, 
    setSelectedPostSlug, 
    toggleFollowUser, 
    isUserFollowed, 
    addToReadingList, 
    isPostInReadingList, 
    toggleLikePost, 
    isPostLiked, 
    language, 
    showToast 
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  // Determine which user's public blog to show (default: currentUser or primary admin)
  const targetUser = (selectedAuthorId ? allUsers.find(u => u.id === selectedAuthorId) : currentUser) || allUsers[0];

  const authorName = targetUser?.name || 'Blogger Author';
  const authorAvatar = targetUser?.avatar || targetUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;
  const authorBio = targetUser?.bio || (language === 'bn' ? 'প্রযুক্তি, ডিজিটাল পাবলিশিং ও সৃজনশীল ব্লগিং।' : 'Tech, digital publishing & creative blogging.');
  const authorRole = targetUser?.role || 'Author';
  const isFollowing = targetUser ? isUserFollowed(targetUser.id) : false;

  // Filter posts authored by this author (or all posts if admin preview)
  const authorPosts = posts.filter(p => {
    if (!p) return false;
    const isAuthored = p.author?.id === targetUser?.id || p.author?.name === authorName;
    return isAuthored && p.status === 'published';
  });

  // Unique categories for this author
  const categories = ['all', ...Array.from(new Set(authorPosts.flatMap(p => p.categories || [])))];

  const filteredPosts = authorPosts.filter(p => {
    const matchesCat = selectedCat === 'all' || (p.categories && p.categories.includes(selectedCat));
    const matchesSearch = p.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
      (p.summary && p.summary.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleShareBlog = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast(language === 'bn' ? 'ব্লগের লিংক কপি করা হয়েছে' : 'Blog link copied to clipboard!', 'info');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200 space-y-8">
      
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setViewMode('reader')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareBlog}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'শেয়ার' : 'Share Blog'}</span>
          </button>
        </div>
      </div>

      {/* Author Hero Header Card */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;
            }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {authorName}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {authorRole}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 max-w-2xl leading-relaxed">
              {authorBio}
            </p>

            {/* Author Metrics */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>{authorPosts.length} {language === 'bn' ? 'টি প্রকাশিত পোস্ট' : 'Published Posts'}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>{targetUser?.followersCount || 128} {language === 'bn' ? 'ফলোয়ার্স' : 'Followers'}</span>
              </span>
            </div>

            {/* Social Links & Follow Action */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {targetUser?.id !== currentUser?.id && (
                <button
                  onClick={() => targetUser && toggleFollowUser(targetUser.id)}
                  className={`px-5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-md ${
                    isFollowing 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{language === 'bn' ? 'অনুসরণ করছেন (Following)' : 'Following'}</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'অনুসরণ করুন (Follow)' : 'Follow Author'}</span>
                    </>
                  )}
                </button>
              )}

              {targetUser?.socialLinks?.website && (
                <a href={targetUser.socialLinks.website} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {targetUser?.socialLinks?.github && (
                <a href={targetUser.socialLinks.github} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {targetUser?.socialLinks?.twitter && (
                <a href={targetUser.socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? (language === 'bn' ? 'সকল পোস্ট' : 'All Posts') : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={language === 'bn' ? 'এই ব্লগে খুঁজুন...' : 'Search articles...'}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Published Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'কোনো পোস্ট পাওয়া যায়নি' : 'No articles found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn' ? 'এই বিভাগে এখনও কোনো প্রকাশিত পোস্ট নেই।' : 'There are no published articles matching your criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const isLiked = isPostLiked(post.id);
            const inReadingList = isPostInReadingList(post.id);

            return (
              <div
                key={post.id}
                className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail */}
                  {post.featuredImage && (
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => { setSelectedPostSlug(post.slug); setViewMode('post-detail'); }}>
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {post.categories?.[0] && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                          {post.categories[0]}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    <h2
                      onClick={() => { setSelectedPostSlug(post.slug); setViewMode('post-detail'); }}
                      className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition cursor-pointer line-clamp-2 leading-snug"
                    >
                      {post.title}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {post.summary || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 140)}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-slate-800 mt-2">
                  <span className="text-[11px] text-slate-400">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className={`p-2 rounded-xl transition ${
                        isLiked 
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' 
                          : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Like post"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => addToReadingList(post)}
                      className={`p-2 rounded-xl transition ${
                        inReadingList 
                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' 
                          : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Save to Reading List"
                    >
                      <Bookmark className={`w-4 h-4 ${inReadingList ? 'fill-indigo-600' : ''}`} />
                    </button>

                    <button
                      onClick={() => { setSelectedPostSlug(post.slug); setViewMode('post-detail'); }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>{language === 'bn' ? 'পড়ুন' : 'Read'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
