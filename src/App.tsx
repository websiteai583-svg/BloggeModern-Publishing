import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { DonationModal } from './components/DonationModal';
import { LiveSupportChat } from './components/LiveSupportChat';
import { DashboardErrorBoundary } from './components/DashboardErrorBoundary';
import { initCapacitorApp } from './utils/capacitorApp';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

// Reader Views
import { ReaderView } from './components/ReaderView';
import { PostDetailView } from './components/PostDetailView';
import { PageView } from './components/PageView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { PublicBlogView } from './components/dashboard/PublicBlogView';

// Dashboard Router
import { DashboardRouter } from './components/dashboard/DashboardRouter';
import { sanitizeCss } from './utils/sanitize';

const MainContent: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    dashboardTab,
    currentTheme,
    isDarkMode,
    isDonationModalOpen,
    setIsDonationModalOpen,
    editingPostId,
    setEditingPostId,
    selectedPostSlug,
    setSelectedPostSlug,
    selectedPageSlug,
    setSelectedPageSlug,
    isOnline,
    isServerReachable,
    retryConnection,
    language
  } = useApp();

  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryConnection();
    } finally {
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  useEffect(() => {
    initCapacitorApp({
      canGoBack: () => {
        if (isDonationModalOpen) return true;
        if (editingPostId) return true;
        if (selectedPostSlug) return true;
        if (selectedPageSlug) return true;
        if (viewMode !== 'reader') return true;
        return false;
      },
      onGoBack: () => {
        if (isDonationModalOpen) {
          setIsDonationModalOpen(false);
        } else if (editingPostId) {
          setEditingPostId(null);
        } else if (selectedPostSlug) {
          setSelectedPostSlug(null);
          setViewMode('reader');
        } else if (selectedPageSlug) {
          setSelectedPageSlug(null);
          setViewMode('reader');
        } else if (viewMode !== 'reader') {
          setViewMode('reader');
        }
      }
    });
  }, [
    isDonationModalOpen,
    editingPostId,
    selectedPostSlug,
    selectedPageSlug,
    viewMode,
    setViewMode,
    setIsDonationModalOpen,
    setEditingPostId,
    setSelectedPostSlug,
    setSelectedPageSlug
  ]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark text-slate-100' : 'text-slate-900'} font-sans antialiased transition-colors duration-200 relative selection:bg-indigo-500/30 selection:text-indigo-200`}>
      {/* Frosted Glass Radial Mesh Background */}
      <div className={isDarkMode ? 'mesh-bg' : 'mesh-bg-light'} />

      {/* Dynamic Custom Theme CSS Injected */}
      {currentTheme?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeCss(currentTheme.customCss) }} />
      )}

      {/* Top Universal Navbar */}
      <Navbar />

      {/* Offline & Connectivity Reconnect Notice */}
      {(!isOnline || !isServerReachable) && (
        <div 
          id="network-reconnect-notice"
          className={`w-full py-2.5 px-4 text-xs font-semibold flex items-center justify-between transition-colors duration-200 border-b ${
            !isOnline
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 max-w-xl">
            {!isOnline ? (
              <WifiOff className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
            )}
            <span>
              {!isOnline
                ? (language === 'bn' ? 'আপনি বর্তমানে অফলাইনে আছেন। সংরক্ষিত তথ্য প্রদর্শিত হচ্ছে।' : 'You are currently offline. Displaying cached content.')
                : (language === 'bn' ? 'সার্ভারে সংযোগ করা যাচ্ছে না। আপনার ইন্টারনেট চেক করুন।' : 'Unable to connect to backend server. Cached content remains active.')}
            </span>
          </div>

          <button
            id="btn-reconnect-retry"
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition text-white border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{language === 'bn' ? 'পুনরায় চেষ্টা' : 'Retry'}</span>
          </button>
        </div>
      )}

      {/* Primary View Routing */}
      {viewMode === 'reader' && <ReaderView />}
      {viewMode === 'post-detail' && <PostDetailView />}
      {viewMode === 'page-detail' && <PageView />}
      {viewMode === 'notifications' && <NotificationsView />}
      {viewMode === 'profile' && <ProfileView />}
      {viewMode === 'view-blog' && <PublicBlogView />}

      {/* Dashboard View with Google Blogger Sidebar Layout */}
      {viewMode === 'dashboard' && (
        <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
          <Sidebar />
          
          <main className="flex-1 min-w-0">
            <DashboardErrorBoundary key={dashboardTab}>
              <DashboardRouter tab={dashboardTab} />
            </DashboardErrorBoundary>
          </main>
        </div>
      )}

      {/* Interactive Global Modals & Realtime Widgets */}
      <ToastContainer />
      <DonationModal />
      <LiveSupportChat />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
