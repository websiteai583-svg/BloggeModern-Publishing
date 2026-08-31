import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Eye, 
  MessageSquare, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  Sparkles, 
  Palette, 
  ExternalLink, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  Layers, 
  Image as ImageIcon,
  Activity,
  Calendar,
  Heart
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { 
    posts, 
    comments, 
    analytics, 
    donations, 
    subscribers, 
    logs, 
    setDashboardTab, 
    setEditingPostId, 
    setSelectedPostSlug, 
    setViewMode, 
    language, 
    t 
  } = useApp();

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeComments = Array.isArray(comments) ? comments : [];
  const safeDonations = Array.isArray(donations) ? donations : [];
  const safeSubscribers = Array.isArray(subscribers) ? subscribers : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  const totalPosts = safePosts.length;
  const publishedPosts = safePosts.filter(p => p.status === 'published').length;
  const draftPosts = safePosts.filter(p => p.status === 'draft').length;
  const scheduledPosts = safePosts.filter(p => p.status === 'scheduled').length;

  const totalViews = (analytics?.totalViews ?? safePosts.reduce((acc, p) => acc + (Number(p.views) || 0), 0));
  const totalVisitors = analytics?.totalVisitors ?? 0;
  const pendingComments = safeComments.filter(c => c.status === 'pending').length;
  const totalDonationAmount = safeDonations.reduce((acc, d) => acc + (d.amount || 0), 0);

  const recentPosts = safePosts.slice(0, 5);
  const recentComments = safeComments.slice(0, 5);

  return (
    <div id="dashboard-home-overview" className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold backdrop-blur-md mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'bn' ? 'ব্লগার প্রো পাবলিশিং হাব' : 'Blogge Publishing Center'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'bn' ? 'স্বাগতম, আপনার ডিজিটাল প্ল্যাটফর্ম' : 'Welcome back to your publishing hub'}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed">
              {language === 'bn' 
                ? `বর্তমানে ব্লগে ${publishedPosts}টি সক্রিয় নিবন্ধ প্রকাশিত রয়েছে এবং মোট ${totalViews.toLocaleString()} বার পঠিত হয়েছে।`
                : `You have ${publishedPosts} live articles with ${totalViews.toLocaleString()} total reads across your publication.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingPostId(null);
                setDashboardTab('editor');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-50 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-orange-500 stroke-[3]" />
              <span>{t('newPost')}</span>
            </button>

            <button
              onClick={() => setDashboardTab('ai-studio')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('aiStudio')}</span>
            </button>

            <button
              onClick={() => setViewMode('reader')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/20 hover:bg-black/30 text-white font-semibold text-xs backdrop-blur-md transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('viewBlog')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards 4-Pack */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Posts */}
        <div 
          onClick={() => setDashboardTab('posts')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'মোট আর্টিকেল' : 'Total Articles'}
            </span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalPosts}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="text-emerald-500 font-semibold">{publishedPosts} প্রকাশিত</span>
              <span>•</span>
              <span className="text-amber-500 font-semibold">{draftPosts} ড্রাফট</span>
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div 
          onClick={() => setDashboardTab('stats')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'মোট পাঠসংখ্যা (Views)' : 'Total Pageviews'}
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 group-hover:scale-110 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalViews.toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'bn' ? 'বাস্তব ডেটা সংগ্রহ হচ্ছে' : 'No comparison data yet'}</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div 
          onClick={() => setDashboardTab('comments')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'পাঠক মন্তব্য' : 'Reader Comments'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {safeComments.length}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              {pendingComments > 0 ? (
                <span className="text-amber-500 font-bold">{pendingComments} অপেক্ষমাণ অনুমোদন</span>
              ) : (
                <span className="text-slate-400">সব অনুমোদিত</span>
              )}
            </div>
          </div>
        </div>

        {/* Revenue / Tips */}
        <div 
          onClick={() => setDashboardTab('earnings')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'উপার্জন ও অনুদান' : 'Earnings & Tips'}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ৳ {totalDonationAmount.toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span>{safeDonations.length} টি সাপোর্ট ট্রানজেকশন</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Launchpad Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          {language === 'bn' ? 'দ্রুত অ্যাকশন প্যানেল (Quick Actions)' : 'Quick Action Shortcuts'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: 'editor', label: language === 'bn' ? 'নতুন পোস্ট' : 'New Article', icon: Plus, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
            { id: 'ai-studio', label: language === 'bn' ? 'এআই স্টুডিও' : 'AI Assistant', icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
            { id: 'layout', label: language === 'bn' ? 'লেআউট সাজান' : 'Layout Builder', icon: Layers, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
            { id: 'theme', label: language === 'bn' ? 'থিম কাস্টমাইজ' : 'Themes & Style', icon: Palette, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
            { id: 'media', label: language === 'bn' ? 'ছবি ও মিডিয়া' : 'Media Library', icon: ImageIcon, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
            { id: 'stats', label: language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics', icon: TrendingUp, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' }
          ].map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'editor') {
                    setEditingPostId(null);
                  }
                  setDashboardTab(action.id as any);
                }}
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group text-center"
              >
                <div className={`p-2.5 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Recent Posts + Moderation & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Articles */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'সাম্প্রতিক পোস্টসমূহ' : 'Recent Articles'}
              </h3>
            </div>
            <button
              onClick={() => setDashboardTab('posts')}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPosts.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              কোনো পোস্ট নেই। নতুন পোস্ট তৈরি করতে উপরের বোতাম চাপুন।
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPosts.map(post => (
                <div key={post.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-500 transition">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] uppercase ${
                          post.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}>
                          {post.status}
                        </span>
                        <span>•</span>
                        <span>{(post.views || 0).toLocaleString()} views</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt || post.publishedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        setDashboardTab('editor');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white rounded-lg transition"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPostSlug(post.slug);
                        setViewMode('post-detail');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
                      title="View Article"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Comments & System Info */}
        <div className="space-y-6">
          
          {/* Comments Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'bn' ? 'সাম্প্রতিক মন্তব্য' : 'Recent Comments'}
                </h3>
              </div>
              <button
                onClick={() => setDashboardTab('comments')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {language === 'bn' ? 'সব' : 'All'}
              </button>
            </div>

            {recentComments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">এখনো কোনো মন্তব্য নেই।</div>
            ) : (
              <div className="space-y-3">
                {recentComments.map(c => (
                  <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{c.authorName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        c.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                      "{c.content}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Status Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'সিস্টেম স্ট্যাটাস' : 'System Performance'}
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Operational
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Vite & React Engine:</span>
                <span className="font-mono text-emerald-500 font-bold">Active 2026.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span>LocalStorage Security:</span>
                <span className="font-mono text-blue-500 font-bold">Protected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Subscribers:</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{safeSubscribers.length}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
