import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaticPage } from '../../types';
import { 
  Files, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Check, 
  Save, 
  ArrowLeft,
  Eye,
  FileText
} from 'lucide-react';

export const PagesManager: React.FC = () => {
  const { 
    pages, 
    createPage, 
    updatePage, 
    deletePage, 
    setSelectedPageSlug, 
    setViewMode, 
    language, 
    t, 
    showToast 
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Page Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [showInHeader, setShowInHeader] = useState(true);
  const [showInFooter, setShowInFooter] = useState(true);

  const startCreate = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setContent('<p>এখানে পৃষ্ঠার মূল বিষয়বস্তু লিখুন...</p>');
    setIsPublished(true);
    setShowInHeader(true);
    setShowInFooter(true);
    setIsEditing(true);
  };

  const startEdit = (page: StaticPage) => {
    setEditingId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setIsPublished(page.isPublished ?? (page.status === 'published'));
    setShowInHeader(page.showInHeader ?? true);
    setShowInFooter(page.showInFooter ?? true);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      showToast(language === 'bn' ? 'শিরোনাম ও স্লাগ পূরণ করুন' : 'Title and slug required', 'error');
      return;
    }

    const payload = {
      title,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      content,
      isPublished,
      showInHeader,
      showInFooter
    };

    if (editingId) {
      updatePage(editingId, payload);
    } else {
      createPage(payload);
    }

    setIsEditing(false);
  };

  return (
    <div id="pages-manager-view" className="space-y-6">
      
      {!isEditing ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('pages')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'bn' ? 'স্ট্যাটিক ও কাস্টম পেজ তৈরি ও পরিচালনা (About, Contact, Privacy ইত্যাদি)' : 'Manage static pages and custom legal/info pages'}
              </p>
            </div>

            <button
              id="btn-create-new-page"
              onClick={startCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('createPage')}</span>
            </button>
          </div>

          {/* Pages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(pages) ? pages : []).map((page) => (
              <div
                key={page.id}
                id={`page-card-${page.id}`}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">/p/{page.slug}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        page.isPublished
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {page.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <span>{page.showInHeader ? '✓ Header Menu' : '✗ No Header'}</span> •
                    <span>{page.showInFooter ? '✓ Footer Menu' : '✗ No Footer'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedPageSlug(page.slug);
                      setViewMode('page-detail');
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t('viewPage')}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(page)}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Edit / Create Page Form */
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? (language === 'bn' ? 'পেজ সম্পাদনা' : 'Edit Page') : (language === 'bn' ? 'নতুন পেজ তৈরি' : 'Create Page')}
              </h2>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('save')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                পেজের শিরোনাম (Title)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingId) {
                    setSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'));
                  }
                }}
                placeholder="About Us / আমাদের সম্পর্কে"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ইউআরএল স্লাগ (Slug)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about-us"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>
          </div>

          {/* HTML Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              পেজের কন্টেন্ট ও বিবরণ (HTML Content)
            </label>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Placement Options */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded"
              />
              <span>প্রকাশিত (Publish immediately)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showInHeader}
                onChange={(e) => setShowInHeader(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded"
              />
              <span>হেডার মেন্যুতে দেখান</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showInFooter}
                onChange={(e) => setShowInFooter(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded"
              />
              <span>ফুটার মেন্যুতে দেখান</span>
            </label>
          </div>
        </form>
      )}

    </div>
  );
};
