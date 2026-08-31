import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  Trash2, 
  ExternalLink, 
  Clock, 
  User as UserIcon, 
  Calendar, 
  Search, 
  ArrowUpDown, 
  Bookmark,
  Share2,
  Sparkles,
  Plus
} from 'lucide-react';

export const ReadingListManager: React.FC = () => {
  const { 
    readingList, 
    removeFromReadingList, 
    posts, 
    setSelectedPostSlug, 
    setViewMode, 
    language, 
    showToast 
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Match reading list items with populated post objects
  const populatedItems = readingList.map((item) => {
    const matchedPost = item.post || posts.find((p) => p.id === item.postId);
    return {
      ...item,
      post: matchedPost
    };
  }).filter((item) => item.post !== undefined);

  // Filter items
  const filteredItems = populatedItems.filter((item) => {
    if (!item.post) return false;
    const titleMatch = item.post.title.toLowerCase().includes(searchFilter.toLowerCase());
    const authorMatch = item.post.author?.name.toLowerCase().includes(searchFilter.toLowerCase());
    const summaryMatch = item.post.summary?.toLowerCase().includes(searchFilter.toLowerCase());
    return titleMatch || authorMatch || summaryMatch;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
    }
    if (sortBy === 'title') {
      return (a.post?.title || '').localeCompare(b.post?.title || '');
    }
    return 0;
  });

  const handleOpenPost = (slug: string) => {
    setSelectedPostSlug(slug);
    setViewMode('post-detail');
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/#post/${slug}`;
    navigator.clipboard.writeText(url);
    showToast(language === 'bn' ? 'পোস্টের লিংক কপি করা হয়েছে' : 'Post link copied to clipboard', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'bn' ? 'রিডিং লিস্ট (Reading List)' : 'Reading List & Saved Articles'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? `আপনার সংরক্ষিত আর্টিকেলের সংখ্যা: ${populatedItems.length} টি` 
                  : `You have ${populatedItems.length} saved articles to read later`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-explore-posts"
              onClick={() => setViewMode('reader')}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'আরও পোস্ট পড়ুন' : 'Discover Posts'}</span>
            </button>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={language === 'bn' ? 'সংরক্ষিত পোস্টের মধ্যে খুঁজুন...' : 'Search in your reading list...'}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">{language === 'bn' ? 'সর্বশেষ সংরক্ষিত' : 'Newest Saved'}</option>
              <option value="oldest">{language === 'bn' ? 'পুরাতন সংরক্ষিত' : 'Oldest Saved'}</option>
              <option value="title">{language === 'bn' ? 'শিরোনাম অনুযায়ী' : 'By Title'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reading List Items */}
      {sortedItems.length === 0 ? (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {searchFilter 
                ? (language === 'bn' ? 'কোনো সংরক্ষিত পোস্ট খুঁজে পাওয়া যায়নি' : 'No matching saved posts found') 
                : (language === 'bn' ? 'আপনার রিডিং লিস্টে কোনো পোস্ট নেই' : 'Your reading list is empty')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {language === 'bn' 
                ? 'ব্লগ পড়ার সময় বুকমার্ক আইকনটিতে ক্লিক করে যেকোনো আর্টিকেল পরবর্তীতে পড়ার জন্য এখানে সংরক্ষণ করুন।' 
                : 'Bookmark any article while reading to access it anytime from your reading list.'}
            </p>
          </div>
          <button
            onClick={() => setViewMode('reader')}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
          >
            {language === 'bn' ? 'ব্লগ পড়ুন' : 'Browse Articles'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedItems.map((item) => {
            const post = item.post!;
            return (
              <div 
                key={item.id || item.postId}
                className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Author & Saved Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.name}`}
                        alt={post.author?.name}
                        className="w-6 h-6 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
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

                  {/* Thumbnail & Title */}
                  <div className="flex gap-4 mb-3">
                    {post.featuredImage && (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-1 ring-slate-200/80 dark:ring-slate-800 flex-shrink-0 group-hover:scale-[1.02] transition"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 
                        onClick={() => handleOpenPost(post.slug)}
                        className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition cursor-pointer line-clamp-2 leading-snug"
                      >
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {post.summary || post.content?.replace(/<[^>]*>?/gm, '').slice(0, 120)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.savedAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyLink(post.slug)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => removeFromReadingList(post.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-600 transition"
                      title={language === 'bn' ? 'লিস্ট থেকে সরান' : 'Remove from list'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
