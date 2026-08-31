import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  ShieldCheck, 
  Search, 
  Download, 
  Upload, 
  Save, 
  Globe, 
  FileCode, 
  Lock, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { settings, updateSettings, posts, comments, pages, currentTheme, language, t, showToast } = useApp();

  const [siteName, setSiteName] = useState(settings?.siteName || 'Blogge Pro');
  const [siteNameBn, setSiteNameBn] = useState(settings?.siteNameBn || 'ব্লগার প্রো (Blogge)');
  const [tagline, setTagline] = useState(settings?.tagline || 'The Next-Gen Digital Publishing Platform');
  const [taglineBn, setTaglineBn] = useState(settings?.taglineBn || 'আধুনিক বাংলা ও আন্তর্জাতিক ডিজিটাল পাবলিশিং প্ল্যাটফর্ম');
  const [googleConsole, setGoogleConsole] = useState(settings?.googleSearchConsoleVerification || settings?.googleSearchConsoleMeta || '');
  const [robotsTxt, setRobotsTxt] = useState(settings?.robotsTxt || 'User-agent: *\nAllow: /\nSitemap: https://blogge.io/sitemap.xml');
  const [twoFactor, setTwoFactor] = useState(settings?.securitySettings?.twoFactorRequired ?? false);
  const [allowPublicComments, setAllowPublicComments] = useState(settings?.allowPublicComments ?? true);
  const [commentApproval, setCommentApproval] = useState(settings?.commentApprovalRequired ?? false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteName,
      siteNameBn,
      tagline,
      taglineBn,
      googleSearchConsoleVerification: googleConsole,
      robotsTxt,
      allowPublicComments,
      commentApprovalRequired: commentApproval,
      securitySettings: {
        ...(settings?.securitySettings || {}),
        twoFactorRequired: twoFactor
      }
    });
    showToast(language === 'bn' ? 'সকল সেটিংস সফলভাবে আপডেট হয়েছে!' : 'Site settings updated successfully!');
  };

  // Export complete JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      settings,
      posts,
      comments,
      pages,
      currentTheme
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blogge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast(language === 'bn' ? 'সম্পূর্ণ ব্লগের ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে!' : 'Full blog backup JSON exported successfully!');
  };

  return (
    <div id="settings-manager-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('settings')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'ওয়েবসাইটের সাধারণ তথ্য, এসইও, সিকিউরিটি ও ডাটা ব্যাকআপ' : 'General configuration, search indexing, security, and full data export'}
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition"
        >
          <Download className="w-4 h-4 text-orange-500" />
          <span>{language === 'bn' ? 'ব্যাকআপ ডাউনলোড (JSON)' : 'Export Backup'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General Site Branding */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            {language === 'bn' ? 'সাধারণ পরিচিতি (General Information)' : 'General Information'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                সাইটের নাম (বাংলা)
              </label>
              <input
                type="text"
                value={siteNameBn}
                onChange={(e) => setSiteNameBn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Site Name (English)
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ট্যাগলাইন (বাংলা)
              </label>
              <input
                type="text"
                value={taglineBn}
                onChange={(e) => setTaglineBn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline (English)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* SEO & Search Console */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            {language === 'bn' ? 'গুগল সার্চ কনসোল ও ইনডেক্সিং' : 'Search Console & Crawlers'}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Search Console HTML Meta Tag Verification
            </label>
            <input
              type="text"
              value={googleConsole}
              onChange={(e) => setGoogleConsole(e.target.value)}
              placeholder='<meta name="google-site-verification" content="..." />'
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              কাস্টম Robots.txt ফাইল কনফিগারেশন
            </label>
            <textarea
              rows={3}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950 text-emerald-400 font-mono text-xs"
            />
          </div>
        </div>

        {/* Security & Comments Policy */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            {language === 'bn' ? 'নিরাপত্তা ও মন্তব্য নীতিমালা' : 'Security & Moderation Rules'}
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">টু-ফ্যাক্টর অথেনটিকেশন (2FA OTP)</span>
                <span className="text-[11px] text-slate-400">অ্যাডমিন অ্যাকাউন্টে লগইনের সময় ইমেইল ওটিপি নিশ্চিতকরণ</span>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">পাঠকদের মন্তব্যের সুযোগ (Allow Public Comments)</span>
                <span className="text-[11px] text-slate-400">পোস্টের নিচে ভিজিটররা সরাসরি মতামত জানাতে পারবে</span>
              </div>
              <input
                type="checkbox"
                checked={allowPublicComments}
                onChange={(e) => setAllowPublicComments(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">মন্তব্য স্বয়ংক্রিয় প্রকাশ না করে মডারেশন (Approval Required)</span>
                <span className="text-[11px] text-slate-400">অ্যাডমিনের অনুমোদনের পূর্বে ব্লগে দৃশ্যমান হবে না</span>
              </div>
              <input
                type="checkbox"
                checked={commentApproval}
                onChange={(e) => setCommentApproval(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>{t('saveSettings')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
