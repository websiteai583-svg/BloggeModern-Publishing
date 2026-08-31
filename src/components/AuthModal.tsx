import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { safeFetch } from '../utils/safeFetch';
import { Mail, Lock, User as UserIcon, ShieldCheck, X, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
    if (initialResetToken) {
      setResetToken(initialResetToken);
    }
  }, [initialMode, initialResetToken]);

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            loginUser(data.user, data.token);
            showToast(language === 'bn' ? 'লগইন সফল হয়েছে!' : 'Login successful!');
            onClose();
          }
        } else {
          showToast(res.error || data?.error || data?.message || (language === 'bn' ? 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে' : 'Invalid email or password'), 'error');
        }
      } else if (mode === 'register') {
        const res = await safeFetch.post('/api/auth/register', { name: name.trim(), email: email.trim(), password }, { skipAuth: true });
        const data = res.data;
        if (res.ok && data?.success && data?.user) {
          if (data.token) {
            localStorage.setItem('blogge_auth_token', data.token);
          }
          loginUser(data.user, data.token);
          showToast(language === 'bn' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!');
          onClose();
        } else {
          showToast(res.error || data?.error || data?.message || (language === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে' : 'Registration failed'), 'error');
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
          setMode('login');
        } else {
          showToast(
            res.error || data?.error || (language === 'bn' ? 'পাসওয়ার্ড রিসেট অনুরোধ সম্পন্ন করা যায়নি।' : 'Failed to process password reset request.'),
            'error'
          );
        }
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          showToast(language === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.', 'error');
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
          // Remove token param from URL without refreshing
          if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        } else {
          showToast(
            res.error || data?.error || (language === 'bn' ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।' : 'Password reset failed.'),
            'error'
          );
        }
      }
    } catch {
      showToast(language === 'bn' ? 'সার্ভারের সাথে যোগাযোগে ত্রুটি ঘটেছে' : 'Network connection error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const success = await googleLogin();
      if (success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div id="auth-modal-card" className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-3">
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
        </div>

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
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
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
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 text-xs"
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
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-sm"
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
                type="button"
                onClick={() => setMode('register')}
                className="text-indigo-500 hover:text-indigo-600 font-bold underline"
              >
                {language === 'bn' ? 'নিবন্ধন করুন' : 'Sign up'}
              </button>
            </span>
          )}
          {mode === 'register' && (
            <span>
              {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-500 hover:text-indigo-600 font-bold underline"
              >
                {language === 'bn' ? 'লগইন করুন' : 'Sign in'}
              </button>
            </span>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-500 hover:text-indigo-600 font-bold underline"
              >
                {language === 'bn' ? 'লগইন পেজে ফিরে যান' : 'Back to login'}
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
