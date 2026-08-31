import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutWidget } from '../../types';
import { 
  Plus, 
  GripVertical, 
  Eye, 
  EyeOff, 
  Trash2, 
  Save, 
  Sparkles, 
  Sliders,
  Check,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Edit2,
  Code,
  Smartphone,
  Tablet,
  Monitor,
  X,
  Layers,
  FileText
} from 'lucide-react';

export const LayoutBuilder: React.FC = () => {
  const { 
    layoutWidgets, 
    updateWidget, 
    updateWidgetOrder, 
    toggleWidgetVisibility, 
    addWidget, 
    deleteWidget, 
    resetLayout, 
    language, 
    t, 
    showToast 
  } = useApp();

  const [activeSection, setActiveSection] = useState<'all' | 'header' | 'hero' | 'sidebar' | 'content_top' | 'content_bottom' | 'footer'>('all');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Add Gadget Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<LayoutWidget['type']>('custom_html');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetSection, setNewWidgetSection] = useState<LayoutWidget['section']>('sidebar');
  const [newWidgetHtml, setNewWidgetHtml] = useState('');

  // Edit Gadget Modal State
  const [editingWidget, setEditingWidget] = useState<LayoutWidget | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editHtml, setEditHtml] = useState('');

  const safeLayoutWidgets = Array.isArray(layoutWidgets) ? layoutWidgets : [];

  const widgetTemplates = [
    { type: 'featured_slider', title: 'ফিচার্ড পোস্ট স্লাইডার (Featured Slider)', section: 'hero', desc: 'টপ স্টোরি এবং ট্রেন্ডিং আর্টিকেলের আকর্ষণীয় স্লাইডার' },
    { type: 'popular_posts', title: 'জনপ্রিয় পোস্টসমূহ (Popular Posts)', section: 'sidebar', desc: 'সর্বাধিক পঠিত ও লাইক পাওয়া পোস্ট তালিকা' },
    { type: 'categories', title: 'ক্যাটাগরি তালিকা (Categories)', section: 'sidebar', desc: 'ব্লগের সকল বিষয়ের কাউন্টসহ তালিকা' },
    { type: 'newsletter', title: 'নিউজলেটার বক্স (Newsletter)', section: 'sidebar', desc: 'পাঠকদের ইমেইল সাবস্ক্রিপশন বক্স' },
    { type: 'author_bio', title: 'লেখক পরিচিতি (Author Bio)', section: 'sidebar', desc: 'অ্যাডমিন/লেখকের প্রোফাইল ও সোশ্যাল লিঙ্ক' },
    { type: 'adsense_banner', title: 'গুগল অ্যাডসেন্স ব্যানার (AdSense Banner)', section: 'content_top', desc: 'রেসপন্সিভ ব্যানার অ্যাড ও স্পন্সর স্লট' },
    { type: 'social_follow', title: 'সোশ্যাল মিডিয়া ফলো (Social Links)', section: 'sidebar', desc: 'ফেসবুক, টুইটার, ইউটিউব কানেকশন' },
    { type: 'custom_html', title: 'কাস্টম HTML / জাভাস্ক্রিপ্ট (Custom HTML)', section: 'sidebar', desc: 'যেকোনো থার্ড-পার্টি উইজেট, কোড বা এম্বেড' }
  ];

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...safeLayoutWidgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Recalculate order
    const updated = list.map((w, idx) => ({ ...w, order: idx + 1 }));
    updateWidgetOrder(updated);
  };

  const handleAddGadget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle.trim()) return;

    addWidget({
      title: newWidgetTitle.trim(),
      type: newWidgetType,
      section: newWidgetSection,
      location: newWidgetSection === 'header' ? 'header' : newWidgetSection === 'footer' ? 'footer' : 'sidebar',
      order: safeLayoutWidgets.length + 1,
      isEnabled: true,
      enabled: true,
      settings: {
        customHtml: newWidgetHtml
      }
    });

    setNewWidgetTitle('');
    setNewWidgetHtml('');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWidget || !editTitle.trim()) return;

    updateWidget(editingWidget.id, {
      title: editTitle.trim(),
      settings: {
        ...(editingWidget.settings || {}),
        customHtml: editHtml
      }
    });

    setEditingWidget(null);
    showToast(language === 'bn' ? 'গ্যাজেট আপডেট হয়েছে!' : 'Gadget updated successfully!');
  };

  const filteredWidgets = safeLayoutWidgets.filter(w => {
    if (!w) return false;
    if (activeSection === 'all') return true;
    return w.section === activeSection || (activeSection === 'sidebar' && w.location === 'sidebar');
  });

  return (
    <div id="layout-builder-view" className="space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('layout')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'গুগল ব্লগার স্টাইলে উইজেট, গ্যাজেট ও সেকশন ড্র্যাগ-অ্যান্ড-ড্রপ সাজান' : 'Visual Google Blogger-style gadget and section layout organizer'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'গ্যাজেট যোগ করুন' : 'Add Gadget'}</span>
          </button>

          <button
            onClick={resetLayout}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
            title="Reset to Default"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Section Selector & Device Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Sections Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: language === 'bn' ? 'সকল গ্যাজেট' : 'All Gadgets' },
            { id: 'header', label: language === 'bn' ? 'হেডার' : 'Header' },
            { id: 'hero', label: language === 'bn' ? 'হিরো/স্লাইডার' : 'Hero' },
            { id: 'sidebar', label: language === 'bn' ? 'সাইডবার' : 'Sidebar' },
            { id: 'footer', label: language === 'bn' ? 'ফুটার' : 'Footer' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeSection === tab.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Device View Indicator */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`p-1.5 rounded-lg transition ${previewDevice === 'desktop' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            title="Desktop Layout"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPreviewDevice('tablet')}
            className={`p-1.5 rounded-lg transition ${previewDevice === 'tablet' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            title="Tablet Layout"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`p-1.5 rounded-lg transition ${previewDevice === 'mobile' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            title="Mobile Layout"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Blogger Grid Canvas */}
      <div className={`space-y-4 mx-auto transition-all ${
        previewDevice === 'mobile' ? 'max-w-md' : previewDevice === 'tablet' ? 'max-w-2xl' : 'w-full'
      }`}>
        
        {/* Header Block */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-900/60 text-center">
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
            [HEADER & NAVIGATION BAR]
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">সাইট লোগো, শিরোনাম, ডার্ক মোড ও সার্চবার</p>
        </div>

        {/* Top Ad Slot Banner */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-center flex items-center justify-between px-6">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            [TOP LEADERBOARD AD: 728x90]
          </span>
          <span className="text-[10px] bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-mono">
            Auto-Responsive
          </span>
        </div>

        {/* Layout Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main Blog Post Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  [MAIN BLOG POSTS BODY]
                </span>
                <span className="text-[10px] text-slate-400">Core Content Area</span>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p>ফিচার্ড পোস্ট ক্যারোসেল, আর্টিকেলের গ্রিড, পেজিনেশন ও ক্যাটাগরি ফিল্টার স্বয়ংক্রিয়ভাবে রেন্ডার হয়।</p>
              </div>
            </div>
          </div>

          {/* Sidebar Gadgets List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('sidebarGadgets')}
              </span>
              <span className="text-[10px] text-orange-500 font-semibold">{filteredWidgets.length} গ্যাজেট</span>
            </div>

            {filteredWidgets.length === 0 ? (
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                এই সেকশনে কোনো গ্যাজেট নেই।
              </div>
            ) : (
              filteredWidgets.map((widget, index) => {
                const isEnabled = widget.isEnabled !== undefined ? widget.isEnabled : widget.enabled;
                return (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === filteredWidgets.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {widget.title}
                          {!isEnabled && (
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                              Hidden
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {widget.type} • {widget.section || widget.location || 'sidebar'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingWidget(widget);
                          setEditTitle(widget.title);
                          setEditHtml(widget.settings?.customHtml || '');
                        }}
                        className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit Gadget"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isEnabled
                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                        }`}
                        title={isEnabled ? 'Hide' : 'Show'}
                      >
                        {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => deleteWidget(widget.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                        title="Delete Gadget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer Columns Block */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            [FOOTER MULTI-COLUMN WIDGETS]
          </span>
          <p className="text-xs text-slate-400 mt-0.5">নিউজলেটার, সোশ্যাল ফলো আইকন, ফুটার মেন্যু ও কপিরাইট</p>
        </div>

      </div>

      {/* Add Gadget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'bn' ? 'নতুন গ্যাজেট নির্বাচন করুন' : 'Add New Gadget'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGadget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'bn' ? 'গ্যাজেটের ধরন (Template)' : 'Gadget Template'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {widgetTemplates.map(tpl => (
                    <button
                      type="button"
                      key={tpl.type}
                      onClick={() => {
                        setNewWidgetType(tpl.type as any);
                        setNewWidgetTitle(tpl.title.split(' (')[0]);
                        setNewWidgetSection(tpl.section as any);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition text-xs ${
                        newWidgetType === tpl.type
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <p className="font-semibold">{tpl.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'গ্যাজেটের শিরোনাম' : 'Gadget Title'}
                </label>
                <input
                  type="text"
                  value={newWidgetTitle}
                  onChange={(e) => setNewWidgetTitle(e.target.value)}
                  placeholder="e.g., গুরুত্বপূর্ণ পোস্টসমূহ"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'লেআউট সেকশন' : 'Layout Section'}
                </label>
                <select
                  value={newWidgetSection}
                  onChange={(e) => setNewWidgetSection(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="sidebar">Sidebar (ডানপাশের সাইডবার)</option>
                  <option value="hero">Hero (টপ ক্যারোসেল সেকশন)</option>
                  <option value="content_top">Content Top (পোস্টের উপরে)</option>
                  <option value="content_bottom">Content Bottom (পোস্টের নিচে)</option>
                  <option value="footer">Footer (ফুটার কলাম)</option>
                </select>
              </div>

              {newWidgetType === 'custom_html' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'কাস্টম HTML / এম্বেড কোড' : 'Custom HTML / Embed Code'}
                  </label>
                  <textarea
                    value={newWidgetHtml}
                    onChange={(e) => setNewWidgetHtml(e.target.value)}
                    rows={3}
                    placeholder="<div>Custom content or widget code</div>"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/25 transition"
                >
                  {language === 'bn' ? 'যুক্ত করুন' : 'Add Gadget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Gadget Modal */}
      {editingWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'bn' ? 'গ্যাজেট কনফিগার করুন' : 'Configure Gadget'}
                </h3>
              </div>
              <button
                onClick={() => setEditingWidget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'bn' ? 'শিরোনাম' : 'Title'}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {editingWidget.type === 'custom_html' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'bn' ? 'HTML / স্ক্রিপ্ট কোড' : 'HTML / Script Content'}
                  </label>
                  <textarea
                    value={editHtml}
                    onChange={(e) => setEditHtml(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingWidget(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/25 transition"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
