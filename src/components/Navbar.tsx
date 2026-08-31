import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Mic, 
  MicOff, 
  Sun, 
  Moon, 
  Globe, 
  Bell, 
  Layers, 
  BookOpen, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Sparkles,
  Heart,
  ChevronDown,
  MessageSquare,
  UserPlus,
  FileText,
  CheckCheck,
  ExternalLink,
  Settings,
  X
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { NotificationItem } from '../types';

export const Navbar: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    setDashboardTab, 
    language, 
    setLanguage, 
    t, 
    isDarkMode, 
    setIsDarkMode, 
    currentUser, 
    logoutUser,
    notifications,
    markAllNotificationsRead,
    markNotificationAsRead,
    searchQuery,
    setSearchQuery,
    setEditingPostId,
    setIsDonationModalOpen,
    showToast
  } = useApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Web Speech API Voice Search handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(language === 'bn' ? 'আপনার ব্রাউজারে ভয়েস সার্চ সমর্থিত নয়' : 'Voice search is not supported in this browser', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsVoiceListening(true);
      showToast(t('voiceListening'), 'info');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      showToast(language === 'bn' ? `ভয়েস সার্চ: "${transcript}"` : `Voice search: "${transcript}"`);
      setIsVoiceListening(false);
    };

    recognition.onerror = () => {
      setIsVoiceListening(false);
      showToast(language === 'bn' ? 'ভয়েস রিকগনিশন ব্যর্থ হয়েছে' : 'Voice recognition failed', 'error');
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
    };

    recognition.start();
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'subscriber':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'donation':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />;
      case 'post':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'system':
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleNotificationItemClick = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
    setIsNotifOpen(false);

    if (item.type === 'comment') {
      setViewMode('dashboard');
      setDashboardTab('comments');
    } else if (item.type === 'post') {
      setViewMode('dashboard');
      setDashboardTab('posts');
    } else if (item.type === 'donation') {
      setViewMode('dashboard');
      setDashboardTab('earnings');
    } else if (item.type === 'subscriber') {
      setViewMode('dashboard');
      setDashboardTab('home');
    } else if (item.type === 'system') {
      setViewMode('dashboard');
      setDashboardTab('settings');
    }
  };

  // Safe Fallback User Properties
  const safeName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const safeEmail = currentUser?.email || 'Email not available';
  const safeAvatar = currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeName)}`;
  const safeRole = currentUser?.role || 'reader';

  return (
    <>
      <header id="top-navbar" className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 transition-colors shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 md:gap-6">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setViewMode('reader');
                setDashboardTab('posts');
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform border border-white/20">
                B
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    {language === 'bn' ? 'ব্লগার প্রো' : 'Blogge'}<span className="text-indigo-400">.</span>
                  </span>
                  <span className="ai-pill">
                    2026 AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                  {language === 'bn' ? 'আধুনিক পাবলিশিং প্ল্যাটফর্ম' : 'Frosted Glass Edition'}
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar with Voice Input */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-10 py-2 text-sm rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-md transition-all"
              />
              <button
                id="btn-voice-search"
                type="button"
                onClick={handleVoiceSearch}
                title={t('voiceSearch')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                  isVoiceListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-white/10'
                }`}
              >
                {isVoiceListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Controls & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* View Mode Switcher: View Blog vs Dashboard */}
            {viewMode === 'dashboard' ? (
              <button
                id="btn-switch-to-reader"
                onClick={() => setViewMode('reader')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-md transition"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>{t('viewBlog')}</span>
              </button>
            ) : (
              <button
                id="btn-switch-to-dashboard"
                onClick={() => setViewMode('dashboard')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/30 border border-white/15 transition"
              >
                <Layers className="w-4 h-4" />
                <span>{t('dashboard')}</span>
              </button>
            )}

            {/* Quick New Post Button (If logged in or on dashboard) */}
            {currentUser && (
              <button
                id="btn-navbar-new-post"
                onClick={() => {
                  setEditingPostId(null);
                  setViewMode('dashboard');
                  setDashboardTab('editor');
                }}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 border border-white/10 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('newPost')}</span>
              </button>
            )}

            {/* Buy Coffee / Donation Button */}
            <button
              id="btn-navbar-donate"
              onClick={() => setIsDonationModalOpen(true)}
              title={t('donateBtn')}
              className="p-2 rounded-xl text-rose-400 hover:bg-white/5 border border-white/10 hover:border-rose-400/40 transition"
            >
              <Heart className="w-4 h-4 fill-rose-500/20" />
            </button>

            {/* Language Switcher */}
            <button
              id="btn-toggle-language"
              onClick={() => {
                const nextLang = language === 'bn' ? 'en' : 'bn';
                setLanguage(nextLang);
                showToast(nextLang === 'bn' ? 'ভাষা: বাংলা নির্ধারণ করা হয়েছে' : 'Language set to English');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-xs font-bold hover:border-indigo-400 transition"
              title="Switch Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              id="btn-toggle-theme"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-indigo-400 hover:bg-white/10 transition"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                id="btn-notifications-bell"
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsUserMenuOpen(false);
                }}
                aria-label="Notifications"
                aria-expanded={isNotifOpen}
                className={`relative p-2 rounded-xl border transition ${
                  isNotifOpen
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:text-indigo-400 hover:bg-white/10'
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover - Responsive Mobile Positioning */}
              {isNotifOpen && (
                <div 
                  id="notifications-popover"
                  className="fixed top-16 right-3 left-3 sm:left-auto sm:right-0 sm:absolute sm:top-full sm:mt-2 sm:w-96 max-w-[calc(100vw-24px)] bg-slate-900/95 dark:bg-slate-900/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Bell className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        {language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          id="btn-mark-all-read"
                          onClick={markAllNotificationsRead}
                          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'পড়া হয়েছে' : 'Mark read'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotifOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition sm:hidden"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notification Items List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {safeNotifications.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        {language === 'bn' ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No new notifications'}
                      </div>
                    ) : (
                      safeNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationItemClick(n)}
                          className={`flex items-start gap-3 p-3 rounded-2xl text-xs transition cursor-pointer border ${
                            n.read
                              ? 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:border-white/10'
                              : 'bg-indigo-500/15 text-white border-indigo-500/30 hover:bg-indigo-500/25 shadow-sm'
                          }`}
                        >
                          <div className={`p-2 rounded-xl border mt-0.5 ${
                            n.read 
                              ? 'bg-white/5 border-white/10' 
                              : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                          }`}>
                            {getNotificationIcon(n.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`font-bold truncate ${n.read ? 'text-slate-300' : 'text-white'}`}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                              )}
                            </div>
                            {n.message && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {n.message}
                              </p>
                            )}
                            <span className="text-[10px] text-slate-400/80 mt-1 block">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* View All Button Footer */}
                  <div className="pt-3 border-t border-white/10 mt-3">
                    <button
                      id="btn-view-all-notifications"
                      onClick={() => {
                        setIsNotifOpen(false);
                        setViewMode('notifications');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-indigo-600/30 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10 hover:border-indigo-500/40"
                    >
                      <span>{language === 'bn' ? 'সব নোটিফিকেশন দেখুন' : 'View all notifications'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Login Dropdown */}
            <div className="relative" ref={userMenuRef}>
              {currentUser ? (
                <button
                  id="btn-user-avatar-menu"
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsNotifOpen(false);
                  }}
                  aria-label="Profile menu"
                  aria-expanded={isUserMenuOpen}
                  className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border transition ${
                    isUserMenuOpen
                      ? 'border-indigo-500 bg-indigo-600/20'
                      : 'border-white/10 bg-white/5 hover:border-indigo-400/50'
                  }`}
                >
                  <img
                    src={safeAvatar}
                    alt={safeName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeName)}`;
                    }}
                  />
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-semibold text-slate-200 block truncate max-w-[100px]">
                      {safeName}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <button
                  id="btn-navbar-login"
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 border border-white/15 transition"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{t('login')}</span>
                </button>
              )}

              {/* User Dropdown - Responsive Mobile Positioning */}
              {isUserMenuOpen && currentUser && (
                <div
                  id="user-profile-popover"
                  className="fixed top-16 right-3 sm:right-0 sm:absolute sm:top-full sm:mt-2 w-64 max-w-[calc(100vw-24px)] bg-slate-900/95 dark:bg-slate-900/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* User Profile Card Header */}
                  <div 
                    onClick={() => {
                      setViewMode('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="p-3 bg-white/5 rounded-2xl border border-white/10 mb-2 cursor-pointer hover:bg-white/10 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={safeAvatar}
                        alt={safeName}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeName)}`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{safeName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{safeEmail}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {safeRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Menu Items */}
                  <div className="space-y-1">
                    <button
                      id="btn-dropdown-profile"
                      onClick={() => {
                        setViewMode('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      <span>{language === 'bn' ? 'আমার প্রোফাইল' : 'My Profile'}</span>
                    </button>

                    <button
                      id="btn-dropdown-dashboard"
                      onClick={() => {
                        setViewMode('dashboard');
                        setDashboardTab('posts');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition"
                    >
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>{t('dashboard')}</span>
                    </button>

                    <button
                      id="btn-dropdown-notifications"
                      onClick={() => {
                        setViewMode('notifications');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 text-purple-400" />
                        <span>{language === 'bn' ? 'নোটিফিকেশন সেন্টার' : 'Notifications'}</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500 text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      id="btn-dropdown-settings"
                      onClick={() => {
                        setViewMode('dashboard');
                        setDashboardTab('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>{t('settings')}</span>
                    </button>
                  </div>

                  <div className="border-t border-white/10 my-1.5"></div>

                  <button
                    id="btn-dropdown-logout"
                    onClick={() => {
                      logoutUser();
                      setIsUserMenuOpen(false);
                      setViewMode('reader');
                      showToast(language === 'bn' ? 'লগআউট সফল হয়েছে' : 'Logged out successfully', 'info');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 flex items-center gap-2.5 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
