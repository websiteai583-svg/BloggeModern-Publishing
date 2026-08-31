import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  FileText, 
  Tag, 
  Folder, 
  User as UserIcon, 
  ArrowRight, 
  Calendar, 
  Clock, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const SearchManager: React.FC = () => {
  const { 
    posts, 
    pages, 
    allUsers, 
    setSelectedPostSlug, 
    setSelectedPageSlug, 
    setSelectedAuthorId,
    setViewMode, 
    language,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [query, setQuery] = useState(searchQuery || '');
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'pages' | 'authors'>('all');

  const trimmed = query.trim().toLowerCase();

  // Search results
  const matchingPosts = trimmed ? posts.filter(p => 
    p.title.toLowerCase().includes(trimmed) || 
    p.content.toLowerCase().includes(trimmed) ||
    p.tags?.some(t => t.toLowerCase().includes(trimmed)) ||
    p.categories?.some(c => c.toLowerCase().includes(trimmed))
  ) : [];

  const matchingPages = trimmed ? pages.filter(pg =>
    pg.title.toLowerCase().includes(trimmed) ||
    pg.content.toLowerCase().includes(trimmed)
  ) : [];

  const matchingAuthors = trimmed ? allUsers.filter(u =>
    u.name.toLowerCase().includes(trimmed) ||
    u.email.toLowerCase().includes(trimmed) ||
    (u.bio && u.bio.toLowerCase().includes(trimmed))
  ) : [];

  const totalMatches = matchingPosts.length + matchingPages.length + matchingAuthors.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Search Header */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'bn' ? 'অনুসন্ধান ও এক্সপ্লোরার' : 'Search & Explorer'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn' 
                ? 'পোস্ট, পেজ, লেখক, ক্যাটাগরি ও ট্যাগ জুড়ে তাত্ক্ষণিক অনুসন্ধান করুন' 
                : 'Instantly search across posts, pages, authors, and topics'}
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-indigo-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder={language === 'bn' ? 'কী খুঁজতে চান টাইপ করুন... (যেমন: প্রযুক্তি, এআই, গাইড)' : 'Search articles, topics, authors, pages...'}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner"
            autoFocus
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          {(['all', 'posts', 'pages', 'authors'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {type === 'all' && (language === 'bn' ? 'সব ফলাফল' : 'All Results')}
              {type === 'posts' && (language === 'bn' ? `পোস্ট (${matchingPosts.length})` : `Posts (${matchingPosts.length})`)}
              {type === 'pages' && (language === 'bn' ? `পেজ (${matchingPages.length})` : `Pages (${matchingPages.length})`)}
              {type === 'authors' && (language === 'bn' ? `লেখক (${matchingAuthors.length})` : `Authors (${matchingAuthors.length})`)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Content */}
      {!trimmed ? (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl space-y-3">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {language === 'bn' ? 'অনুসন্ধান শুরু করতে টাইপ করুন' : 'Type a query to search'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'bn' ? 'যেকোনো শব্দ দিয়ে পোস্ট বা লেখকের নাম অনুসন্ধান করতে পারেন।' : 'Find content, tutorials, published pages, and community members.'}
          </p>
        </div>
      ) : totalMatches === 0 ? (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl space-y-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? `"${query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি` : `No results found for "${query}"`}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'bn' ? 'বানান সঠিক আছে কিনা দেখে পুনরায় চেষ্টা করুন।' : 'Please check your spelling and try again.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Matching Posts */}
          {(filterType === 'all' || filterType === 'posts') && matchingPosts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>{language === 'bn' ? 'পোস্টসমূহ' : 'Matching Posts'} ({matchingPosts.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => { setSelectedPostSlug(post.slug); setViewMode('post-detail'); }}
                    className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-md hover:shadow-xl transition cursor-pointer flex gap-4 group"
                  >
                    {post.featuredImage && (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {post.summary || post.content.replace(/<[^>]*>?/gm, '').slice(0, 100)}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <span>{post.author?.name}</span>
                        <span>•</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Authors */}
          {(filterType === 'all' || filterType === 'authors') && matchingAuthors.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
                <UserIcon className="w-4 h-4 text-emerald-500" />
                <span>{language === 'bn' ? 'লেখক ও সদস্যগণ' : 'Matching Authors'} ({matchingAuthors.length})</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {matchingAuthors.map(author => (
                  <div
                    key={author.id}
                    onClick={() => { setSelectedAuthorId(author.id); setViewMode('view-blog'); }}
                    className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-md hover:shadow-xl transition cursor-pointer flex items-center gap-3 group"
                  >
                    <img
                      src={author.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${author.name}`}
                      alt={author.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition truncate">
                        {author.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">{author.email}</p>
                      <span className="text-[10px] text-indigo-500 font-bold uppercase">{author.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Pages */}
          {(filterType === 'all' || filterType === 'pages') && matchingPages.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>{language === 'bn' ? 'পেজ সমূহ' : 'Matching Pages'} ({matchingPages.length})</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchingPages.map(page => (
                  <div
                    key={page.id}
                    onClick={() => { setSelectedPageSlug(page.slug); setViewMode('page-detail'); }}
                    className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-md hover:shadow-xl transition cursor-pointer group"
                  >
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                      {page.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {page.content?.replace(/<[^>]*>?/gm, '').slice(0, 120)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
