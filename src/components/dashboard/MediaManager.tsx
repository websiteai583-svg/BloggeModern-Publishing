import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaItem } from '../../types';
import { 
  Image as ImageIcon, 
  Upload, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Check, 
  HardDrive, 
  Plus, 
  Search,
  Filter,
  FileUp,
  FolderOpen
} from 'lucide-react';

export const MediaManager: React.FC = () => {
  const { mediaItems, addMediaItem, deleteMediaItem, language, t, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'pdf'>('all');
  const [newUrl, setNewUrl] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeMediaItems = Array.isArray(mediaItems) ? mediaItems : [];

  const filteredMedia = safeMediaItems.filter((item) => {
    if (!item) return false;
    const matchesSearch = (item.fileName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.altText && item.altText.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || item.fileType === filterType || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalBytesUsed = safeMediaItems.reduce((sum, item) => sum + (item?.sizeBytes || 450 * 1024), 0);
  const formattedStorage = (totalBytesUsed / (1024 * 1024)).toFixed(1);

  const handleAddMediaUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const isVideo = newUrl.endsWith('.mp4');
    const isPdf = newUrl.endsWith('.pdf');
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      name: newAlt.trim() || `asset-${Date.now()}`,
      fileName: newAlt.trim() || `asset-${Date.now()}`,
      url: newUrl.trim(),
      type: isVideo ? 'video' : isPdf ? 'document' : 'image',
      fileType: isVideo ? 'video' : isPdf ? 'pdf' : 'image',
      mimeType: isVideo ? 'video/mp4' : isPdf ? 'application/pdf' : 'image/jpeg',
      sizeBytes: 1024 * 450,
      uploadedAt: new Date().toISOString(),
      altText: newAlt.trim() || 'Media Asset'
    };

    addMediaItem(newItem);
    setNewUrl('');
    setNewAlt('');
    showToast(language === 'bn' ? 'মিডিয়া ফাইল আপলোড সফল হয়েছে!' : 'Media asset added successfully!');
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultUrl = e.target?.result as string;
        if (!resultUrl) return;

        const isVideo = file.type.startsWith('video/');
        const isPdf = file.type.includes('pdf');
        const newItem: MediaItem = {
          id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          fileName: file.name,
          url: resultUrl,
          type: isVideo ? 'video' : isPdf ? 'document' : 'image',
          fileType: isVideo ? 'video' : isPdf ? 'pdf' : 'image',
          mimeType: file.type || 'image/jpeg',
          sizeBytes: file.size || 1024 * 300,
          uploadedAt: new Date().toISOString(),
          altText: file.name
        };

        addMediaItem(newItem);
      };
      reader.readAsDataURL(file);
    });

    showToast(language === 'bn' ? `${files.length} টি ফাইল সফলভাবে আপলোড হয়েছে!` : `Uploaded ${files.length} file(s) successfully!`);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast(t('copiedLink'));
  };

  return (
    <div id="media-manager-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('media')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn' ? 'ফাইল স্টোরেজ ও মিডিয়া লাইব্রেরি ব্যবস্থাপনা' : 'Media Storage & Digital Asset Management'}
          </p>
        </div>

        {/* Quota Bar */}
        <div className="w-full sm:w-60 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs mb-1 font-semibold">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" /> Local Storage
            </span>
            <span className="text-slate-500">{formattedStorage} MB / 10 GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="w-[15%] h-full bg-indigo-500 rounded-full" />
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Local preview storage active</span>
        </div>
      </div>

      {/* Drag and Drop File Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]' 
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
          <FileUp className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {language === 'bn' ? 'ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা ব্রাউজ করুন' : 'Drag & drop files here or click to browse'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Supports PNG, JPG, WebP, GIF, MP4, PDF up to 25MB
        </p>
      </div>

      {/* Alternative URL Upload Card */}
      <form onSubmit={handleAddMediaUrl} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {language === 'bn' ? 'অথবা ওয়েব লিংক দিয়ে ছবি/ভিডিও যোগ করুন' : 'Or Import via Direct URL'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="sm:col-span-2 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            placeholder="Alt text / শিরোনাম"
            className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লিংক যোগ করুন' : 'Import URL'}</span>
          </button>
        </div>
      </form>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {['all', 'image', 'video', 'pdf'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition ${
                filterType === type ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'bn' ? 'মিডিয়া খুঁজুন...' : 'Search media...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            id={`media-card-${item.id}`}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:border-indigo-400 transition"
          >
            <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={item.url}
                alt={item.altText || item.fileName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-mono rounded">
                {(item.fileType || 'IMAGE').toUpperCase()}
              </span>
            </div>

            <div className="p-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {item.fileName}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {((item.sizeBytes || 400 * 1024) / 1024).toFixed(0)} KB • {new Date(item.uploadedAt || Date.now()).toLocaleDateString()}
              </p>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleCopyLink(item.url)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-600"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Link</span>
                </button>

                <button
                  onClick={() => deleteMediaItem(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
