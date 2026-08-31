import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ArrowLeft, 
  MessageSquare, 
  UserPlus, 
  Heart, 
  Shield, 
  FileText, 
  Sparkles, 
  Check, 
  ExternalLink,
  Inbox
} from 'lucide-react';
import { NotificationItem } from '../types';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markAllNotificationsRead, 
    markNotificationAsRead, 
    deleteNotification, 
    clearAllNotifications, 
    setViewMode, 
    setDashboardTab, 
    language, 
    showToast 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'comment' | 'system'>('all');

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const filteredNotifications = safeNotifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'comment') return n.type === 'comment';
    if (activeFilter === 'system') return n.type === 'system' || n.type === 'subscriber' || n.type === 'donation';
    return true;
  });

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'subscriber':
        return <UserPlus className="w-5 h-5 text-emerald-500" />;
      case 'donation':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />;
      case 'post':
        return <FileText className="w-5 h-5 text-amber-500" />;
      case 'system':
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
    // Destination routing
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              id="btn-notif-back"
              onClick={() => setViewMode('reader')}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {language === 'bn' ? 'নোটিফিকেশন সেন্টার' : 'Notification Center'}
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-sm">
                    {unreadCount} {language === 'bn' ? 'অপঠিত' : 'new'}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {language === 'bn' 
                  ? 'আপনার ব্লগ, মন্তব্য, সাবস্ক্রাইবার ও সিস্টেম সতর্কতার সমস্ত আপডেট।' 
                  : 'All updates about your blog posts, reader comments, subscribers and alerts.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read-page"
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60 transition"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{language === 'bn' ? 'সব পড়া হয়েছে' : 'Mark all read'}</span>
              </button>
            )}
            {safeNotifications.length > 0 && (
              <button
                id="btn-clear-all-notifs-page"
                onClick={clearAllNotifications}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold border border-rose-200 dark:border-rose-900/40 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Clear all'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-200/60 dark:border-slate-800/80 pt-4">
          {[
            { id: 'all', label: language === 'bn' ? 'সকল' : 'All', count: safeNotifications.length },
            { id: 'unread', label: language === 'bn' ? 'অপঠিত' : 'Unread', count: unreadCount },
            { id: 'comment', label: language === 'bn' ? 'মন্তব্য' : 'Comments', count: safeNotifications.filter(n => n.type === 'comment').length },
            { id: 'system', label: language === 'bn' ? 'সিস্টেম ও অন্যান্য' : 'System', count: safeNotifications.filter(n => n.type !== 'comment').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {language === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {language === 'bn' 
                ? 'আপনার ব্লগে নতুন কোনো কার্যক্রম বা অ্যালার্ট আসলে এখানে দেখতে পাবেন।' 
                : 'When new activity or alerts happen on your blog, they will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`group flex items-start justify-between gap-4 p-4 rounded-2xl border transition cursor-pointer ${
                notif.read
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 shadow-sm hover:border-indigo-400'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className={`p-2.5 rounded-xl border mt-0.5 ${
                  notif.read
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700 shadow-sm'
                }`}>
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm font-bold truncate ${
                      notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                    }`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  {notif.message && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>{notif.time}</span>
                    {notif.targetId && (
                      <span className="inline-flex items-center gap-0.5 text-indigo-500 font-medium">
                        {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View details'}
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Individual Item Actions */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                {!notif.read && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    title={language === 'bn' ? 'পড়া হয়েছে চিহ্নিত করুন' : 'Mark as read'}
                    className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
