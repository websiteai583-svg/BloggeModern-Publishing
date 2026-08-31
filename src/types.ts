export type UserRole = 'admin' | 'editor' | 'author' | 'reader';
export type Role = UserRole;

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  bio: string;
  website?: string;
  role: UserRole;
  status?: 'active' | 'banned' | 'inactive';
  articlesCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowedByUser?: boolean;
  twoFactorEnabled: boolean;
  joinedAt: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface ReadingListItem {
  id: string;
  userId: string;
  postId: string;
  savedAt: string;
  post?: Post;
}

export type PostStatus = 'published' | 'draft' | 'scheduled' | 'trash';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML / Rich formatted content
  summary: string;
  featuredImage: string;
  imageCaption?: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
  };
  categories: string[];
  tags: string[];
  status: PostStatus;
  publishedAt: string;
  createdAt?: string;
  scheduledAt?: string;
  updatedAt: string;
  views: number;
  likes: number;
  isLikedByUser?: boolean;
  isPaywalled?: boolean;
  readingTimeMinutes: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  affiliateLinks?: Array<{
    title: string;
    url: string;
    discountCode?: string;
  }>;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'spam' | 'trash';
  likes: number;
  parentId?: string | null; // For nested replies
  replies?: Comment[];
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft';
  isPublished?: boolean;
  showInHeader?: boolean;
  showInFooter?: boolean;
  isDefault: boolean; // About, Contact, Privacy, Terms
  updatedAt: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface LayoutWidget {
  id: string;
  title: string;
  type: 'header' | 'navbar' | 'featured_slider' | 'main_posts' | 'author_bio' | 'popular_posts' | 'categories' | 'newsletter' | 'adsense_banner' | 'social_follow' | 'custom_html' | 'footer_about' | 'footer_links' | 'footer_copyright';
  section: 'header' | 'top_bar' | 'hero' | 'sidebar' | 'content_top' | 'content_bottom' | 'footer';
  order: number;
  isEnabled: boolean;
  enabled?: boolean;
  location?: 'sidebar' | 'header' | 'footer';
  settings?: Record<string, any>;
}

export interface ThemeConfig {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  previewImage: string;
  fontFamily?: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
  primaryColor: string;
  accentColor: string;
  bgColorLight: string;
  cardBgLight: string;
  bgColorDark: string;
  cardBgDark: string;
  borderRadius: string;
  headerStyle: 'standard' | 'minimal' | 'bold_banner' | 'centered';
  customCss?: string;
  isCustom?: boolean;
}

export interface AdSlot {
  id: string;
  title: string;
  location: 'header_leaderboard' | 'sidebar_rectangle' | 'in_post_banner' | 'footer_banner' | 'sticky_bottom';
  isEnabled: boolean;
  adType: 'adsense' | 'custom_banner' | 'affiliate_banner';
  bannerImageUrl?: string;
  targetUrl?: string;
  adsenseSlotId?: string;
  altText?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  fileName?: string;
  url: string;
  type: 'image' | 'video' | 'document';
  fileType?: 'image' | 'video' | 'pdf' | 'document';
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  altText?: string;
  dimensions?: { width: number; height: number };
}

export interface SiteSettings {
  siteName: string;
  siteNameBn: string;
  tagline: string;
  taglineBn: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  language: 'bn' | 'en';
  themeId: string;
  customCss: string;
  customHeaderHtml: string;
  customFooterHtml: string;
  googleAdsensePubId: string;
  isAdsenseAutoAds: boolean;
  googleSearchConsoleMeta?: string;
  googleSearchConsoleVerification?: string;
  robotsTxt: string;
  enableComments: boolean;
  moderateComments: boolean;
  allowPublicComments?: boolean;
  commentApprovalRequired?: boolean;
  spamFilterKeywords: string[];
  securitySettings?: {
    twoFactorRequired?: boolean;
    loginNotifications?: boolean;
    sessionTimeoutMinutes?: number;
  };
  adSlots?: {
    adsensePublisherId?: string;
    autoAdsEnabled?: boolean;
    headerAdEnabled?: boolean;
    sidebarAdEnabled?: boolean;
    inPostAdEnabled?: boolean;
    footerStickyAdEnabled?: boolean;
  };
  donationConfig: {
    isEnabled?: boolean;
    enabled?: boolean;
    title: string;
    description: string;
    bkashNumber?: string;
    nagadNumber?: string;
    stripeEnabled?: boolean;
    paypalEmail?: string;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  actionBn: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  time: string;
  read: boolean;
  type?: 'comment' | 'post' | 'subscriber' | 'donation' | 'system' | 'message';
  targetId?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface LiveChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'bot';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  currency: string;
  paymentMethod: 'bkash' | 'nagad' | 'card' | 'paypal' | 'stripe';
  transactionId: string;
  reference?: string;
  status: 'pending' | 'verified' | 'completed' | 'failed';
  isAnonymous?: boolean;
  message?: string;
  receiptNumber: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId?: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  invoiceNumber: string;
  createdAt: string;
}

export interface AnalyticsSession {
  sessionId: string;
  startedAt: string;
  lastSeen: string;
  device?: string;
  country?: string;
}

export interface AnalyticsPostView {
  sessionId: string;
  postId: string;
  viewedAt: string;
}

export interface AnalyticsData {
  liveVisitors: number;
  totalViews: number;
  totalVisitors: number;
  avgReadingTime: string;
  bounceRate: string;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  countries: Array<{
    country: string;
    flag: string;
    visitors: number;
    percentage: number;
  }>;
  trafficHistory: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
  sessions?: AnalyticsSession[];
  postViews?: AnalyticsPostView[];
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  sentAt?: string;
  status: 'draft' | 'sending' | 'sent';
  recipientCount: number;
  openRate?: number;
}
