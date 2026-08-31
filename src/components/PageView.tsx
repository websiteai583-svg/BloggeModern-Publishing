import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { sanitizeHtml } from '../utils/sanitize';

export const PageView: React.FC = () => {
  const { pages, selectedPageSlug, setViewMode, language } = useApp();

  const page = pages.find((p) => p.slug === selectedPageSlug) || pages[0];

  if (!page) return null;

  return (
    <div id="static-page-wrapper" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      
      {/* Navigation Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <button
          onClick={() => setViewMode('reader')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-500 py-1.5 px-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Home'}</span>
        </button>
      </div>

      {/* Main Page Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <header className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {page.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>সর্বশেষ আপডেট: {new Date(page.updatedAt).toLocaleDateString()}</span>
            </div>
          </header>

          <div
            className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
          />
        </div>
      </div>

    </div>
  );
};
