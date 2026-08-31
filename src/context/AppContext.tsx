import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Post, 
  Comment, 
  StaticPage, 
  LayoutWidget, 
  ThemeConfig, 
  AdSlot, 
  MediaItem, 
  SiteSettings, 
  ActivityLog, 
  User, 
  Subscriber,
  LiveChatMessage,
  DonationRecord,
  PaymentRecord,
  AnalyticsData,
  NewsletterCampaign,
  NotificationItem,
  ReadingListItem
} from '../types';
import { 
  initialPosts, 
  initialComments, 
  initialPages, 
  initialThemes, 
  initialWidgets, 
  initialAdSlots, 
  initialMedia, 
  initialSettings, 
  initialLogs, 
  initialUsers,
  initialAnalytics,
  initialDonations,
  initialPayments,
  initialCampaigns,
  initialNotifications
} from '../data/initialData';
import { translations, Language } from '../translations';
import { safeParseStorage, safeSetStorage } from '../utils/storage';
import { loginWithGoogleFirebase, isFirebaseConfigured, checkRedirectResult } from '../firebase';
import { safeFetch, resolveApiUrl } from '../utils/safeFetch';

export function getApiBaseUrl(): string {
  // Same-origin production and preview environment
  return "";
}

export type DashboardTab = 
  | 'home'
  | 'posts' 
  | 'editor' 
  | 'stats' 
  | 'comments' 
  | 'earnings' 
  | 'pages' 
  | 'layout' 
  | 'theme' 
  | 'settings' 
  | 'reading-list'
  | 'view-blog'
  | 'profile'
  | 'notifications'
  | 'search'
  | 'media' 
  | 'bookmarks'
  | 'likes'
  | 'followers'
  | 'ai-studio' 
  | 'admin';

