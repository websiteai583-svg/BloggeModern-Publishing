import React, { useEffect } from 'react';
import { DashboardTab } from '../../context/AppContext';
import { DashboardHome } from './DashboardHome';
import { PostsManager } from './PostsManager';
import { PostEditor } from './PostEditor';
import { StatsDashboard } from './StatsDashboard';
import { CommentsManager } from './CommentsManager';
import { EarningsManager } from './EarningsManager';
import { PagesManager } from './PagesManager';
import { LayoutBuilder } from './LayoutBuilder';
import { ThemeCustomizer } from './ThemeCustomizer';
import { SettingsManager } from './SettingsManager';
import { MediaManager } from './MediaManager';
import { AiStudio } from './AiStudio';
import { AdminPanel } from './AdminPanel';
import { ReadingListManager } from './ReadingListManager';
import { PublicBlogView } from './PublicBlogView';
import { LikesManager } from './LikesManager';
import { FollowersManager } from './FollowersManager';
import { SearchManager } from './SearchManager';

interface DashboardRouterProps {
  tab: DashboardTab;
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({ tab }) => {
  useEffect(() => {
    // Development navigation logger for quick debugging
    if (import.meta.env.DEV) {
      const tabComponentMap: Record<string, string> = {
        home: 'DashboardHome',
        posts: 'PostsManager',
        editor: 'PostEditor',
        stats: 'StatsDashboard',
        comments: 'CommentsManager',
        earnings: 'EarningsManager',
        pages: 'PagesManager',
        layout: 'LayoutBuilder',
        theme: 'ThemeCustomizer',
        settings: 'SettingsManager',
        media: 'MediaManager',
        'ai-studio': 'AiStudio',
        admin: 'AdminPanel',
        'reading-list': 'ReadingListManager',
        'view-blog': 'PublicBlogView',
        likes: 'LikesManager',
        followers: 'FollowersManager',
        search: 'SearchManager'
      };
      const componentName = tabComponentMap[tab] || 'DashboardHome (Fallback)';
      console.groupCollapsed?.(`[Dashboard Navigation] Tab: ${tab}`);
      console.log('Selected tab:', tab);
      console.log('Component:', componentName);
      console.groupEnd?.();
    }
  }, [tab]);

  // Safe mapping of all Blogger-style tabs to real working components
  switch (tab) {
    case 'home':
      return <DashboardHome />;
    case 'posts':
      return <PostsManager />;
    case 'editor':
      return <PostEditor />;
    case 'stats':
      return <StatsDashboard />;
    case 'comments':
      return <CommentsManager />;
    case 'earnings':
      return <EarningsManager />;
    case 'pages':
      return <PagesManager />;
    case 'layout':
      return <LayoutBuilder />;
    case 'theme':
      return <ThemeCustomizer />;
    case 'settings':
      return <SettingsManager />;
    case 'media':
      return <MediaManager />;
    case 'ai-studio':
      return <AiStudio />;
    case 'admin':
      return <AdminPanel />;
    case 'reading-list':
      return <ReadingListManager />;
    case 'view-blog':
      return <PublicBlogView />;
    case 'likes':
      return <LikesManager />;
    case 'followers':
      return <FollowersManager />;
    case 'search':
      return <SearchManager />;
    default:
      return <DashboardHome />;
  }
};
