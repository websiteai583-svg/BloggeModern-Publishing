import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Search, 
  Bookmark,
  Share2,
  Plus
} from 'lucide-react';

export const LikesManager: React.FC = () => {
  const { 
    likedPostIds, 
    toggleLikePost, 
    posts, 
    setSelectedPostSlug, 
    setViewMode, 
    addToReadingList, 
    isPostInReadingList,
    language, 
    showToast 
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');

  // Find posts that are liked
  const likedPosts = posts.filter(p => likedPostIds.includes(p.id));

  const filteredPosts = likedPosts.filter(p => {
    const titleMatch = p.title.toLowerCase().includes(searchFilter.toLowerCase());
    const authorMatch = p.author?.name.toLowerCase().includes(searchFilter.toLowerCase());
    return titleMatch || authorMatch;
  });

  const handleOpenPost = (slug: string) => {
    setSelectedPostSlug(slug);
    setViewMode('post-detail');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'bn' ? 'পছন্দের পোস্টসমূহ (Liked Articles)' : 'Liked Articles'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? `আপনি মোট ${likedPosts.length} টি পোস্টে লাইক দিয়েছেন` 
                  : `You have liked ${likedPosts.length} articles`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setViewMode('reader')}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন পোস্ট অন্বেষণ' : 'Explore Articles'}</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative max-w-md mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={language === 'bn' ? 'লাইক দেওয়া পোস্টের মধ্যে খুঁজুন...' : 'Search liked posts...'}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Grid of Liked Posts */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {language === 'bn' ? 'কোনো পছন্দের পোস্ট পাওয়া যায়নি' : 'No liked articles yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {language === 'bn' 
                ? 'ব্লগে পড়ার সময় হার্ট (Heart) আইকনে ট্যাপ করে যেকোনো পোস্টকে পছন্দের তালিকায় যুক্ত করুন।' 
                : 'Tap the heart icon on any post to add it to your favorites list.'}
            </p>
          </div>
          <button
            onClick={() => setViewMode('reader')}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
          >
            {language === 'bn' ? 'পোস্ট পড়ুন' : 'Browse Posts'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const inReadingList = isPostInReadingList(post.id);

            return (
              <div 
                key={post.id}
                className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.name}`}
                        alt={post.author?.name}
                        className="w-6 h-6 rounded-lg object-cover"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {post.author?.name}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readingTimeMinutes || 4} min read</span>
                    </span>
                  </div>

                  <div className="flex gap-4 mb-3">
                    {post.featuredImage && (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-1 ring-slate-200/80 dark:ring-slate-800 flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 
                        onClick={() => handleOpenPost(post.slug)}
                        className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition cursor-pointer line-clamp-2"
                      >
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {post.summary || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 120)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 transition"
                      title={language === 'bn' ? 'লাইক প্রত্যাহার' : 'Unlike'}
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    </button>

                    <button
                      onClick={() => addToReadingList(post)}
                      className={`p-1.5 rounded-xl transition ${
                        inReadingList 
                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' 
                          : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                      }`}
                      title="Save to Reading List"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${inReadingList ? 'fill-indigo-600' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleOpenPost(post.slug)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
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