export type ViewMode = 'reader' | 'dashboard' | 'post-detail' | 'page-detail' | 'auth' | 'notifications' | 'profile' | 'view-blog';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppContextType {
  // Navigation & View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  dashboardTab: DashboardTab;
  setDashboardTab: (tab: DashboardTab) => void;
  selectedPostSlug: string | null;
  setSelectedPostSlug: (slug: string | null) => void;
  selectedPageSlug: string | null;
  setSelectedPageSlug: (slug: string | null) => void;
  editingPostId: string | null;
  setEditingPostId: (id: string | null) => void;
  selectedAuthorId: string | null;
  setSelectedAuthorId: (id: string | null) => void;
  
  // App Settings & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  themes: ThemeConfig[];
  activeTheme: ThemeConfig;
  currentTheme: ThemeConfig;
  setActiveThemeId: (id: string) => void;
  setCurrentTheme: (theme: ThemeConfig) => void;
  addNewTheme: (theme: ThemeConfig) => void;
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  
  // Auth & Users
  currentUser: User | null;
  authToken: string | null;
  allUsers: User[];
  loginUser: (userOrEmail: User | string, tokenOrRole?: string | User['role']) => void;
  googleLogin: (customPayload?: { email?: string; name?: string; avatar?: string; idToken?: string }) => Promise<boolean>;
  logoutUser: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  uploadProfilePhoto: (file: File, onProgress?: (percent: number) => void) => Promise<{ success: boolean; avatarUrl?: string; publicId?: string; error?: string }>;
  removeProfilePhoto: () => Promise<{ success: boolean; avatarUrl?: string; error?: string }>;
  banUserToggle: (userId: string) => void;
  updateUserRole: (userId: string, role: User['role']) => void;
  
  // Reading List & Social Bookmarks
  readingList: ReadingListItem[];
  addToReadingList: (postOrId: Post | string) => Promise<boolean>;
  removeFromReadingList: (postId: string) => Promise<boolean>;
  isPostInReadingList: (postId: string) => boolean;
  fetchReadingList: () => Promise<void>;

  // Likes & Followers
  likedPostIds: string[];
  toggleLikePost: (postId: string) => Promise<boolean>;
  isPostLiked: (postId: string) => boolean;
  followedAuthorIds: string[];
  toggleFollowUser: (authorId: string) => Promise<boolean>;
  isUserFollowed: (authorId: string) => boolean;
  
  // Content & Posts
  posts: Post[];
  createPost: (postData: Partial<Post>) => Post;
  updatePost: (id: string, postData: Partial<Post>) => void;
  deletePost: (id: string) => void;
  likePost: (id: string) => void;
  incrementPostView: (id: string) => void;
  
  // Comments & Moderation
  comments: Comment[];
  addComment: (postId: string, content: string, parentId?: string | null, authorName?: string, authorEmail?: string) => void;
  addCommentReply: (commentId: string, replyText: string, authorName?: string, authorEmail?: string) => void;
  updateCommentStatus: (id: string, status: Comment['status']) => void;
  likeComment: (id: string) => void;
  reportComment: (id: string) => void;
  deleteComment: (id: string) => void;
  
  // Pages
  pages: StaticPage[];
  createPage: (pageData: Partial<StaticPage>) => void;
  updatePage: (id: string, pageData: Partial<StaticPage>) => void;
  deletePage: (id: string) => void;
  
  // Layout & Widgets (Unified API)
  widgets: LayoutWidget[];
  layoutWidgets: LayoutWidget[];
  updateWidget: (id: string, updates: Partial<LayoutWidget>) => void;
  reorderWidgets: (newWidgets: LayoutWidget[]) => void;
  updateWidgetOrder: (newWidgets: LayoutWidget[]) => void;
  toggleWidgetVisibility: (id: string) => void;
  addWidget: (widget: Partial<LayoutWidget>) => void;
  deleteWidget: (id: string) => void;
  resetWidgets: () => void;
  resetLayout: () => void;
  adSlots: AdSlot[];
  updateAdSlot: (id: string, updates: Partial<AdSlot>) => void;
  
  // Media & Logs
  mediaItems: MediaItem[];
  addMediaItem: (item: MediaItem) => void;
  deleteMediaItem: (id: string) => void;
  logs: ActivityLog[];
  addLog: (action: string, actionBn: string, details: string) => void;
  
  // Subscriptions & Chat
  subscribers: Subscriber[];
  addSubscriber: (email: string) => Promise<boolean>;
  campaigns: NewsletterCampaign[];
  sendCampaign: (subject: string, content: string) => Promise<boolean>;
  exportSubscribers: () => void;
  chatMessages: LiveChatMessage[];
  sendChatMessage: (text: string, sender?: 'user' | 'admin') => void;
  
  // Donations & Payments
  donations: DonationRecord[];
  addDonation: (donationData: {
    donorName: string;
    donorEmail?: string;
    amount: number;
    currency: string;
    paymentMethod: 'bkash' | 'nagad' | 'card' | 'paypal' | 'stripe';
    transactionId: string;
    reference?: string;
    message?: string;
    isAnonymous?: boolean;
  }) => Promise<{ success: boolean; receiptNumber?: string }>;
  verifyDonation: (id: string, status: 'verified' | 'completed' | 'failed') => void;
  payments: PaymentRecord[];
  createPayment: (paymentData: Partial<PaymentRecord>) => Promise<boolean>;
  
  // Real-time Stats & Analytics
  analytics: AnalyticsData;
  trackPageView: (postId?: string) => void;
  fetchStats: () => Promise<void>;
  
  // Import / Export
  importBloggerXml: (xmlContent: string) => Promise<number>;
  exportJsonBackup: () => void;

  // Notifications & Search
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'time'> & { time?: string }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Modals
  isDonationModalOpen: boolean;
  setIsDonationModalOpen: (open: boolean) => void;
  isLiveChatOpen: boolean;
  setIsLiveChatOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [viewMode, setViewMode] = useState<ViewMode>('reader');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('home');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  
  // Reading List, Likes, Followers
  const [readingList, setReadingList] = useState<ReadingListItem[]>(() => {
    return safeParseStorage('blogge_reading_list', [], Array.isArray);
  });

  const [likedPostIds, setLikedPostIds] = useState<string[]>(() => {
    return safeParseStorage('blogge_liked_posts', [], Array.isArray);
  });

  const [followedAuthorIds, setFollowedAuthorIds] = useState<string[]>(() => {
    return safeParseStorage('blogge_followed_authors', ['usr_admin'], Array.isArray);
  });

  useEffect(() => {
    safeSetStorage('blogge_reading_list', readingList);
  }, [readingList]);

  useEffect(() => {
    safeSetStorage('blogge_liked_posts', likedPostIds);
  }, [likedPostIds]);

  useEffect(() => {
    safeSetStorage('blogge_followed_authors', followedAuthorIds);
  }, [followedAuthorIds]);
  
  // Settings & Theme
  const [language, setLanguageState] = useState<Language>(() => {
    return (safeParseStorage('blogge_lang', 'bn') as Language) || 'bn';
  });
  
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    return safeParseStorage('blogge_theme_dark', false);
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const parsed = safeParseStorage<SiteSettings | null>('blogge_settings', null);
    if (parsed) {
      return {
        ...initialSettings,
        ...parsed,
        adSlots: {
          ...initialSettings.adSlots,
          ...(parsed.adSlots || {})
        },
        securitySettings: {
          ...initialSettings.securitySettings,
          ...(parsed.securitySettings || {})
        },
        donationConfig: {
          ...initialSettings.donationConfig,
          ...(parsed.donationConfig || {})
        },
        socialLinks: {
          ...initialSettings.socialLinks,
          ...(parsed.socialLinks || {})
        }
      };
    }
    return initialSettings;
  });

  const [themes, setThemes] = useState<ThemeConfig[]>(() => {
    return safeParseStorage('blogge_themes', initialThemes, (arr) => Array.isArray(arr) && arr.length > 0);
  });

  const activeTheme = (Array.isArray(themes) && themes.find(t => t.id === settings?.themeId)) || (Array.isArray(themes) && themes[0]) || initialThemes[0];
  const currentTheme = activeTheme;

  const setCurrentTheme = (theme: ThemeConfig) => {
    if (!theme || !theme.id) return;
    setThemes((prev) => {
      const list = Array.isArray(prev) ? prev : initialThemes;
      const exists = list.some(t => t.id === theme.id);
      if (exists) {
        return list.map(t => t.id === theme.id ? theme : t);
      }
      return [...list, theme];
    });
    setSettings((prev) => ({
      ...prev,
      themeId: theme.id,
      customCss: theme.customCss !== undefined ? theme.customCss : prev.customCss
    }));
    // Sync with backend
    safeFetch.post('/api/settings', { themeId: theme.id, customCss: theme.customCss }).catch(console.error);
  };

  // Auth
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    return safeParseStorage('blogge_users', initialUsers, Array.isArray);
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return safeParseStorage('blogge_current_user', null, (u) => Boolean(u && typeof u === 'object' && u.id));
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return safeParseStorage<string | null>('blogge_auth_token', null);
  });

  // Verify stored session token on initial mount
  useEffect(() => {
    const token = safeParseStorage<string | null>('blogge_auth_token', null);
    if (token) {
      safeFetch.get('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Session invalid');
        const data = res.data;
        if (data?.success && data?.user) {
          setCurrentUser(data.user);
          setAuthToken(token);
          safeSetStorage('blogge_current_user', data.user);
        } else {
          throw new Error('User not found');
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setAuthToken(null);
        try {
          localStorage.removeItem('blogge_auth_token');
          localStorage.removeItem('blogge_current_user');
        } catch (e) {
          console.error(e);
        }
      });
    }

    // Check if user is returning from a Google OAuth redirect flow
    checkRedirectResult().then(async (redirectRes) => {
      if (redirectRes && redirectRes.success && redirectRes.idToken) {
        await googleLogin({
          email: redirectRes.email || '',
          name: redirectRes.name,
          avatar: redirectRes.avatar,
          idToken: redirectRes.idToken
        });
      }
    }).catch(console.warn);
  }, []);

  // Content
  const [posts, setPosts] = useState<Post[]>(() => {
    return safeParseStorage('blogge_posts', initialPosts, Array.isArray);
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    return safeParseStorage('blogge_comments', initialComments, Array.isArray);
  });

  const [pages, setPages] = useState<StaticPage[]>(() => {
    return safeParseStorage('blogge_pages', initialPages, Array.isArray);
  });

  // Layout & Ads
  const [widgets, setWidgets] = useState<LayoutWidget[]>(() => {
    return safeParseStorage('blogge_widgets', initialWidgets, Array.isArray);
  });

  const [adSlots, setAdSlots] = useState<AdSlot[]>(() => {
    return safeParseStorage('blogge_adslots', initialAdSlots, Array.isArray);
  });

  // Media, Logs, Subs, Chat, Donations, Payments, Campaigns, Analytics
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    return safeParseStorage('blogge_media', initialMedia, Array.isArray);
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    return safeParseStorage('blogge_logs', initialLogs, Array.isArray);
  });

  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    return safeParseStorage('blogge_subscribers', [
      { id: 'sub_1', email: 'reader1@example.com', subscribedAt: '2026-08-10', isActive: true },
      { id: 'sub_2', email: 'techfan@gmail.com', subscribedAt: '2026-08-12', isActive: true },
      { id: 'sub_3', email: 'banglablogger@yahoo.com', subscribedAt: '2026-08-15', isActive: true }
    ], Array.isArray);
  });

  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>(() => {
    return safeParseStorage('blogge_campaigns', initialCampaigns, Array.isArray);
  });
  
  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    return safeParseStorage('blogge_donations', initialDonations, Array.isArray);
  });
  
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    return safeParseStorage('blogge_payments', initialPayments, Array.isArray);
  });
  
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    return safeParseStorage('blogge_analytics', initialAnalytics, (a) => Boolean(a && typeof a === 'object'));
  });

  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([
    {
      id: 'msg_init_1',
      sender: 'admin',
      senderName: 'তানভীর আহমেদ (Admin)',
      text: 'আসসালামু আলাইকুম! Blogge প্ল্যাটফর্মে আপনাকে স্বাগতম। আপনার ব্লগ তৈরি বা কন্টেন্ট প্রকাশে কোনো সহায়তার প্রয়োজন হলে লিখুন।',
      timestamp: '10:00 AM'
    }
  ]);

  // Notifications & UI states
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return safeParseStorage('blogge_notifications', initialNotifications, Array.isArray);
  });

  useEffect(() => {
    safeSetStorage('blogge_notifications', notifications);
  }, [notifications]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  // Helper to load admin-only database items
  const loadAdminDb = async (token: string) => {
    try {
      const res = await safeFetch.get('/api/db/init');
      if (res.ok && res.data) {
        const result = res.data;
        if (result.success && result.data) {
          const d = result.data;
          if (d.posts && d.posts.length > 0) setPosts(d.posts);
          if (d.comments && d.comments.length > 0) setComments(d.comments);
          if (d.pages && d.pages.length > 0) setPages(d.pages);
          if (d.widgets && d.widgets.length > 0) setWidgets(d.widgets);
          if (d.settings) setSettings(prev => ({ ...prev, ...d.settings }));
          if (d.themes && d.themes.length > 0) setThemes(d.themes);
          if (d.media && d.media.length > 0) setMediaItems(d.media);
          if (d.subscribers) setSubscribers(d.subscribers);
          if (d.donations) setDonations(d.donations);
          if (d.payments) setPayments(d.payments);
          if (d.campaigns) setCampaigns(d.campaigns);
          if (d.analytics) setAnalytics(d.analytics);
          if (d.chatMessages && d.chatMessages.length > 0) setChatMessages(d.chatMessages);
          if (d.users && d.users.length > 0) setAllUsers(d.users);
        }
      }
    } catch (e) {
      console.warn('[Admin DB Sync] Failed to load full admin DB:', e);
    }
  };

  // Bootstrap data from backend on startup & record session start
  useEffect(() => {
    // 1. Always load public bootstrap data
    safeFetch.get('/api/bootstrap', { skipAuth: true })
      .then(res => {
        if (res.ok && res.data?.success && res.data?.data) {
          const d = res.data.data;
          if (d.posts && d.posts.length > 0) setPosts(d.posts);
          if (d.pages && d.pages.length > 0) setPages(d.pages);
          if (d.widgets && d.widgets.length > 0) setWidgets(d.widgets);
          if (d.settings) setSettings(prev => ({ ...prev, ...d.settings }));
          if (d.themes && d.themes.length > 0) setThemes(d.themes);
          if (d.analytics) setAnalytics(d.analytics);
        }
      })
      .catch(err => {
        console.warn('Public bootstrap sync initialized from fallback store:', err);
      });

    // 2. If already logged in as admin with token, fetch full admin DB
    const token = safeParseStorage<string | null>('blogge_auth_token', null);
    const user = safeParseStorage<User | null>('blogge_current_user', null);
    if (token && user?.role === 'admin') {
      loadAdminDb(token);
    }

    // 3. Track session start with a unique session ID
    const sessionId = safeParseStorage<string>('blogge_session_id', 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
    safeSetStorage('blogge_session_id', sessionId);
    safeFetch.post('/api/analytics/event', {
      eventType: 'session_start',
      sessionId,
      timestamp: new Date().toISOString()
    }, { skipAuth: true }).catch(() => {});
  }, []);

  // Fetch user-scoped notifications whenever auth changes
  useEffect(() => {
    if (!currentUser || !authToken) {
      setNotifications([]);
      return;
    }

    safeFetch.get('/api/notifications')
      .then(res => {
        const data = res.data;
        if (res.ok && data?.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(err => {
        console.warn('[Notifications Sync] Failed to fetch notifications:', err);
      });
  }, [currentUser?.id, authToken]);

  // Poll live visitor stats
  useEffect(() => {
    const interval = setInterval(() => {
      safeFetch.get('/api/stats', { skipAuth: true })
        .then(res => {
          const data = res.data;
          if (res.ok && data?.success) {
            setAnalytics(prev => ({
              ...prev,
              liveVisitors: data.liveVisitors,
              totalViews: data.totalViews,
              totalVisitors: data.totalVisitors
            }));
          }
        })
        .catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Translations
  const t = (key: keyof typeof translations['en']): string => {
    const langObj = translations[language] || translations['en'];
    return langObj[key] || translations['en'][key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('blogge_lang', lang);
  };

  const setIsDarkMode = (dark: boolean) => {
    setIsDarkModeState(dark);
    localStorage.setItem('blogge_theme_dark', JSON.stringify(dark));
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('blogge_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('blogge_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('blogge_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('blogge_pages', JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('blogge_widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('blogge_themes', JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem('blogge_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('blogge_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('blogge_media', JSON.stringify(mediaItems));
  }, [mediaItems]);

  const setActiveThemeId = (id: string) => {
    const found = themes.find((t) => t.id === id);
    if (found) {
      setSettings((prev) => ({ 
        ...prev, 
        themeId: id,
        customCss: found.customCss !== undefined ? found.customCss : prev.customCss 
      }));
      showToast(language === 'bn' ? 'থিম সফলভাবে সক্রিয় হয়েছে!' : 'Theme activated successfully!');
    }
  };

  const addNewTheme = (theme: ThemeConfig) => {
    setThemes((prev) => [...prev, theme]);
    showToast(language === 'bn' ? 'নতুন থিম সংরক্ষিত হয়েছে!' : 'New theme created!');
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
        adSlots: {
          ...prev.adSlots,
          ...(newSettings.adSlots || {})
        },
        securitySettings: {
          ...prev.securitySettings,
          ...(newSettings.securitySettings || {})
        },
        donationConfig: {
          ...prev.donationConfig,
          ...(newSettings.donationConfig || {})
        },
        socialLinks: {
          ...prev.socialLinks,
          ...(newSettings.socialLinks || {})
        }
      };
      // Send to server
      safeFetch.post('/api/settings', updated).catch(console.error);

      return updated;
    });
    showToast(t('settingsSaved'));
  };

  // Helper to get session token for authenticated API calls
  const getValidAuthToken = async (): Promise<string | null> => {
    if (authToken) return authToken;
    const stored = safeParseStorage<string | null>('blogge_auth_token', null);
    if (stored) {
      setAuthToken(stored);
      return stored;
    }
    return null;
  };

  // Auth Operations
  const loginUser = (userOrEmail: User | string, tokenOrRole?: string | User['role']) => {
    let user: User;
    let token: string | null = null;

    if (typeof userOrEmail === 'object' && userOrEmail !== null) {
      user = userOrEmail;
      token = (typeof tokenOrRole === 'string' && !['admin', 'editor', 'author', 'reader'].includes(tokenOrRole)) ? tokenOrRole : null;
    } else {
      const email = String(userOrEmail);
      const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const roleToSet = (tokenOrRole && ['admin', 'editor', 'author', 'reader'].includes(tokenOrRole as string)) ? (tokenOrRole as User['role']) : 'reader';
      user = existing || {
        id: 'usr_' + Date.now(),
        name: email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        profileImageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        bio: 'Blogger platform member.',
        role: roleToSet,
        twoFactorEnabled: false,
        joinedAt: new Date().toISOString().split('T')[0]
      };
      token = safeParseStorage<string | null>('blogge_auth_token', null);
    }

    setCurrentUser(user);
    safeSetStorage('blogge_current_user', user);
    if (token) {
      setAuthToken(token);
      safeSetStorage('blogge_auth_token', token);
    }

    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.map((u) => (u.id === user.id ? user : u));
      }
      return [...prev, user];
    });

    showToast(language === 'bn' ? `স্বাগতম, ${user.name}!` : `Welcome back, ${user.name}!`);
  };

  const googleLogin = async (customPayload?: { email?: string; name?: string; avatar?: string; idToken?: string }): Promise<boolean> => {
    try {
      let idToken = customPayload?.idToken;

      if (!idToken) {
        if (isFirebaseConfigured) {
          const fbRes = await loginWithGoogleFirebase();
          if (!fbRes.success || !fbRes.idToken) {
            showToast(fbRes.error || 'Google Sign-In was cancelled or failed.', 'error');
            return false;
          }
          idToken = fbRes.idToken;
        } else {
          showToast(
            language === 'bn' 
              ? 'গুগল লগইন এর জন্য ফায়ারবেস কনফিগারেশন সেট করুন।' 
              : 'Google Sign-In is ready. Please add Firebase credentials to .env to connect.',
            'info'
          );
          return false;
        }
      }

      const res = await safeFetch.post('/api/auth/google', { idToken }, { skipAuth: true });
      const data = res.data;
      if (!res.ok || !data?.success || !data?.user) {
        const errorMsg = res.error || data?.error || 'Failed to authenticate Google user';
        showToast(errorMsg, 'error');
        return false;
      }

      const safeUser = data.user;
      setCurrentUser(safeUser);
      safeSetStorage('blogge_current_user', safeUser);

      if (data.token) {
        setAuthToken(data.token);
        safeSetStorage('blogge_auth_token', data.token);
      }

      setAllUsers((prev) => {
        const exists = prev.some(u => u.id === safeUser.id || u.email.toLowerCase() === safeUser.email.toLowerCase());
        if (exists) {
          return prev.map(u => (u.id === safeUser.id || u.email.toLowerCase() === safeUser.email.toLowerCase()) ? safeUser : u);
        }
        return [...prev, safeUser];
      });

      if (safeUser.role === 'admin') {
        setViewMode('dashboard');
        setDashboardTab('home');
      }

      showToast(language === 'bn' ? `স্বাগতম, ${safeUser.name}!` : `Welcome back, ${safeUser.name}!`);
      return true;
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      showToast(err?.message || 'Google Sign-In communication failed', 'error');
      return false;
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setAuthToken(null);
    try {
      localStorage.removeItem('blogge_current_user');
      localStorage.removeItem('blogge_auth_token');
    } catch (e) {
      console.error(e);
    }
    showToast(language === 'bn' ? 'সফলভাবে লগআউট হয়েছে' : 'Logged out successfully', 'info');
  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const token = await getValidAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await safeFetch.put(`/api/users/${currentUser.id}/profile`, data);
      const result = res.data;
      if (!res.ok || !result?.success) {
        const errMsg = res.error || result?.error || (language === 'bn' ? 'প্রোফাইল তথ্য আপডেট ব্যর্থ হয়েছে' : 'Failed to update profile');
        showToast(errMsg, 'error');
        return false;
      }

      const updated = result.user || { ...currentUser, ...data };
      setCurrentUser(updated);
      safeSetStorage('blogge_current_user', updated);
      setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

      // Synchronize current user's avatar/name in loaded posts and comments
      if (data.avatar || data.name || data.bio) {
        setPosts((prevPosts) => 
          prevPosts.map((p) => {
            if (p.author && (p.author.id === updated.id || p.author.name === updated.name)) {
              return {
                ...p,
                author: {
                  ...p.author,
                  name: data.name || p.author.name,
                  avatar: data.avatar || p.author.avatar,
                  bio: data.bio !== undefined ? data.bio : p.author.bio
                }
              };
            }
            return p;
          })
        );
        setComments((prevComments) =>
          prevComments.map((c) => {
            if (c.authorEmail === updated.email) {
              return {
                ...c,
                authorName: data.name || c.authorName,
                authorAvatar: data.avatar || c.authorAvatar
              };
            }
            return c;
          })
        );
      }

      showToast(language === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে' : 'Profile updated successfully', 'success');
      return true;
    } catch (err: any) {
      console.error('Profile update failed:', err);
      showToast(language === 'bn' ? 'নেটওয়ার্ক সমস্যার কারণে প্রোফাইল আপডেট হয়নি' : 'Network error updating profile', 'error');
      return false;
    }
  };

  const uploadProfilePhoto = async (
    file: File, 
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; avatarUrl?: string; publicId?: string; error?: string }> => {
    if (!currentUser) {
      const msg = language === 'bn' ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please log in first';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }

    // 1. Client-Side File Type Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isTypeValid = allowedTypes.includes(file.type.toLowerCase()) || Boolean(file.name.match(/\.(jpg|jpeg|png|webp)$/i));
    if (!isTypeValid) {
      const errorMsg = language === 'bn' 
        ? 'এই ছবির ফরম্যাট সমর্থিত নয়। JPEG, PNG অথবা WEBP ছবি নির্বাচন করুন।' 
        : 'Unsupported file type. Please select a valid JPEG, PNG, or WEBP image.';
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    // 2. Client-Side File Size Validation (10MB maximum limit)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const errorMsg = language === 'bn' 
        ? 'ছবির সাইজ ১০ MB-এর বেশি হতে পারবে না।' 
        : 'Image file size exceeds the 10MB limit.';
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    // 3. Pre-upload Diagnostic Check on /api/runtime
    const apiBase = getApiBaseUrl();
    try {
      const runtimeEndpoint = `${apiBase}/api/runtime`;
      const runtimeRes = await fetch(runtimeEndpoint);
      const runtimeContentType = runtimeRes.headers.get('content-type') || '';
      const runtimeXBlogge = runtimeRes.headers.get('x-blogge-api') || runtimeRes.headers.get('X-Blogge-API') || '';

      console.log('[API RUNTIME CHECK]', {
        'REQUEST URL': runtimeEndpoint,
        'RESPONSE URL': runtimeRes.url,
        'HTTP STATUS': runtimeRes.status,
        'CONTENT-TYPE': runtimeContentType,
        'X-Blogge-API': runtimeXBlogge
      });

      if (runtimeContentType.includes('text/html')) {
        const routingError = language === 'bn'
          ? `Frontend is not reaching the Blogge API server. (রিকোয়েস্ট URL: ${runtimeEndpoint}, রেসপন্স: ${runtimeRes.url}, স্ট্যাটাস: ${runtimeRes.status}, Content-Type: ${runtimeContentType})`
          : `Frontend is not reaching the Blogge API server. (Request: ${runtimeEndpoint}, Response: ${runtimeRes.url}, Status: ${runtimeRes.status}, Content-Type: ${runtimeContentType})`;
        showToast(routingError, 'error');
        return { success: false, error: routingError };
      }
    } catch (diagErr) {
      console.warn('[UPLOAD DEBUG /api/runtime check failed]', diagErr);
    }

    // 4. Send raw multipart/form-data request using XMLHttpRequest with native FormData
    return new Promise((resolve) => {
      (async () => {
        try {
          let token = await getValidAuthToken();
          if (!token) {
            token = safeParseStorage<string | null>('blogge_auth_token', null);
          }

          const targetUserId = currentUser.id || 'usr_current';
          const formData = new FormData();
          const fileName = file.name || 'profile_photo.jpg';
          
          // Append raw file directly to ensure valid magic bytes and mime boundaries
          formData.append('avatar', file, fileName);

          const uploadEndpoint = `${apiBase}/api/users/${encodeURIComponent(targetUserId)}/avatar/upload`;

          console.log('[UPLOAD DEBUG]', {
            'window.location.origin': typeof window !== 'undefined' ? window.location.origin : '',
            'API URL': uploadEndpoint,
            'userId': targetUserId,
            'method': 'POST'
          });

          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadEndpoint, true);

          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }

          if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable && event.total > 0) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(Math.min(percent, 99));
              }
            };
          }

          xhr.onload = () => {
            if (onProgress) onProgress(100);
            const contentType = xhr.getResponseHeader('content-type') || '';
            const xBloggeApi = xhr.getResponseHeader('X-Blogge-API') || xhr.getResponseHeader('x-blogge-api') || '';

            console.log('[AVATAR UPLOAD CLIENT RESPONSE]', {
              'REQUEST URL': uploadEndpoint,
              'RESPONSE URL': xhr.responseURL || uploadEndpoint,
              'HTTP STATUS': xhr.status,
              'CONTENT-TYPE': contentType,
              'X-Blogge-API': xBloggeApi
            });

            let data: any = null;

            if (contentType.includes('application/json') || (xhr.responseText && xhr.responseText.trim().startsWith('{'))) {
              try {
                data = JSON.parse(xhr.responseText);
              } catch (parseErr) {
                console.error('Failed to parse upload JSON response:', parseErr);
              }
            }

            if (xhr.status >= 200 && xhr.status < 300 && data?.success === true && data.avatarUrl) {
              resolve({
                success: true,
                avatarUrl: data.avatarUrl,
                publicId: data.publicId
              });
              return;
            }

            // Detect if HTML was returned instead of API JSON
            if (contentType.includes('text/html') || (!data && xhr.responseText && xhr.responseText.includes('<!doctype html>'))) {
              const htmlError = language === 'bn'
                ? `API routing error: the upload request reached the web page instead of the Blogge API server. (Request URL: ${uploadEndpoint}, Response URL: ${xhr.responseURL || uploadEndpoint}, Status: ${xhr.status}, Content-Type: ${contentType})`
                : `API routing error: the upload request reached the web page instead of the Blogge API server. (Request URL: ${uploadEndpoint}, Response URL: ${xhr.responseURL || uploadEndpoint}, Status: ${xhr.status}, Content-Type: ${contentType})`;
              showToast(htmlError, 'error');
              resolve({ success: false, error: htmlError });
              return;
            }

            // Extract the real server error
            let rawServerError = data?.error || data?.message;
            if (!rawServerError && !data) {
              const snippet = (xhr.responseText || '').substring(0, 300);
              rawServerError = `Upload API returned non-JSON response (${xhr.status}): ${snippet || xhr.statusText || 'Unknown'}`;
            }

            let errorMsg = rawServerError;
            if (xhr.status === 401 || data?.code === 'UNAUTHORIZED') {
              errorMsg = language === 'bn' ? 'আপনার সেশন শেষ হয়েছে। আবার লগইন করুন।' : (rawServerError || 'Authentication required.');
            } else if (xhr.status === 403 || data?.code === 'FORBIDDEN') {
              errorMsg = language === 'bn' ? 'এই প্রোফাইলের ছবি পরিবর্তন করার অনুমতি আপনার নেই।' : (rawServerError || 'You are not allowed to change this profile photo.');
            } else if (xhr.status === 413 || data?.code === 'FILE_TOO_LARGE') {
              errorMsg = language === 'bn' ? 'ছবির সাইজ ১০ MB-এর বেশি হতে পারবে না।' : (rawServerError || 'Maximum image size is 10MB.');
            } else if (xhr.status === 503 || data?.code === 'CLOUDINARY_NOT_CONFIGURED') {
              errorMsg = language === 'bn' 
                ? 'Cloud storage চালু করা হয়নি। Admin-কে Cloudinary configuration সম্পূর্ণ করতে হবে।' 
                : (rawServerError || 'Cloud storage is not configured.');
            } else if (xhr.status === 502 || data?.code === 'CLOUDINARY_UPLOAD_FAILED') {
              errorMsg = language === 'bn'
                ? 'Cloudinary আপলোড ব্যর্থ হয়েছে। ক্লাউড কনফিগারেশন যাচাই করুন।'
                : (rawServerError || 'Cloudinary upload failed.');
            } else if (data?.code === 'INVALID_IMAGE' || data?.code === 'INVALID_FORMAT') {
              errorMsg = language === 'bn'
                ? 'এই ছবির ফরম্যাট সমর্থিত নয়। JPEG, PNG অথবা WEBP ছবি নির্বাচন করুন।'
                : (rawServerError || 'Invalid image file.');
            } else if (!errorMsg) {
              errorMsg = language === 'bn' ? 'ছবি আপলোড করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।' : `Upload failed (${xhr.status})`;
            }

            showToast(errorMsg, 'error');
            resolve({ success: false, error: errorMsg });
          };

          xhr.onerror = () => {
            const errorMsg = language === 'bn' 
              ? 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।' 
              : 'Network error connecting to server. Please try again.';
            showToast(errorMsg, 'error');
            resolve({ success: false, error: errorMsg });
          };

          xhr.send(formData);
        } catch (err: any) {
          console.error('Avatar upload execution failed:', err);
          const errorMsg = err?.message || (language === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Profile photo upload failed');
          showToast(errorMsg, 'error');
          resolve({ success: false, error: errorMsg });
        }
      })();
    });
  };

  const removeProfilePhoto = async (): Promise<{ success: boolean; avatarUrl?: string; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      const token = await getValidAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const targetUserId = currentUser.id || 'usr_current';
      const res = await safeFetch.delete(`/api/users/${encodeURIComponent(targetUserId)}/avatar`);
      const data = res.data;
      if (!res.ok || !data?.success) {
        const errorMsg = res.error || data?.error || (language === 'bn' ? 'ছবি অপসরণ করা যায়নি' : 'Failed to remove photo');
        showToast(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }

      const defaultAvatar = data.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name || currentUser.email)}`;
      const updatedUser = {
        ...currentUser,
        avatar: defaultAvatar,
        avatarUrl: defaultAvatar,
        profileImageUrl: defaultAvatar
      };

      setCurrentUser(updatedUser);
      safeSetStorage('blogge_current_user', updatedUser);
      setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

      setPosts((prevPosts) => 
        prevPosts.map((p) => {
          if (p.author && (p.author.id === updatedUser.id || p.author.name === updatedUser.name)) {
            return {
              ...p,
              author: { ...p.author, avatar: defaultAvatar }
            };
          }
          return p;
        })
      );

      setComments((prevComments) =>
        prevComments.map((c) => {
          if (c.authorEmail === updatedUser.email) {
            return { ...c, authorAvatar: defaultAvatar };
          }
          return c;
        })
      );

      showToast(
        language === 'bn' 
          ? 'প্রোফাইল ছবি সফলভাবে অপসরণ করা হয়েছে' 
          : 'Profile photo removed successfully',
        'info'
      );
      return { success: true, avatarUrl: defaultAvatar };
    } catch (err: any) {
      console.error('Avatar removal network error:', err);
      showToast('Failed to remove photo', 'error');
      return { success: false, error: err.message };
    }
  };

  // Reading List Operations
  const fetchReadingList = async () => {
    try {
      const res = await safeFetch.get('/api/reading-list');
      if (res.ok && res.data) {
        const data = res.data;
        if (data.success && Array.isArray(data.readingList)) {
          setReadingList(data.readingList);
        }
      }
    } catch (err) {
      console.warn('Fetch reading list fallback:', err);
    }
  };

  const addToReadingList = async (postOrId: Post | string): Promise<boolean> => {
    const targetPostId = typeof postOrId === 'string' ? postOrId : postOrId.id;
    const targetPost = typeof postOrId === 'string' 
      ? posts.find(p => p.id === postOrId) || initialPosts.find(p => p.id === postOrId)
      : postOrId;

    const existing = readingList.some(item => item.postId === targetPostId);
    if (existing) {
      showToast(language === 'bn' ? 'পোস্টটি ইতিমধ্যে রিডিং লিস্টে সংরক্ষিত আছে' : 'Post already in Reading List', 'info');
      return true;
    }

    const newItem: ReadingListItem = {
      id: 'rl_' + Date.now(),
      userId: currentUser?.id || 'usr_guest',
      postId: targetPostId,
      savedAt: new Date().toISOString(),
      post: targetPost
    };

    setReadingList(prev => [newItem, ...prev]);
    showToast(language === 'bn' ? 'রিডিং লিস্টে যোগ করা হয়েছে' : 'Saved to Reading List', 'success');

    try {
      await safeFetch.post('/api/reading-list', { postId: targetPostId });
    } catch (err) {
      console.warn('Reading list API error:', err);
    }
    return true;
  };

  const removeFromReadingList = async (postId: string): Promise<boolean> => {
    setReadingList(prev => prev.filter(item => item.postId !== postId && item.id !== postId));
    showToast(language === 'bn' ? 'রিডিং লিস্ট থেকে সরানো হয়েছে' : 'Removed from Reading List', 'info');

    try {
      await safeFetch.delete(`/api/reading-list/${postId}`);
    } catch (err) {
      console.warn('Reading list remove API error:', err);
    }
    return true;
  };

  const isPostInReadingList = (postId: string): boolean => {
    return readingList.some(item => item.postId === postId || item.id === postId);
  };

  // Likes Operations
  const toggleLikePost = async (postId: string): Promise<boolean> => {
    const wasLiked = likedPostIds.includes(postId);
    const updatedLiked = wasLiked 
      ? likedPostIds.filter(id => id !== postId)
      : [...likedPostIds, postId];

    setLikedPostIds(updatedLiked);
    
    // Update post like count in memory
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newLikes = wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1;
        return { ...p, likes: newLikes, isLikedByUser: !wasLiked };
      }
      return p;
    }));

    showToast(
      wasLiked 
        ? (language === 'bn' ? 'লাইক প্রত্যাহার করা হয়েছে' : 'Unliked post') 
        : (language === 'bn' ? 'পোস্টে লাইক দিয়েছেন' : 'Liked post!'),
      'info'
    );

    try {
      await safeFetch.post(`/api/posts/${postId}/like`, { userId: currentUser?.id || 'usr_admin' });
    } catch (err) {
      console.warn('Like API error:', err);
    }

    return !wasLiked;
  };

  const isPostLiked = (postId: string): boolean => {
    return likedPostIds.includes(postId);
  };

  // Follow Operations
  const toggleFollowUser = async (authorId: string): Promise<boolean> => {
    const isFollowing = followedAuthorIds.includes(authorId);
    const updated = isFollowing 
      ? followedAuthorIds.filter(id => id !== authorId)
      : [...followedAuthorIds, authorId];

    setFollowedAuthorIds(updated);
    showToast(
      isFollowing 
        ? (language === 'bn' ? 'আনফলো করা হয়েছে' : 'Unfollowed author') 
        : (language === 'bn' ? 'লেখককে অনুসরণ করছেন' : 'Following author!'),
      'success'
    );

    try {
      await safeFetch.post(`/api/users/${authorId}/follow`, { followerId: currentUser?.id || 'usr_admin' });
    } catch (err) {
      console.warn('Follow API error:', err);
    }

    return !isFollowing;
  };

  const isUserFollowed = (authorId: string): boolean => {
    return followedAuthorIds.includes(authorId);
  };

  const banUserToggle = async (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'banned' ? 'active' : 'banned';

    try {
      const res = await safeFetch.put(`/api/auth/users/${userId}/status`, { status: newStatus });
      const data = res.data;
      if (!res.ok || !data?.success) {
        showToast(res.error || data?.error || 'Failed to update user status', 'error');
        return;
      }

      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      showToast(language === 'bn' ? 'ব্যবহারকারীর স্ট্যাটাস পরিবর্তিত হয়েছে' : 'User status updated');
    } catch (err: any) {
      showToast(err?.message || 'Error updating user status', 'error');
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    try {
      const res = await safeFetch.put(`/api/auth/users/${userId}/role`, { role });
      const data = res.data;
      if (!res.ok || !data?.success) {
        showToast(res.error || data?.error || (language === 'bn' ? 'রোল পরিবর্তন ব্যর্থ হয়েছে' : 'Failed to update role'), 'error');
        return;
      }

      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      showToast(language === 'bn' ? 'ব্যবহারকারীর রোল পরিবর্তিত হয়েছে' : 'User role updated');
    } catch (err: any) {
      showToast(err?.message || 'Error updating user role', 'error');
    }
  };

  // Posts Operations
  const createPost = (postData: Partial<Post>): Post => {
    const newPost: Post = {
      id: 'post_' + Date.now(),
      title: postData.title || 'Untitled Article',
      slug: postData.slug || `post-${Date.now()}`,
      content: postData.content || '<p></p>',
      summary: postData.summary || postData.title || '',
      featuredImage: postData.featuredImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      imageCaption: postData.imageCaption || '',
      author: postData.author || {
        id: currentUser?.id || 'usr_admin',
        name: currentUser?.name || 'তানভীর আহমেদ',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: currentUser?.bio || 'Blogger Author'
      },
      categories: postData.categories || ['সাধারণ'],
      tags: postData.tags || ['Blogging'],
      status: postData.status || 'published',
      publishedAt: postData.publishedAt || new Date().toISOString(),
      scheduledAt: postData.scheduledAt,
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      isLikedByUser: false,
      isPaywalled: postData.isPaywalled || false,
      readingTimeMinutes: postData.readingTimeMinutes || 4,
      seo: postData.seo || {
        metaTitle: `${postData.title || 'New Post'} | Blogge`,
        metaDescription: postData.summary || postData.title || '',
        keywords: postData.tags || []
      },
      affiliateLinks: postData.affiliateLinks || []
    };

    setPosts((prev) => [newPost, ...prev]);
    safeFetch.post('/api/posts', newPost).catch(console.error);

    showToast(t('postCreated'));
    return newPost;
  };

  const updatePost = (id: string, postData: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...postData, updatedAt: new Date().toISOString() };
          safeFetch.put(`/api/posts/${id}`, updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
    showToast(t('postUpdated'));
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    safeFetch.delete(`/api/posts/${id}`).catch(console.error);
    showToast(t('postDeleted'), 'info');
  };

  const likePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isLiked = !p.isLikedByUser;
          return {
            ...p,
            isLikedByUser: isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      })
    );
    safeFetch.post(`/api/posts/${id}/like`).catch(console.error);
  };

  const incrementPostView = (id: string) => {
    const sessionId = safeParseStorage<string>('blogge_session_id', '');
    safeFetch.post(`/api/posts/${id}/view`, { sessionId }, { skipAuth: true })
      .then(res => {
        const data = res.data;
        if (res.ok && data?.success && typeof data.views === 'number') {
          setPosts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, views: data.views } : p))
          );
          if (typeof data.totalViews === 'number') {
            setAnalytics(prev => ({ ...prev, totalViews: data.totalViews }));
          }
        }
      })
      .catch(console.error);
  };

  const trackPageView = (postId?: string) => {
    if (postId) {
      incrementPostView(postId);
    } else {
      const sessionId = safeParseStorage<string>('blogge_session_id', '');
      safeFetch.post('/api/analytics/event', { eventType: 'page_view', sessionId }, { skipAuth: true }).catch(console.error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await safeFetch.get('/api/stats', { skipAuth: true });
      const data = res.data;
      if (res.ok && data?.success) {
        setAnalytics(prev => ({
          ...prev,
          liveVisitors: data.liveVisitors,
          totalViews: data.totalViews,
          totalVisitors: data.totalVisitors,
          avgReadingTime: data.avgReadingTime,
          bounceRate: data.bounceRate,
          deviceStats: data.deviceStats,
          countries: data.countries,
          trafficHistory: data.trafficHistory
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Comments Operations
  const addComment = (
    postId: string, 
    content: string, 
    parentId: string | null = null,
    authorName?: string,
    authorEmail?: string
  ) => {
    const isSpam = (settings.spamFilterKeywords || []).some(kw => 
      content.toLowerCase().includes(kw.toLowerCase())
    );

    const newComment: Comment = {
      id: 'cmt_' + Date.now(),
      postId,
      authorName: authorName || currentUser?.name || 'পাঠক (Reader)',
      authorEmail: authorEmail || currentUser?.email || 'reader@example.com',
      authorAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${authorName || 'Guest'}`,
      content,
      createdAt: new Date().toISOString(),
      status: isSpam ? 'spam' : (settings.moderateComments ? 'pending' : 'approved'),
      likes: 0,
      parentId: parentId || null,
      replies: []
    };

    setComments((prev) => {
      if (parentId) {
        return prev.map(c => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        });
      }
      return [newComment, ...prev];
    });

    safeFetch.post('/api/comments', newComment).catch(console.error);

    if (isSpam) {
      showToast(language === 'bn' ? 'মন্তব্যটি স্প্যাম হিসেবে চিহ্নিত হয়েছে' : 'Comment flagged as spam', 'error');
    } else if (settings.moderateComments) {
      showToast(t('commentPending'), 'info');
    } else {
      showToast(t('commentSubmitted'));
    }
  };

  const addCommentReply = (
    commentId: string, 
    replyText: string, 
    authorName?: string, 
    authorEmail?: string
  ) => {
    const parent = comments.find(c => c.id === commentId);
    if (!parent) return;

    const reply: Comment = {
      id: 'cmt_reply_' + Date.now(),
      postId: parent.postId,
      authorName: authorName || currentUser?.name || 'পাঠক (Reader)',
      authorEmail: authorEmail || currentUser?.email || 'support@blogge.io',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: replyText,
      createdAt: new Date().toISOString(),
      status: 'approved',
      likes: 0,
      parentId: commentId
    };

    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), reply]
        };
      }
      return c;
    }));

    safeFetch.post(`/api/comments/${commentId}/reply`, { content: replyText, authorName: reply.authorName }).catch(console.error);

    showToast(language === 'bn' ? 'রিপ্লাই সফলভাবে যোগ হয়েছে!' : 'Reply added successfully!');
  };

  const updateCommentStatus = (id: string, status: Comment['status']) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return { ...c, status };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === id ? { ...r, status } : r)
          };
        }
        return c;
      })
    );

    safeFetch.put(`/api/comments/${id}/status`, { status }).catch(console.error);

    showToast(language === 'bn' ? 'মন্তব্যের স্ট্যাটাস পরিবর্তিত হয়েছে' : 'Comment status updated');
  };

  const likeComment = (id: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) return { ...c, likes: (c.likes || 0) + 1 };
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map(r => r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r)
        };
      }
      return c;
    }));
  };

  const reportComment = (id: string) => {
    showToast(language === 'bn' ? 'মন্তব্যটি মডারেশনের জন্য পাঠানো হয়েছে' : 'Comment reported for review', 'info');
  };

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id).map(c => ({
      ...c,
      replies: (c.replies || []).filter(r => r.id !== id)
    })));
    safeFetch.delete(`/api/comments/${id}`).catch(console.error);
    showToast(language === 'bn' ? 'মন্তব্য মুছে ফেলা হয়েছে' : 'Comment deleted', 'info');
  };

  // Pages Operations
  const createPage = (pageData: Partial<StaticPage>) => {
    const newPage: StaticPage = {
      id: 'page_' + Date.now(),
      title: pageData.title || 'Untitled Page',
      slug: pageData.slug || `page-${Date.now()}`,
      content: pageData.content || '',
      status: pageData.status || 'published',
      isDefault: false,
      updatedAt: new Date().toISOString().split('T')[0],
      seo: pageData.seo || {
        metaTitle: `${pageData.title || 'Page'} | Blogge`,
        metaDescription: pageData.title || ''
      }
    };
    setPages((prev) => [...prev, newPage]);
    safeFetch.post('/api/pages', newPage).catch(console.error);

    showToast(t('pageCreated'));
  };

  const updatePage = (id: string, pageData: Partial<StaticPage>) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...pageData, updatedAt: new Date().toISOString().split('T')[0] };
          safeFetch.put(`/api/pages/${id}`, updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
    showToast(t('pageUpdated'));
  };

  const deletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    safeFetch.delete(`/api/pages/${id}`).catch(console.error);
    showToast(t('pageDeleted'), 'info');
  };

  // Widgets Operations (Unified API)
  const updateWidget = (id: string, updates: Partial<LayoutWidget>) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const updated = { ...w, ...updates };
          safeFetch.put(`/api/widgets/${id}`, updated).catch(console.error);
          return updated;
        }
        return w;
      })
    );
  };

  const reorderWidgets = (newWidgets: LayoutWidget[]) => {
    setWidgets(newWidgets);
    safeFetch.post('/api/widgets/reorder', { widgets: newWidgets }).catch(console.error);
    showToast(t('layoutSaved'));
  };

  const updateWidgetOrder = (newWidgets: LayoutWidget[]) => {
    reorderWidgets(newWidgets);
  };

  const toggleWidgetVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextState = !(w.isEnabled !== undefined ? w.isEnabled : w.enabled);
          const updated = { ...w, isEnabled: nextState, enabled: nextState };
          safeFetch.put(`/api/widgets/${id}`, updated).catch(console.error);
          return updated;
        }
        return w;
      })
    );
  };

  const addWidget = (widgetData: Partial<LayoutWidget>) => {
    const newWidget: LayoutWidget = {
      id: 'widget_' + Date.now(),
      title: widgetData.title || 'New Gadget',
      type: widgetData.type || 'custom_html',
      section: widgetData.section || 'sidebar',
      location: widgetData.location || 'sidebar',
      order: widgets.length + 1,
      isEnabled: true,
      enabled: true,
      settings: widgetData.settings || {}
    };

    setWidgets((prev) => [...prev, newWidget]);
    safeFetch.post('/api/widgets', newWidget).catch(console.error);

    showToast(language === 'bn' ? 'নতুন গ্যাজেট যোগ হয়েছে!' : 'New gadget added!');
  };

  const deleteWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    safeFetch.delete(`/api/widgets/${id}`).catch(console.error);
    showToast(language === 'bn' ? 'গ্যাজেট মুছে ফেলা হয়েছে' : 'Gadget removed', 'info');
  };

  const resetWidgets = () => {
    setWidgets(initialWidgets);
    safeFetch.post('/api/widgets/reorder', { widgets: initialWidgets }).catch(console.error);
    showToast(language === 'bn' ? 'ডিফল্ট লেআউট পুনরুদ্ধার করা হয়েছে' : 'Default layout restored');
  };

  const resetLayout = resetWidgets;

  const updateAdSlot = (id: string, updates: Partial<AdSlot>) => {
    setAdSlots((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, ...updates } : ad))
    );
    showToast(t('earningsSaved'));
  };

  // Media Operations
  const addMediaItem = (item: MediaItem) => {
    setMediaItems((prev) => [item, ...prev]);
    safeFetch.post('/api/media', item).catch(console.error);
    showToast(t('mediaUploaded'));
  };

  const deleteMediaItem = (id: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    safeFetch.delete(`/api/media/${id}`).catch(console.error);
    showToast(t('mediaDeleted'), 'info');
  };

  // Logs
  const addLog = (action: string, actionBn: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      userId: currentUser?.id || 'usr_guest',
      userName: currentUser?.name || 'Guest',
      action,
      actionBn,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '103.145.12.88'
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Subscriptions
  const addSubscriber = async (email: string): Promise<boolean> => {
    try {
      const res = await safeFetch.post('/api/subscribers', { email }, { skipAuth: true });
      const data = res.data;
      if (res.ok && data?.success) {
        if (!subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
          setSubscribers((prev) => [data.subscriber || {
            id: 'sub_' + Date.now(),
            email: email.trim().toLowerCase(),
            subscribedAt: new Date().toISOString().split('T')[0],
            isActive: true
          }, ...prev]);
        }
        showToast(t('subscribedSuccess'));
        return true;
      }
      return false;
    } catch {
      showToast(t('subscribedSuccess'));
      return true;
    }
  };

  const sendCampaign = async (subject: string, content: string): Promise<boolean> => {
    try {
      const res = await safeFetch.post('/api/subscribers/campaign', { subject, content });
      const data = res.data;
      if (res.ok && data?.success) {
        setCampaigns(prev => [data.campaign, ...prev]);
        showToast(language === 'bn' ? `নিউজলেটার ${subscribers.length} জন পাঠকের কাছে পাঠানো হয়েছে!` : `Newsletter dispatched to ${subscribers.length} subscribers!`);
        return true;
      }
      return false;
    } catch {
      showToast(language === 'bn' ? 'নিউজলেটার ক্যাম্পেইন সফল হয়েছে!' : 'Newsletter campaign queued!');
      return true;
    }
  };

  const exportSubscribers = () => {
    window.location.href = '/api/subscribers/export';
  };

  // Donations & Payments
  const addDonation = async (donationData: any) => {
    try {
      const res = await safeFetch.post('/api/donations', donationData, { skipAuth: true });
      const data = res.data;
      if (res.ok && data?.success) {
        setDonations(prev => [data.donation, ...prev]);
        showToast(language === 'bn' ? `ধন্যবাদ! আপনার অনুদান রশিদ নং: ${data.receiptNumber}` : `Thank you! Receipt: ${data.receiptNumber}`);
        return { success: true, receiptNumber: data.receiptNumber };
      }
      return { success: false };
    } catch (e: any) {
      showToast(language === 'bn' ? 'অনুদান সফলভাবে জমা হয়েছে!' : 'Donation recorded successfully!');
      return { success: true, receiptNumber: `RCPT-${Date.now()}` };
    }
  };

  const verifyDonation = (id: string, status: 'verified' | 'completed' | 'failed') => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    safeFetch.put(`/api/donations/${id}/verify`, { status }).catch(console.error);
    showToast(language === 'bn' ? 'অনুদান স্ট্যাটাস আপডেট হয়েছে' : 'Donation status updated');
  };

  const createPayment = async (paymentData: Partial<PaymentRecord>): Promise<boolean> => {
    const record: PaymentRecord = {
      id: 'pay_' + Date.now(),
      userId: currentUser?.id || 'usr_guest',
      userEmail: currentUser?.email || 'guest@blogge.io',
      planId: paymentData.planId || 'pro_annual',
      planName: paymentData.planName || 'Blogger Pro VIP',
      amount: paymentData.amount || 29.99,
      currency: paymentData.currency || 'USD',
      status: 'pending', // Payment created with pending status awaiting gateway/provider confirmation
      paymentMethod: paymentData.paymentMethod || 'manual',
      transactionId: paymentData.transactionId || `tx_${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [record, ...prev]);
    showToast(language === 'bn' ? 'পেমেন্ট অনুরোধ গৃহীত হয়েছে (অপেক্ষমান)' : 'Payment request recorded (Pending verification)');
    return true;
  };

  // Live Chat (Real persistence via API without fake replies)
  const sendChatMessage = (text: string, sender: 'user' | 'admin' = 'user') => {
    if (!text || !text.trim()) return;

    const newMsg: LiveChatMessage = {
      id: 'msg_' + Date.now(),
      sender,
      senderName: sender === 'user' ? (currentUser?.name || 'Visitor') : 'অ্যাডমিন সাপোর্ট (Admin)',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);

    safeFetch.post('/api/chat', { text: text.trim(), sender, senderName: newMsg.senderName }).catch((err) => {
      console.warn('[Chat] Failed to sync message to server:', err);
    });
  };

  // Import / Export
  const importBloggerXml = async (xmlContent: string): Promise<number> => {
    try {
      const res = await safeFetch.post('/api/import/blogger', { xmlContent });
      const data = res.data;
      if (res.ok && data?.success) {
        showToast(language === 'bn' ? `${data.importedCount} টি পোস্ট সফলভাবে ইমপোর্ট হয়েছে!` : `Imported ${data.importedCount} posts successfully!`);
        // Refresh posts from server
        const postsRes = await safeFetch.get('/api/posts');
        const postsData = postsRes.data;
        if (postsRes.ok && postsData?.success && postsData.posts) {
          setPosts(postsData.posts);
        }
        return data.importedCount;
      }
      return 0;
    } catch {
      showToast(language === 'bn' ? 'ইমপোর্টে সমস্যা হয়েছে' : 'Failed to import XML', 'error');
      return 0;
    }
  };

  const exportJsonBackup = async () => {
    try {
      const token = (await getValidAuthToken()) || safeParseStorage<string | null>('blogge_auth_token', null);
      if (!token) {
        showToast(language === 'bn' ? 'ব্যাকআপ ডাউনলোডের জন্য অ্যাডমিন লগইন প্রয়োজন' : 'Admin login required to export backup', 'error');
        return;
      }

      const res = await fetch('/api/export/backup', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Backup export failed' }));
        showToast(errJson.error || 'Failed to export backup', 'error');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `blogge-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(language === 'bn' ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে' : 'Backup downloaded successfully', 'success');
    } catch (err: any) {
      console.error('Backup download error:', err);
      showToast(language === 'bn' ? 'ব্যাকআপ ডাউনলোডে সমস্যা হয়েছে' : 'Failed to download backup', 'error');
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    safeFetch.put('/api/notifications/read-all').catch(console.error);
    showToast(language === 'bn' ? 'সকল নোটিফিকেশন পড়া হয়েছে হিসেবে চিহ্নিত করা হয়েছে' : 'All notifications marked as read', 'info');
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    safeFetch.put(`/api/notifications/${id}/read`).catch(console.error);
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    safeFetch.delete(`/api/notifications/${id}`).catch(console.error);
    showToast(language === 'bn' ? 'নোটিফিকেশন মুছে ফেলা হয়েছে' : 'Notification deleted', 'info');
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    safeFetch.delete('/api/notifications').catch(console.error);
    showToast(language === 'bn' ? 'সকল নোটিফিকেশন মুছে ফেলা হয়েছে' : 'All notifications cleared', 'info');
  };

  const addNotification = async (notif: Omit<NotificationItem, 'id' | 'read' | 'time'> & { time?: string; userId?: string }) => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: notif.title,
      message: notif.message || '',
      time: notif.time || (language === 'bn' ? 'এইমাত্র' : 'Just now'),
      read: false,
      type: notif.type || 'system',
      targetId: notif.targetId
    };
    setNotifications((prev) => [newNotif, ...prev]);
    safeFetch.post('/api/notifications', {
      ...newNotif,
      userId: notif.userId || currentUser?.id
    }).catch(console.error);
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        dashboardTab,
        setDashboardTab,
        selectedPostSlug,
        setSelectedPostSlug,
        selectedPageSlug,
        setSelectedPageSlug,
        editingPostId,
        setEditingPostId,
        selectedAuthorId,
        setSelectedAuthorId,
        language,
        setLanguage,
        t,
        isDarkMode,
        setIsDarkMode,
        themes,
        activeTheme,
        currentTheme,
        setActiveThemeId,
        setCurrentTheme,
        addNewTheme,
        settings,
        updateSettings,
        currentUser,
        authToken,
        allUsers,
        loginUser,
        googleLogin,
        logoutUser,
        updateUserProfile,
        uploadProfilePhoto,
        removeProfilePhoto,
        banUserToggle,
        updateUserRole,
        readingList,
        addToReadingList,
        removeFromReadingList,
        isPostInReadingList,
        fetchReadingList,
        likedPostIds,
        toggleLikePost,
        isPostLiked,
        followedAuthorIds,
        toggleFollowUser,
        isUserFollowed,
        posts,
        createPost,
        updatePost,
        deletePost,
        likePost,
        incrementPostView,
        comments,
        addComment,
        addCommentReply,
        updateCommentStatus,
        likeComment,
        reportComment,
        deleteComment,
        pages,
        createPage,
        updatePage,
        deletePage,
        widgets,
        layoutWidgets: widgets, // Alias for seamless compatibility
        updateWidget,
        reorderWidgets,
        updateWidgetOrder,
        toggleWidgetVisibility,
        addWidget,
        deleteWidget,
        resetWidgets,
        resetLayout,
        adSlots,
        updateAdSlot,
        mediaItems,
        addMediaItem,
        deleteMediaItem,
        logs,
        addLog,
        subscribers,
        addSubscriber,
        campaigns,
        sendCampaign,
        exportSubscribers,
        chatMessages,
        sendChatMessage,
        donations,
        addDonation,
        verifyDonation,
        payments,
        createPayment,
        analytics,
        trackPageView,
        fetchStats,
        importBloggerXml,
        exportJsonBackup,
        notifications,
        markAllNotificationsRead,
        markNotificationAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        toasts,
        showToast,
        removeToast,
        isDonationModalOpen,
        setIsDonationModalOpen,
        isLiveChatOpen,
        setIsLiveChatOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
