import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  safeFetch, 
  checkApiConnectivity, 
  isDeviceOnline, 
  isNativeMobile, 
  getApiBaseUrl, 
  setCustomApiUrl, 
  getStoredApiUrl, 
  ApiConnectivityResult 
} from '../utils/safeFetch';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Wifi,
  WifiOff,
  Settings2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset';
  resetToken?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  resetToken: initialResetToken = ''
}) => {
  const { loginUser, googleLogin, language, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset' | '2fa'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDiagnostics, setErrorDiagnostics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Network & Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [connectivity, setConnectivity] = useState<ApiConnectivityResult | null>(null);
  const [isCheckingConn, setIsCheckingConn] = useState<boolean>(false);
  const [showServerConfig, setShowServerConfig] = useState<boolean>(false);
  const [customServerUrl, setCustomServerUrl] = useState<string>(() => getStoredApiUrl() || '');

  useEffect(() => {
    setMounted(true);
    setIsOnline(isDeviceOnline());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const runConnectivityCheck = useCallback(async () => {
    setIsCheckingConn(true);
    try {
      const result = await checkApiConnectivity(5000);
      setConnectivity(result);
      if (result.isInvalidApi) {
        setErrorMessage(
          language === 'bn' 
            ? 'প্রোডাকশন API কনফিগারেশন ত্রুটিপূর্ণ বা অনুপস্থিত।' 
            : 'Production API configuration is invalid or missing.'
        );
        setErrorDiagnostics(
          !result.url
            ? 'No backend API URL configured. Please enter your public Cloud Run API URL in Server Settings below.'
            : `Endpoint: ${result.url} returned HTML or 302 redirect instead of JSON. Direct public API required.`
        );
        setShowServerConfig(true);
      }
    } catch {
      setConnectivity({
        ok: false,
        status: 0,
        latencyMs: 0,
        url: getApiBaseUrl() + '/api/health',
        online: isDeviceOnline(),
        error: 'Network timeout'
      });
    } finally {
      setIsCheckingConn(false);
    }
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      runConnectivityCheck();
    }
  }, [isOpen, runConnectivityCheck]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      setErrorMessage(null);
      setErrorDiagnostics(null);
    }
    if (initialResetToken) {
      setResetToken(initialResetToken);
    }
  }, [initialMode, initialResetToken]);

  // Clear errors on mode change
  const handleModeChange = (newMode: 'login' | 'register' | 'forgot' | 'reset' | '2fa') => {
    setMode(newMode);
    setErrorMessage(null);
    setErrorDiagnostics(null);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setErrorMessage(null);
      setErrorDiagnostics(null);
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Check URL query parameters for reset token on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        setResetToken(token);
        setMode('reset');
      }
    }
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const handleSaveCustomServerUrl = () => {
    setCustomApiUrl(customServerUrl.trim() || null);
    showToast(
      customServerUrl.trim() 
        ? (language === 'bn' ? 'সার্ভার URL হালনাগাদ করা হয়েছে' : 'Backend server URL updated') 
        : (language === 'bn' ? 'ডিফল্ট সার্ভার URL পুনরুদ্ধার করা হয়েছে' : 'Restored default backend URL'),
      'info'
    );
    runConnectivityCheck();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorDiagnostics(null);

    // 0. API Validity check
    if (connectivity?.isInvalidApi) {
      const invalidMsg = language === 'bn'
        ? 'প্রোডাকশন API কনফিগারেশন সেট করা নেই বা ত্রুটিপূর্ণ।'
        : 'Production API configuration is invalid or unconfigured.';
      setErrorMessage(invalidMsg);
      setErrorDiagnostics(
        !connectivity.url 
          ? 'No backend API URL configured. Please enter your public Cloud Run API URL in Server Settings below.' 
          : `Endpoint: ${connectivity.url} returned HTML or 302 redirect. Direct public API required.`
      );
      showToast(invalidMsg, 'error');
      setShowServerConfig(true);
      return;
    }

    // 1. Offline pre-check
    if (!isDeviceOnline()) {
      const offMsg = language === 'bn' 
        ? 'আপনার ডিভাইস অফলাইনে রয়েছে। ইন্টারনেট সংযোগ চেক করে পুনরায় চেষ্টা করুন।'
        : 'Your device is offline. Please check your internet connection and try again.';
      setErrorMessage(offMsg);
      showToast(offMsg, 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await safeFetch.post('/api/auth/login', { email: email.trim(), password }, { skipAuth: true });
        const data = res.data;
        if (res.ok && data?.success && data?.user) {
          if (data.token) {
            localStorage.setItem('blogge_auth_token', data.token);
          }
          if (data.requires2FA) {
            setMode('2fa');
            showToast(language === 'bn' ? 'টু-ফ্যাক্টর ওটিপি কোড পাঠানো হয়েছে' : '2FA OTP code dispatched to email', 'info');
          } else {
            await loginUser(data.user, data.token);
            showToast(language === 'bn' ? 'লগইন সফল হয়েছে!' : 'Login successful!');
            onClose();
          }
        } else {
          const status = res.status;
          const isNetworkError = !res.ok && (status === 0 || status === 408);
          const serverError = data?.error || data?.message || res.error;
          const displayError = isNetworkError 
            ? (language === 'bn' ? 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি' : 'Unable to connect to the server') 
            : (serverError || (language === 'bn' ? 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে' : 'Invalid email or password'));

          setErrorMessage(displayError);
          setErrorDiagnostics(
            isNetworkError
              ? `Target: ${getApiBaseUrl() || window.location.origin}/api/auth/login | Check device connectivity or server status.`
              : `Endpoint: POST /api/auth/login | HTTP ${status} | Error: ${serverError || 'Unauthorized'}`
          );
          showToast(displayError, 'error');
        }
      } else if (mode === 'register') {
        // Client validation: password confirmation
        if (password !== confirmPassword) {
          const mismatchMsg = language === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.';
          setErrorMessage(mismatchMsg);
          showToast(mismatchMsg, 'error');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          const lenMsg = language === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.';
          setErrorMessage(lenMsg);
          showToast(lenMsg, 'error');
          setIsLoading(false);
          return;
        }

        const res = await safeFetch.post('/api/auth/register', { 
          name: name.trim(), 
          email: email.trim(), 
          password 
        }, { skipAuth: true });

        const data = res.data;
        if (res.ok && data?.success && data?.user) {
          if (data.token) {
            localStorage.setItem('blogge_auth_token', data.token);
          }
          await loginUser(data.user, data.token);
          showToast(language === 'bn' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!');
          onClose();
        } else {
          const status = res.status;
          const isNetworkError = !res.ok && (status === 0 || status === 408);
          const serverError = data?.error || data?.message || res.error;
          const displayError = isNetworkError 
            ? (language === 'bn' ? 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি' : 'Unable to connect to the server') 
            : (serverError || (language === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে' : 'Registration failed'));

          setErrorMessage(displayError);
          setErrorDiagnostics(
            isNetworkError
              ? `Target: ${getApiBaseUrl() || window.location.origin}/api/auth/register | Check device connectivity or server status.`
              : `Endpoint: POST /api/auth/register | HTTP ${status} | Error: ${serverError || 'Registration rejected'}`
          );
          showToast(displayError, 'error');
        }
      } else if (mode === '2fa') {
        showToast(
          language === 'bn' 
            ? 'টু-ফ্যাক্টর অথেন্টিকেশন সার্ভিস কনফিগার করা নেই।' 
            : 'Two-Factor Authentication (2FA) service is not configured.', 
          'error'
        );
      } else if (mode === 'forgot') {
        const res = await safeFetch.post('/api/auth/forgot-password', { email: email.trim() }, { skipAuth: true });
        const data = res.data;
        if (res.ok && data?.success) {
          showToast(
            data?.message || (language === 'bn' ? 'পাসওয়ার্ড রিসেট নির্দেশনা পাঠানো হয়েছে' : 'Password reset instructions sent'), 
            'success'
          );
          handleModeChange('login');
        } else {
          const status = res.status;
          const isNetworkError = !res.ok && status === 0;
          const serverError = res.error || data?.error || (language === 'bn' ? 'পাসওয়ার্ড রিসেট অনুরোধ সম্পন্ন করা যায়নি।' : 'Failed to process password reset request.');
          const displayError = isNetworkError ? 'Unable to connect to the server' : serverError;
          setErrorMessage(displayError);
          setErrorDiagnostics(isNetworkError ? 'Network connection failure' : `Endpoint: POST /api/auth/forgot-password | HTTP ${status}`);
          showToast(displayError, 'error');
        }
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          const mismatchMsg = language === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.';
          setErrorMessage(mismatchMsg);
          showToast(mismatchMsg, 'error');
          setIsLoading(false);
          return;
        }

        const res = await safeFetch.post('/api/auth/reset-password', { token: resetToken.trim(), newPassword: password }, { skipAuth: true });
        const data = res.data;
        if (res.ok && data?.success) {
          showToast(
            data?.message || (language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' : 'Password updated successfully.'), 
            'success'
          );
          if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
          handleModeChange('login');
          setPassword('');
          setConfirmPassword('');
        } else {
          const status = res.status;
          const isNetworkError = !res.ok && status === 0;
          const serverError = res.error || data?.error || (language === 'bn' ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।' : 'Password reset failed.');
          const displayError = isNetworkError ? 'Unable to connect to the server' : serverError;
          setErrorMessage(displayError);
          setErrorDiagnostics(isNetworkError ? 'Network connection failure' : `Endpoint: POST /api/auth/reset-password | HTTP ${status}`);
          showToast(displayError, 'error');
        }
      }
    } catch (err: any) {
      const netMsg = language === 'bn' ? 'সার্ভারের সাথে যোগাযোগে ত্রুটি হয়েছে' : 'Unable to connect to the server';
      setErrorMessage(netMsg);
      setErrorDiagnostics(`Exception: ${err?.message || 'Network communication error'}`);
      showToast(netMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isDeviceOnline()) {
      const offMsg = language === 'bn' 
        ? 'আপনার ডিভাইস অফলাইনে রয়েছে। ইন্টারনেট সংযোগ চেক করুন।' 
        : 'Your device is offline. Please check your internet connection.';
      setErrorMessage(offMsg);
      showToast(offMsg, 'error');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setErrorDiagnostics(null);
    try {
      const success = await googleLogin();
      if (success) {
        onClose();
      } else {
        const failureMsg = language === 'bn' 
          ? 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।'
          : 'Google Sign-In could not be completed.';
        setErrorMessage(failureMsg);
        setErrorDiagnostics(
          language === 'bn'
            ? 'ফায়ারবেস বা গুগল ক্লাউড কনফিগারেশন সেট করুন।'
            : 'Google Sign-In requires Firebase / Google OAuth credentials configured in .env or native Android Google Services.'
        );
      }
    } catch (err: any) {
      const errMsg = language === 'bn' ? 'গুগল সাইন-ইন সম্পন্ন করা সম্ভব হয়নি' : 'Google Sign-In could not be completed';
      setErrorMessage(errMsg);
      setErrorDiagnostics(`Google Auth Exception: ${err?.message || 'Communication failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const modalElement = (
    <div 
      id="auth-modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div 
        id="auth-modal-card" 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto z-10"
      >
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition z-20 cursor-pointer"
          aria-label="Close auth modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-2.5">
            {mode === '2fa' ? <ShieldCheck className="w-6 h-6" /> : mode === 'reset' ? <CheckCircle2 className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' && (language === 'bn' ? 'লগইন করুন' : 'Sign in to Blogge')}
            {mode === 'register' && (language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account')}
            {mode === 'forgot' && (language === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Forgot Password')}
            {mode === 'reset' && (language === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password')}
            {mode === '2fa' && (language === 'bn' ? 'টু-ফ্যাক্টর ওটিপি যাচাই' : '2FA OTP Verification')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login' && (language === 'bn' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Access your publishing workspace')}
            {mode === 'register' && (language === 'bn' ? 'সহজেই আপনার অ্যাকাউন্ট তৈরি করুন' : 'Join the blogging community')}
            {mode === 'forgot' && (language === 'bn' ? 'আপনার নিবন্ধিত ইমেইল প্রবেশ করান' : 'Enter your registered email address')}
            {mode === 'reset' && (language === 'bn' ? 'আপনার অ্যাকাউন্টের জন্য নতুন পাসওয়ার্ড দিন' : 'Enter your new secure password')}
            {mode === '2fa' && (language === 'bn' ? 'আপনার ইমেইলে প্রেরিত ৬ ডিজিটের কোডটি লিখুন' : 'Enter 6-digit code sent to your email')}
          </p>

          {/* Network & API Health Status Bar */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span 
              id="network-status-badge"
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                isOnline 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? (language === 'bn' ? 'অনলাইন' : 'Online') : (language === 'bn' ? 'অফলাইন' : 'Offline')}
            </span>

            {connectivity && (
              <span 
                id="api-connectivity-badge"
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  connectivity.ok 
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
                title={connectivity.url}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${connectivity.ok ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`} />
                {connectivity.ok ? `API ${connectivity.latencyMs}ms` : (language === 'bn' ? 'সার্ভার পাওয়া যায়নি' : 'Server unreachable')}
              </span>
            )}

            <button
              type="button"
              id="btn-toggle-server-settings"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition cursor-pointer"
              title="Configure API Server URL"
            >
              <Settings2 className="w-3 h-3" />
            </button>
          </div>

          {/* Collapsible Server Configuration (Helpful for Android APK / Staging testing) */}
          {showServerConfig && (
            <div id="server-config-panel" className="mt-3 p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'ব্যাকএন্ড API সার্ভার URL' : 'Backend API Server URL'}
                </label>
                <button
                  type="button"
                  onClick={runConnectivityCheck}
                  disabled={isCheckingConn}
                  className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isCheckingConn ? 'animate-spin' : ''}`} />
                  {language === 'bn' ? 'সংযোগ পরীক্ষা' : 'Test Ping'}
                </button>
              </div>
              <input
                type="text"
                id="input-custom-api-url"
                value={customServerUrl}
                onChange={(e) => setCustomServerUrl(e.target.value)}
                placeholder={getApiBaseUrl() || 'https://...'}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono mb-2"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomServerUrl('');
                    setCustomApiUrl(null);
                    runConnectivityCheck();
                  }}
                  className="px-2.5 py-1 rounded-md text-[11px] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {language === 'bn' ? 'ডিফল্ট' : 'Reset'}
                </button>
                <button
                  type="button"
                  id="btn-save-custom-server-url"
                  onClick={handleSaveCustomServerUrl}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Apply'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error / Diagnostics Banner */}
        {errorMessage && (
          <div
            id="auth-error-banner"
            role="alert"
            className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5 shadow-sm"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{errorMessage}</p>
              {errorDiagnostics && (
                <p className="text-[10px] text-red-500/80 dark:text-red-400/70 mt-1 font-mono break-all">
                  {errorDiagnostics}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'পুরো নাম' : 'Full Name'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার নাম' : 'Your full name'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'রিসেট টোকেন' : 'Reset Token'}
              </label>
              <input
                id="input-auth-reset-token"
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste token from email link"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {mode === 'reset' ? (language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password') : (language === 'bn' ? 'পাসওয়ার্ড' : 'Password')}
                </label>
                {mode === 'login' && (
                  <button
                    id="btn-switch-forgot-password"
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-medium cursor-pointer"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'reset') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-auth-confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {mode === '2fa' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {language === 'bn' ? '৬-ডিজিটের ওটিপি কোড' : '6-Digit OTP Code'}
              </label>
              <input
                id="input-auth-otp"
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full tracking-widest text-center text-xl font-mono py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <button
            id="btn-submit-auth-form"
            type="submit"
            disabled={isLoading || !isOnline}
            className={`w-full py-2.5 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 text-xs cursor-pointer ${
              !isOnline 
                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/25'
            }`}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && (language === 'bn' ? 'লগইন করুন' : 'Sign In')}
                  {mode === 'register' && (language === 'bn' ? 'রেজিস্টার করুন' : 'Create Account')}
                  {mode === 'forgot' && (language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link')}
                  {mode === 'reset' && (language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ করুন' : 'Update Password')}
                  {mode === '2fa' && (language === 'bn' ? 'ওটিপি ভেরিফাই করুন' : 'Verify & Continue')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Social Login Divider */}
        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {language === 'bn' ? 'অথবা' : 'Or continue with'}
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              id="btn-google-oauth-login"
              onClick={handleGoogleSignIn}
              disabled={isLoading || !isOnline}
              className={`w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-sm cursor-pointer ${
                !isOnline ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{language === 'bn' ? 'গুগল দিয়ে প্রবেশ করুন' : 'Sign in with Google'}</span>
            </button>
          </>
        )}

        {/* Switch Mode Footer */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' && (
            <span>
              {language === 'bn' ? 'কোনো অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
              <button
                id="btn-switch-register"
                type="button"
                onClick={() => handleModeChange('register')}
                className="text-indigo-500 hover:text-indigo-600 font-bold underline cursor-pointer"
              >
                {language === 'bn' ? 'নিবন্ধন করুন' : 'Sign up'}
              </button>
            </span>
          )}
          {mode === 'register' && (
            <span>
              {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
              <button
                id="btn-switch-login"
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-indigo-500 hover:text-indigo-600 font-bold underline cursor-pointer"
              >
                {language === 'bn' ? 'লগইন করুন' : 'Sign in'}
              </button>
            </span>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <span>
              <button
                id="btn-back-to-login"
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-indigo-500 hover:text-indigo-600 font-bold underline cursor-pointer"
              >
                {language === 'bn' ? 'লগইন পেজে ফিরে যান' : 'Back to login'}
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};
