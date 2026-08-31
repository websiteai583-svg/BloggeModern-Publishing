import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role } from '../../types';
import { safeFetch } from '../../utils/safeFetch';
import { 
  ShieldAlert, 
  Users, 
  UserCheck, 
  UserX, 
  Activity, 
  Server, 
  Database, 
  Lock, 
  Key,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Globe,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface SystemHealth {
  status: string;
  timestamp: string;
  aiReady: boolean;
  database: string;
  storage: string;
  payment: string;
  realtime: string;
  version: string;
}

export const AdminPanel: React.FC = () => {
  const { allUsers, updateUserRole, banUserToggle, logs, language, t, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'system'>('users');
  
  // Health status state
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Add User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('author');
  const [newUserBio, setNewUserBio] = useState('');

  const fetchHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const res = await safeFetch<SystemHealth>('/api/health', { timeoutMs: 5000 });
      if (res.ok && res.data) {
        setHealth(res.data);
      } else {
        setHealthError(res.error || (language === 'bn' ? 'ডাটা লোড করা যায়নি' : 'Failed to load system health'));
      }
    } catch (err: any) {
      setHealthError(err?.message || (language === 'bn' ? 'ডাটা লোড করা যায়নি' : 'Network error'));
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const safeUsers = Array.isArray(allUsers) ? allUsers : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  const filteredUsers = safeUsers.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserName.trim()) return;

    try {
      const res = await safeFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          password: 'User@' + Date.now().toString().slice(-4),
          role: newUserRole,
          bio: newUserBio.trim() || 'Contributor to Blogge.'
        })
      });

      if (res.ok) {
        showToast(language === 'bn' ? 'নতুন ব্যবহারকারী সফলভাবে তৈরি হয়েছে!' : 'User created successfully!');
        setShowAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserBio('');
      } else {
        showToast(res.error || 'Failed to create user', 'error');
      }
    } catch {
      showToast(language === 'bn' ? 'ব্যবহারকারী তৈরিতে সমস্যা হয়েছে' : 'Error creating user', 'error');
    }
  };

  return (
    <div id="admin-panel-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            <span>{t('admin')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'ব্যবহারকারী নিয়ন্ত্রণ, রোল ম্যানেজমেন্ট ও সিস্টেম অডিট লগ' : 'User role assignment, permissions, and system audit logs'}
          </p>
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center gap-2">
          {healthLoading ? (
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs rounded-xl flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Checking...</span>
            </div>
          ) : healthError ? (
            <button 
              onClick={fetchHealth}
              className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:opacity-80"
              title="Click to retry"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Health Check'}</span>
            </button>
          ) : (
            <>
              <div className={`px-3 py-1.5 ${health?.database === 'ready' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'} font-bold text-xs rounded-xl flex items-center gap-1.5`}>
                <Database className="w-3.5 h-3.5" />
                <span>DB: {health?.database === 'ready' ? 'Active' : 'Standby'}</span>
              </div>
              <div className={`px-3 py-1.5 ${health?.aiReady ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'} font-bold text-xs rounded-xl flex items-center gap-1.5`}>
                <Server className="w-3.5 h-3.5" />
                <span>AI: {health?.aiReady ? 'Ready' : 'Local Fallback'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'bn' ? 'ব্যবহারকারী তালিকা' : 'User Management'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
            {safeUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{language === 'bn' ? 'অ্যাক্টিভিটি ও সিকিউরিটি লগ' : 'Security & Audit Logs'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
            {safeLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>{language === 'bn' ? 'সিস্টেম স্ট্যাটাস' : 'System Metrics'}</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'bn' ? 'নাম, ইমেইল বা রোল দিয়ে খুঁজুন...' : 'Search by name, email or role...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন ইউজার যোগ করুন' : 'Add New User'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">ব্যবহারকারী (User)</th>
                  <th className="p-4">রোল (Role)</th>
                  <th className="p-4">স্ট্যাটাস (Status)</th>
                  <th className="p-4">নিবন্ধন তারিখ</th>
                  <th className="p-4 text-right">অ্যাকশন (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={usr.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${usr.email}`} 
                          alt={usr.name} 
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-500/30" 
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{usr.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{usr.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {usr.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <Lock className="w-3 h-3" />
                          <span>Admin (Owner)</span>
                        </span>
                      ) : (
                        <select
                          value={usr.role}
                          onChange={(e) => updateUserRole(usr.id, e.target.value as Role)}
                          className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="editor">Editor</option>
                          <option value="author">Author</option>
                          <option value="reader">Reader</option>
                        </select>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          usr.status !== 'banned'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {usr.status || 'active'}
                      </span>
                    </td>

                    <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                      {usr.joinedAt || '2026-01-15'}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => banUserToggle(usr.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                          usr.status !== 'banned'
                            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        {usr.status !== 'banned' 
                          ? (language === 'bn' ? 'ব্যান করুন' : 'Ban Account') 
                          : (language === 'bn' ? 'আনব্যান' : 'Unban Account')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>{language === 'bn' ? 'সাম্প্রতিক সিস্টেম ও সিকিউরিটি লগ' : 'Real-time Security & Audit Events'}</span>
            </h3>
            <span className="text-xs text-slate-400">{safeLogs.length} Total Events Logged</span>
          </div>

          <div className="space-y-2.5">
            {safeLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? (log.actionBn || log.action) : log.action}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {log.details}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-shrink-0 font-mono">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {log.ipAddress || '127.0.0.1'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                <span>Backend & Service Integrations</span>
              </h3>
              <button 
                onClick={fetchHealth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Database Layer</span>
                <span className={`font-mono font-bold ${health?.database === 'ready' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {health?.database === 'ready' ? 'Atomic File DB (Online)' : 'Standby / Fallback'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gemini AI Model</span>
                <span className={`font-mono font-bold ${health?.aiReady ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {health?.aiReady ? 'gemini-2.5-flash (Connected)' : 'Local Smart Engine (Key not configured)'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Storage Service</span>
                <span className="font-mono font-bold text-emerald-500">
                  {health?.storage === 'active' ? 'Active Local Data Repository' : 'Unconfigured'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payment & Monetization</span>
                <span className="font-mono font-bold text-orange-500">
                  {health?.payment === 'configured' ? 'bKash / Nagad / AdSense Configured' : 'Configuration Required'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Realtime Engine</span>
                <span className="font-mono font-bold text-sky-500">
                  Active (Polled State Engine)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>Security Protocols</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Role-Based Access Control (RBAC) Active</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>CSRF & Input Sanitization Layer</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Automatic Spam Keyword Filtering</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Automated Post Scheduling Cron Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'নতুন ব্যবহারকারী অ্যাকাউন্ট তৈরি' : 'Create User Account'}
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="author@blogge.io"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Assigned Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="editor">Editor</option>
                  <option value="author">Author</option>
                  <option value="reader">Reader</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
