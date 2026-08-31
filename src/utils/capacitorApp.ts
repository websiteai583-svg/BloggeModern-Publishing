import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Browser } from '@capacitor/browser';

export const PRODUCTION_SERVER_URL = 'https://ais-pre-pzbpjh4puhyyswictfxr55-469359533093.asia-southeast1.run.app';

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_SERVER_URL;
  }
  return '';
}

export function formatApiUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalizedPath}` : normalizedPath;
}

/**
 * Initializes Capacitor Network and Native device handlers:
 * - Intercepts relative /api/ and /uploads/ fetch calls when running natively
 * - Configures Android Status Bar styling
 * - Auto-hides Splash Screen
 * - Handles Android hardware back button navigation
 * - Intercepts external links to open via in-app browser
 */
export function initCapacitorApp(handlers?: {
  canGoBack?: () => boolean;
  onGoBack?: () => void;
}) {
  // If running on native platform (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    // Hide splash screen smoothly
    SplashScreen.hide().catch(() => {});

    // Configure Status Bar
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});

    // Handle Hardware Back Button
    CapApp.addListener('backButton', ({ canGoBack: capCanGoBack }) => {
      if (handlers?.canGoBack && handlers.canGoBack()) {
        handlers.onGoBack?.();
      } else if (capCanGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp().catch(() => {});
      }
    });

    // Intercept external anchor tag clicks
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href) {
        const url = target.href;
        if (url.startsWith('http://') || url.startsWith('https://')) {
          const currentOrigin = window.location.origin;
          const isInternal = url.startsWith(currentOrigin) || url.startsWith(PRODUCTION_SERVER_URL);
          if (!isInternal) {
            e.preventDefault();
            Browser.open({ url }).catch(() => {
              window.open(url, '_blank');
            });
          }
        }
      }
    });
  }
}
