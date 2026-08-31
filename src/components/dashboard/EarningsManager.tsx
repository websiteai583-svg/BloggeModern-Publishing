import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  CreditCard, 
  Coffee, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Save,
  Clock,
  Check,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

export const EarningsManager: React.FC = () => {
  const { settings, updateSettings, donations, verifyDonation, payments, language, t, showToast } = useApp();

  const [adsensePubId, setAdsensePubId] = useState(settings?.adSlots?.adsensePublisherId || 'ca-pub-9876543210987654');
  const [autoAds, setAutoAds] = useState(settings?.adSlots?.autoAdsEnabled ?? true);
  const [headerAd, setHeaderAd] = useState(settings?.adSlots?.headerAdEnabled ?? true);
  const [sidebarAd, setSidebarAd] = useState(settings?.adSlots?.sidebarAdEnabled ?? true);
  const [inPostAd, setInPostAd] = useState(settings?.adSlots?.inPostAdEnabled ?? true);
  const [footerAd, setFooterAd] = useState(settings?.adSlots?.footerStickyAdEnabled ?? false);

  const [bkash, setBkash] = useState(settings?.donationConfig?.bkashNumber || '01700-000000');
  const [nagad, setNagad] = useState(settings?.donationConfig?.nagadNumber || '01800-000000');
  const [donationTitle, setDonationTitle] = useState(settings?.donationConfig?.title || 'Support our content');
  const [donationDesc, setDonationDesc] = useState(settings?.donationConfig?.description || 'Help keep this blog free and active.');

  const safeDonations = Array.isArray(donations) ? donations : [];
  const totalDonationAmount = safeDonations.reduce((acc, d) => acc + (d?.status === 'completed' || d?.status === 'verified' ? (d.amount || 0) : 0), 0);

  const handleSaveEarnings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      adSlots: {
        adsensePublisherId: adsensePubId,
        autoAdsEnabled: autoAds,
        headerAdEnabled: headerAd,
        sidebarAdEnabled: sidebarAd,
        inPostAdEnabled: inPostAd,
        footerStickyAdEnabled: footerAd
      },
      donationConfig: {
        enabled: true,
        bkashNumber: bkash,
        nagadNumber: nagad,
        title: donationTitle,
        description: donationDesc
      }
    });
    showToast(language === 'bn' ? 'আয় ও মনিটাইজেশন সেটিংস সংরক্ষিত হয়েছে!' : 'Monetization settings saved successfully!');
  };

  return (
    <div id="earnings-manager-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('earnings')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'গুগল অ্যাডসেন্স, মেম্বারশিপ এবং অনুদান কনফিগারেশন' : 'Google AdSense, Sponsor Banners, and Direct Reader Donations'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>AdSense Verified</span>
          </div>
        </div>
      </div>

      {/* Revenue Stats 4-Pack */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold">AdSense Earnings (This Month)</span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$482.50</h3>
          <span className="text-[11px] text-emerald-500 font-bold">+24.8% vs last month</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold">Affiliate Commissions</span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$194.20</h3>
          <span className="text-[11px] text-emerald-500 font-bold">14 conversions</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold">Direct Tips (Bkash/Nagad)</span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">৳ {totalDonationAmount.toLocaleString()}</h3>
          <span className="text-[11px] text-orange-500 font-bold">{safeDonations.length} total contributions</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold">Total Projected 2026</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">$8,250</h3>
          <span className="text-[11px] text-slate-400 font-medium">Auto-payout active</span>
        </div>
      </div>

      {/* Direct Reader Donations Ledger */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'পাঠক অনুদান লেজার (Live Donation Ledger)' : 'Live Reader Donations Ledger'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">{safeDonations.length} টি অনুদান</span>
        </div>

        {safeDonations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">এখনো কোনো অনুদান জমা হয়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">রশিদ নং / আইডি</th>
                  <th className="p-3">দাতার নাম</th>
                  <th className="p-3">পরিমাণ</th>
                  <th className="p-3"> মাধ্যম ও ট্রানজেকশন</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {safeDonations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{don.receiptNumber || don.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{don.donorName}</div>
                      {don.message && <div className="text-[10px] text-slate-400 italic">"{don.message}"</div>}
                    </td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{don.amount} {don.currency}</td>
                    <td className="p-3 font-mono text-[11px]">
                      <span className="uppercase font-bold text-orange-500">{don.paymentMethod}</span> - {don.transactionId}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(don.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        don.status === 'completed' 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {don.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {don.status !== 'completed' && (
                        <button
                          onClick={() => verifyDonation(don.id, 'completed')}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow transition"
                        >
                          Verify & Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveEarnings} className="space-y-6">
        
        {/* Google AdSense Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Google AdSense Publisher Configuration
              </h3>
              <p className="text-xs text-slate-400">গুগল অ্যাডসেন্স অ্যাকাউন্ট ও অটো-অ্যাডস কন্ট্রোল</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                AdSense Publisher ID
              </label>
              <input
                type="text"
                value={adsensePubId}
                onChange={(e) => setAdsensePubId(e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auto Ads</h4>
                  <span className="text-[10px] text-slate-400">গুগল স্বয়ংক্রিয় স্থান নির্বাচন</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoAds}
                  onChange={(e) => setAutoAds(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Header Leaderboard</h4>
                  <span className="text-[10px] text-slate-400">728x90 টপ ব্যানার</span>
                </div>
                <input
                  type="checkbox"
                  checked={headerAd}
                  onChange={(e) => setHeaderAd(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sidebar Rectangle</h4>
                  <span className="text-[10px] text-slate-400">300x250 সাইডবার অ্যাড</span>
                </div>
                <input
                  type="checkbox"
                  checked={sidebarAd}
                  onChange={(e) => setSidebarAd(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">In-Post Ad</h4>
                  <span className="text-[10px] text-slate-400">আর্টিকেলের মাঝখানে</span>
                </div>
                <input
                  type="checkbox"
                  checked={inPostAd}
                  onChange={(e) => setInPostAd(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sticky Footer</h4>
                  <span className="text-[10px] text-slate-400">নিচে স্থায়ী স্টিকি অ্যাড</span>
                </div>
                <input
                  type="checkbox"
                  checked={footerAd}
                  onChange={(e) => setFooterAd(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Donation & Coffee Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'পাঠক অনুদান ও Buy Me a Coffee কনফিগারেশন' : 'Direct Reader Tips & Donations Settings'}
              </h3>
              <p className="text-xs text-slate-400">বিকাশ ও নগদ অ্যাকাউন্টে সরাসরি পাঠকদের থেকে কফি বা অনুদান গ্রহণ করুন।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিকাশ পার্সোনাল মোবাইল নম্বর (bKash)
              </label>
              <input
                type="text"
                value={bkash}
                onChange={(e) => setBkash(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                নগদ পার্সোনাল মোবাইল নম্বর (Nagad)
              </label>
              <input
                type="text"
                value={nagad}
                onChange={(e) => setNagad(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                অনুদান মোডাল শিরোনাম
              </label>
              <input
                type="text"
                value={donationTitle}
                onChange={(e) => setDonationTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                অনুদান মোডাল বিবরণ
              </label>
              <input
                type="text"
                value={donationDesc}
                onChange={(e) => setDonationDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
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
