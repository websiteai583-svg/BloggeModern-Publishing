import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Post, PostStatus } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Calendar, 
  Heart, 
  MessageSquare, 
  MoreVertical,
  CheckSquare,
  Square,
  Sparkles,
  Tag
} from 'lucide-react';

export const PostsManager: React.FC = () => {
  const { 
    posts, 
    deletePost, 
    updatePost, 
    setEditingPostId, 
    setDashboardTab, 
    setSelectedPostSlug, 
    setViewMode, 
    language, 
    t, 
    showToast 
  } = useApp();

  const [activeStatusTab, setActiveStatusTab] = useState<'all' | PostStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  const safePosts = Array.isArray(posts) ? posts : [];

  // Collect all unique categories
  const allCategories = Array.from(
    new Set(safePosts.flatMap((p) => p?.categories || []))
  );

  // Filter posts
  const filteredPosts = safePosts.filter((post) => {
    if (!post) return false;
    const matchesStatus = activeStatusTab === 'all' || post.status === activeStatusTab;
    const matchesCategory = selectedCategory === 'all' || (Array.isArray(post.categories) && post.categories.includes(selectedCategory));
    const title = (post.title || '').toLowerCase();
    const slug = (post.slug || '').toLowerCase();
    const summary = (post.summary || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = title.includes(search) || slug.includes(search) || summary.includes(search);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedPostIds.length === filteredPosts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(filteredPosts.map((p) => p.id));
    }
  };

  const toggleSelectPost = (id: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    selectedPostIds.forEach((id) => deletePost(id));
    setSelectedPostIds([]);
  };

  const handleBulkStatusChange = (status: PostStatus) => {
    selectedPostIds.forEach((id) => updatePost(id, { status }));
    setSelectedPostIds([]);
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(url);
    showToast(t('copiedLink'));
  };

  return (
    <div id="posts-manager-view" className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('posts')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' 
              ? `মোট ${safePosts.length} টি পোস্ট নিবন্ধিত রয়েছে` 
              : `Manage and publish ${safePosts.length} articles on your blog`}
          </p>
        </div>

        <button
          id="btn-posts-create-new"
          onClick={() => {
            setEditingPostId(null);
            setDashboardTab('editor');
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('newPost')}</span>
        </button>
      </div>

      {/* Filter Tabs Bar (Blogger signature tabs) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { key: 'all', label: language === 'bn' ? 'সকল পোস্ট' : 'All', count: safePosts.length },
            { key: 'published', label: language === 'bn' ? 'প্রকাশিত' : 'Published', count: safePosts.filter(p => p?.status === 'published').length },
            { key: 'draft', label: language === 'bn' ? 'ড্রাফট' : 'Drafts', count: safePosts.filter(p => p?.status === 'draft').length },
            { key: 'scheduled', label: language === 'bn' ? 'শিডিউল' : 'Scheduled', count: safePosts.filter(p => p?.status === 'scheduled').length },
            { key: 'trash', label: language === 'bn' ? 'ট্র্যাশ' : 'Trash', count: safePosts.filter(p => p?.status === 'trash').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatusTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeStatusTab === tab.key
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label} <span className="opacity-70 text-[11px]">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'bn' ? 'পোস্ট খুঁজুন...' : 'Search posts...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (When posts selected) */}
      {selectedPostIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 rounded-xl text-xs">
          <div className="flex items-center gap-2 font-semibold text-orange-800 dark:text-orange-300">
            <span>{selectedPostIds.length} {language === 'bn' ? 'টি পোস্ট নির্বাচিত' : 'posts selected'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('published')}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 transition"
            >
              {language === 'bn' ? 'প্রকাশ করুন' : 'Publish'}
            </button>
            <button
              onClick={() => handleBulkStatusChange('draft')}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 transition"
            >
              {language === 'bn' ? 'ড্রাফট করুন' : 'Draft'}
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition"
            >
              {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Posts Table / Card List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-3">
            <Edit3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'কোনো পোস্ট পাওয়া যায়নি' : 'No posts found'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {language === 'bn' ? 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো পোস্ট নেই। নতুন পোস্ট লিখতে বাটনে চাপুন।' : 'Try changing your search filters or create a new blog post.'}
          </p>
          <button
            onClick={() => {
              setEditingPostId(null);
              setDashboardTab('editor');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition"
          >
            {t('newPost')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isSelected = selectedPostIds.includes(post.id);
            return (
              <div
                key={post.id}
                id={`post-row-${post.id}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Left Select & Info */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleSelectPost(post.id)}
                    className="mt-1 sm:mt-0 text-slate-400 hover:text-orange-500 transition"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          post.status === 'published'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : post.status === 'draft'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            : post.status === 'scheduled'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {post.status}
                      </span>

                      {post.categories?.map((cat) => (
                        <span key={cat} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {cat}
                        </span>
                      ))}

                      <span className="text-[11px] text-slate-400">
                        {new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 
                      onClick={() => {
                        setEditingPostId(post.id);
                        setDashboardTab('editor');
                      }}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-orange-500 transition"
                    >
                      {post.title || 'Untitled Post'}
                    </h3>

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {(post.views ?? 0).toLocaleString()} {t('views')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        {post.likes ?? 0} {t('likes')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.readingTimeMinutes ?? 3} {t('minRead')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setSelectedPostSlug(post.slug);
                      setViewMode('post-detail');
                    }}
                    title={language === 'bn' ? 'লাইভ ব্লগ প্রিভিউ' : 'View live post'}
                    className="p-2 rounded-xl text-slate-500 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopyLink(post.slug)}
                    title={language === 'bn' ? 'লিংক কপি করুন' : 'Copy link'}
                    className="p-2 rounded-xl text-slate-500 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingPostId(post.id);
                      setDashboardTab('editor');
                    }}
                    title={t('edit')}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deletePost(post.id)}
                    title={t('delete')}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
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
