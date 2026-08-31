import React, { useState } from 'react';
import { useApp, DashboardTab } from '../context/AppContext';
import { 
  Home,
  FileText, 
  BarChart2, 
  MessageSquare, 
  DollarSign, 
  Files, 
  LayoutTemplate, 
  Palette, 
  Settings, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldAlert, 
  ExternalLink,
  Plus,
  BookOpen,
  Bookmark,
  Heart,
  Users,
  Search,
  Eye,
  Bell,
  User as UserIcon,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    dashboardTab, 
    setDashboardTab, 
    setEditingPostId, 
    readingList,
    likedPostIds,
    followedAuthorIds,
    notifications,
    language, 
    t, 
    settings, 
    setViewMode,
    currentUser 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const navItems: Array<{ 
    tab: DashboardTab; 
    label: string; 
    icon: React.ReactNode; 
    badge?: string | number; 
    adminOnly?: boolean;
    isCustomAction?: () => void;
  }> = [
    { tab: 'home', label: t('dashboardOverview'), icon: <Home className="w-4 h-4" /> },
    { tab: 'posts', label: t('posts'), icon: <FileText className="w-4 h-4" /> },
    { tab: 'stats', label: t('stats'), icon: <BarChart2 className="w-4 h-4" />, badge: 'LIVE' },
    { tab: 'comments', label: t('comments'), icon: <MessageSquare className="w-4 h-4" /> },
    { tab: 'earnings', label: t('earnings'), icon: <DollarSign className="w-4 h-4" /> },
    { tab: 'pages', label: t('pages'), icon: <Files className="w-4 h-4" /> },
    { tab: 'layout', label: t('layout'), icon: <LayoutTemplate className="w-4 h-4" /> },
    { tab: 'theme', label: t('theme'), icon: <Palette className="w-4 h-4" /> },
    { tab: 'settings', label: t('settings'), icon: <Settings className="w-4 h-4" /> },
    { tab: 'reading-list', label: t('readingList') || 'Reading List', icon: <Bookmark className="w-4 h-4 text-emerald-500" />, badge: readingList.length > 0 ? readingList.length : undefined },
    { tab: 'likes', label: t('likesSection') || 'Likes', icon: <Heart className="w-4 h-4 text-rose-500" />, badge: likedPostIds.length > 0 ? likedPostIds.length : undefined },
    { tab: 'followers', label: t('followers') || 'Followers', icon: <Users className="w-4 h-4 text-purple-400" />, badge: followedAuthorIds.length > 0 ? followedAuthorIds.length : undefined },
    { tab: 'search', label: t('searchNav') || 'Search', icon: <Search className="w-4 h-4 text-indigo-400" /> },
    { tab: 'media', label: t('media'), icon: <ImageIcon className="w-4 h-4" /> },
    { tab: 'ai-studio', label: t('aiStudio'), icon: <Sparkles className="w-4 h-4 text-purple-400" />, badge: '2026 AI' },
    { tab: 'admin', label: t('admin'), icon: <ShieldAlert className="w-4 h-4 text-indigo-400" />, adminOnly: true }
  ];

  const handleSelectTab = (tab: DashboardTab) => {
    setDashboardTab(tab);
    setMobileMenuOpen(false);
  };

  const currentTabObj = navItems.find(item => item.tab === dashboardTab) || navItems[0];

  return (
    <>
      {/* Mobile Navigation Header Bar (< md screens) */}
      <div className="block md:hidden w-full mb-4">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-lg flex items-center justify-between gap-2">
          <button
            type="button"
            id="mobile-sidebar-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="truncate max-w-[120px]">{currentTabObj.label}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="mobile-view-blog-top-btn"
              onClick={() => setViewMode('view-blog')}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700"
              title="View Blog"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">{language === 'bn' ? 'ব্লগ' : 'Blog'}</span>
            </button>

            <button
              type="button"
              id="mobile-create-post-btn"
              onClick={() => {
                setEditingPostId(null);
                setDashboardTab('editor');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t('newPost')}</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 scrollbar-none">
          {navItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;
            const isActive = dashboardTab === item.tab;
            return (
              <button
                key={`mobile-pill-${item.tab}`}
                id={`mobile-pill-${item.tab}`}
                onClick={() => handleSelectTab(item.tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Expanded Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => {
              if (item.adminOnly && currentUser?.role !== 'admin') return null;
              const isActive = dashboardTab === item.tab;
              return (
                <button
                  key={`drawer-${item.tab}`}
                  id={`drawer-nav-${item.tab}`}
                  onClick={() => handleSelectTab(item.tab)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <button
                onClick={() => {
                  setViewMode('view-blog');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  <span>{language === 'bn' ? 'পাবলিক ব্লগ দেখুন' : 'View Public Blog'}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => {
                  setViewMode('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-emerald-500" />
                  <span>{t('profile')}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar (md and up) */}
      <aside 
        id="blogger-dashboard-sidebar" 
        className="hidden md:flex w-64 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 flex-col justify-between min-h-[calc(100vh-6rem)] border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="overflow-y-auto pr-1">
          {/* Blog Selector Title */}
          <div className="mb-4 px-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === 'bn' ? 'বর্তমান ব্লগ' : 'Current Blog'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="pulse" />
                <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">LIVE</span>
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate mt-1">
              {language === 'bn' ? settings.siteNameBn : settings.siteName}
            </h3>
          </div>

          {/* Primary "+ New Post" Button */}
          <button
            type="button"
            id="btn-sidebar-create-post"
            onClick={() => {
              setEditingPostId(null);
              setDashboardTab('editor');
            }}
            className="w-full mb-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] border border-white/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('newPost')}</span>
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.adminOnly && currentUser?.role !== 'admin') return null;

              const isActive = dashboardTab === item.tab;
              return (
                <button
                  type="button"
                  key={item.tab}
                  id={`sidebar-nav-${item.tab}`}
                  onClick={() => setDashboardTab(item.tab)}
                  className={`sidebar-item w-full flex items-center justify-between ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={
                        typeof item.badge === 'string' && item.badge.includes('AI')
                          ? 'ai-pill text-[9px]'
                          : isActive
                          ? 'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-400/30'
                          : 'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-indigo-300 border border-slate-200 dark:border-white/10'
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Footer Widgets */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button
            type="button"
            id="btn-sidebar-view-public-blog"
            onClick={() => setViewMode('view-blog')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>{language === 'bn' ? 'পাবলিক ব্লগ দেখুন' : 'View Public Blog'}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            type="button"
            id="btn-sidebar-view-live-blog"
            onClick={() => setViewMode('reader')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>{t('viewBlog')} (Reader)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </aside>
    </>
  );
};
