import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  ExternalLink, 
  Search, 
  FileText, 
  Check,
  Globe,
  Mail,
  Sparkles
} from 'lucide-react';

export const FollowersManager: React.FC = () => {
  const { 
    allUsers, 
    currentUser, 
    followedAuthorIds, 
    toggleFollowUser, 
    isUserFollowed, 
    posts, 
    setSelectedAuthorId, 
    setViewMode, 
    language, 
    showToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'following' | 'all-creators'>('all-creators');
  const [searchFilter, setSearchFilter] = useState('');

  // All distinct authors in the platform
  const creators = allUsers.filter(u => u.id !== currentUser?.id);

  // Filter creators
  const filteredCreators = creators.filter(c => {
    const isFollowed = isUserFollowed(c.id);
    if (activeSubTab === 'following' && !isFollowed) return false;

    const nameMatch = c.name.toLowerCase().includes(searchFilter.toLowerCase());
    const emailMatch = c.email.toLowerCase().includes(searchFilter.toLowerCase());
    const bioMatch = (c.bio || '').toLowerCase().includes(searchFilter.toLowerCase());
    return nameMatch || emailMatch || bioMatch;
  });

  const handleOpenAuthorBlog = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setViewMode('view-blog');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Card */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'bn' ? 'ফলোয়ার ও লেখকগণ (Followers / Following)' : 'Followers & Following'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? `আপনি ${followedAuthorIds.length} জন লেখককে অনুসরণ করছেন` 
                  : `You are following ${followedAuthorIds.length} authors in the community`}
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('all-creators')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'all-creators'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'bn' ? 'সকল লেখক' : 'All Authors'} ({creators.length})
            </button>
            <button
              onClick={() => setActiveSubTab('following')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'following'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'bn' ? 'অনুসরণ করছেন' : 'Following'} ({followedAuthorIds.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={language === 'bn' ? 'লেখক খুঁজুন...' : 'Search authors by name, bio...'}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Creators Grid */}
      {filteredCreators.length === 0 ? (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {language === 'bn' ? 'কোনো লেখক খুঁজে পাওয়া যায়নি' : 'No authors found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {language === 'bn' 
                ? 'অন্যান্য চমৎকার লেখকদের খুঁজতে সার্চ ফিল্টার পরিবর্তন করুন।' 
                : 'Try adjusting your search filter to find more writers.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCreators.map((creator) => {
            const isFollowing = isUserFollowed(creator.id);
            const authorPostsCount = posts.filter(p => p.author?.id === creator.id || p.author?.name === creator.name).length;
            const creatorAvatar = creator.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(creator.name)}`;

            return (
              <div 
                key={creator.id}
                className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top user header */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={creatorAvatar}
                      alt={creator.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {creator.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {creator.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {creator.role || 'Author'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {creator.bio || (language === 'bn' ? 'ব্লগে নিয়মিত আর্টিকেল ও মতামত প্রকাশকারী লেখক।' : 'Active writer on the publishing platform.')}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mb-4 py-2 border-y border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{authorPostsCount} {language === 'bn' ? 'টি পোস্ট' : 'Posts'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{creator.followersCount || 104} {language === 'bn' ? 'ফলোয়ার্স' : 'Followers'}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => handleOpenAuthorBlog(creator.id)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>{language === 'bn' ? 'ব্লগ দেখুন' : 'View Blog'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => toggleFollowUser(creator.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{language === 'bn' ? 'ফলোয়িং' : 'Following'}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ফলো' : 'Follow'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
