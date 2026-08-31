import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Users, 
  Eye, 
  Clock, 
  Globe, 
  ArrowUpRight,
  Activity
} from 'lucide-react';

export const StatsDashboard: React.FC = () => {
  const { analytics, posts, language, t } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  const safeTrafficHistory = Array.isArray(analytics?.trafficHistory) ? analytics.trafficHistory : [];
  const safeCountries = Array.isArray(analytics?.countries) ? analytics.countries : [];
  const safePosts = Array.isArray(posts) ? posts : [];

  const rawDeviceStats = analytics?.deviceStats || { mobile: 0, desktop: 0, tablet: 0 };
  const totalDeviceHits = (rawDeviceStats.mobile || 0) + (rawDeviceStats.desktop || 0) + (rawDeviceStats.tablet || 0);
  
  const deviceData = totalDeviceHits > 0 ? [
    { 
      name: language === 'bn' ? 'মোবাইল' : 'Mobile', 
      value: Math.round(((rawDeviceStats.mobile || 0) / totalDeviceHits) * 100), 
      color: '#6366f1' 
    },
    { 
      name: language === 'bn' ? 'ডেস্কটপ' : 'Desktop', 
      value: Math.round(((rawDeviceStats.desktop || 0) / totalDeviceHits) * 100), 
      color: '#a855f7' 
    },
    { 
      name: language === 'bn' ? 'ট্যাবলেট' : 'Tablet', 
      value: Math.round(((rawDeviceStats.tablet || 0) / totalDeviceHits) * 100), 
      color: '#38bdf8' 
    }
  ] : [];

  const totalViewsCalculated = (analytics?.totalViews ?? safePosts.reduce((acc, p) => acc + (Number(p.views) || 0), 0)) || 0;
  const totalVisitorsCalculated = analytics?.totalVisitors ?? 0;
  const liveVisitorsCalculated = analytics?.liveVisitors ?? 0;

  return (
    <div id="stats-dashboard-view" className="space-y-6">
      
      {/* Top Header with Live Real-time visitor ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('stats')}
            </h1>
            <span className="ai-pill">Realtime</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'রিয়েল-টাইম ভিজিটর ট্রাফিক ও পারফরম্যান্স মেট্রিক্স' : 'Real-time visitor traffic and content performance metrics'}
          </p>
        </div>

        {/* Live Visitor Heartbeat */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-emerald-500/30 rounded-2xl">
          <span className="pulse" />
          <div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {t('liveVisitors')}
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono leading-none">
              {liveVisitorsCalculated} {language === 'bn' ? 'জন অনলাইনে' : 'Active Now'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Views */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('totalViews')}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalViewsCalculated.toLocaleString()}
            </h3>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'bn' ? 'মোট আর্টিকেল ভিউ' : 'Total article impressions'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        {/* Total Visitors */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('totalVisitors')}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalVisitorsCalculated.toLocaleString()}
            </h3>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'bn' ? 'ইউনিক সেশন ভিজিটর' : 'Unique session visitors'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Read Time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('avgReadTime')}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {analytics?.avgReadingTime || (language === 'bn' ? 'তথ্য সংগৃহীত হয়নি' : 'No data yet')}
            </h3>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'bn' ? 'গড় পাঠ সময়' : 'Session duration'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Bounce Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('bounceRate')}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {analytics?.bounceRate || (language === 'bn' ? 'তথ্য সংগৃহীত হয়নি' : 'No data yet')}
            </h3>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              {language === 'bn' ? 'বাউন্স রেট মেট্রিক' : 'Audience retention'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Traffic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Traffic over time */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'ভিজিটর ও পেজভিউ ট্রেন্ড' : 'Traffic Trend (Views & Visitors)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'দৈনিক ট্রাফিক ইতিহাস ও বিশ্লেষণ' : 'Daily traffic history and analysis'}
              </p>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-lg transition ${timeRange === '7d' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-lg transition ${timeRange === '30d' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                30D
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {safeTrafficHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={safeTrafficHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Line type="monotone" dataKey="views" name="Page Views" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Activity className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'এখনও ট্রাফিক হিস্টোরি রেকর্ড হয়নি' : 'No traffic recorded yet'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'bn' ? 'ভিজিটররা ব্রাউজ করা শুরু করলে লাইভ চার্ট আপডেট হবে' : 'Live chart will populate as visitors browse articles'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart: Device Split */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'ডিভাইস বণ্টন' : 'Device Distribution'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'ভিজিটরদের ডিভাইস ধরন' : 'Visitor device types'}
            </p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center">
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-4">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'এখনও ডিভাইস তথ্য রেকর্ড হয়নি' : 'No device data yet'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {deviceData.length > 0 ? deviceData.map((dev) => (
              <div key={dev.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dev.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{dev.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{dev.value}%</span>
              </div>
            )) : (
              <p className="text-xs text-center text-slate-400 py-1">
                {language === 'bn' ? 'তথ্য নেই' : 'No data'}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Countries & Top Posts Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Geo Distribution Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" />
              <span>{language === 'bn' ? 'দেশভিত্তিক পাঠক' : 'Geographic Audience'}</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{safeCountries.length} Countries</span>
          </div>

          <div className="space-y-3">
            {safeCountries.length > 0 ? (
              safeCountries.map((c) => (
                <div key={c.country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.country}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{(c.visitors || 0).toLocaleString()} ({c.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'এখনও দেশভিত্তিক পাঠক তথ্য রেকর্ড হয়নি' : 'No geographic visitor data recorded yet'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Articles */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {language === 'bn' ? 'সর্বাধিক পঠিত আর্টিকেল' : 'Top Performing Articles'}
          </h3>

          <div className="space-y-3">
            {safePosts.slice(0, 4).map((post, idx) => (
              <div key={post.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{post.title}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{post.categories?.join(', ')}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block">{(post.views || 0).toLocaleString()} views</span>
                  <span className="text-[10px] text-rose-500 font-semibold">{post.likes || 0} likes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
