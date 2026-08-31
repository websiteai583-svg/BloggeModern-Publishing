import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Post, PostStatus } from '../../types';
import { 
  Save, 
  Send, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Eye, 
  Globe, 
  RefreshCw, 
  ArrowLeft,
  Wand2
} from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitize';
import { safeFetch } from '../../utils/safeFetch';

export const PostEditor: React.FC = () => {
  const { 
    posts, 
    createPost, 
    updatePost, 
    editingPostId, 
    setEditingPostId, 
    setDashboardTab, 
    language, 
    t, 
    showToast
  } = useApp();

  const currentPost = Array.isArray(posts) ? posts.find((p) => p?.id === editingPostId) : undefined;

  // Editor Form States
  const [title, setTitle] = useState(currentPost?.title || '');
  const [slug, setSlug] = useState(currentPost?.slug || '');
  const [content, setContent] = useState(currentPost?.content || '');
  const [summary, setSummary] = useState(currentPost?.summary || '');
  const [featuredImage, setFeaturedImage] = useState(currentPost?.featuredImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80');
  const [imageCaption, setImageCaption] = useState(currentPost?.imageCaption || '');
  const [categories, setCategories] = useState<string[]>(currentPost?.categories || ['প্রযুক্তি']);
  const [newCatInput, setNewCatInput] = useState('');
  const [tags, setTags] = useState<string[]>(currentPost?.tags || ['Blogging', 'AI']);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<PostStatus>(currentPost?.status || 'published');
  const [scheduledAt, setScheduledAt] = useState(currentPost?.scheduledAt || '');
  const [isPaywalled, setIsPaywalled] = useState(currentPost?.isPaywalled || false);
  
  // SEO
  const [metaTitle, setMetaTitle] = useState(currentPost?.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(currentPost?.seo?.metaDescription || '');
  const [seoKeywords, setSeoKeywords] = useState<string[]>(currentPost?.seo?.keywords || []);
  
  // Affiliate Links
  const [affiliateLinks, setAffiliateLinks] = useState(currentPost?.affiliateLinks || []);
  const [affTitle, setAffTitle] = useState('');
  const [affUrl, setAffUrl] = useState('');
  const [affCode, setAffCode] = useState('');

  // AI Drawer & State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState<'informative' | 'storytelling' | 'analytical' | 'tutorial'>('informative');
  const [aiLang, setAiLang] = useState<'bn' | 'en'>(language);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isOptimizingSeo, setIsOptimizingSeo] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Auto-save timer
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Auto-generate slug from title if new
  useEffect(() => {
    if (!editingPostId && title && !slug) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated || `post-${Date.now()}`);
    }
  }, [title, editingPostId]);

  // Word count & Reading time calculation
  const wordCount = content.replace(/<[^>]*>?/gm, '').trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  // Auto-save effect every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title.trim() && content.trim()) {
        handleSave(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [title, content, slug, summary, categories, tags, status]);

  const handleSave = (isAuto = false) => {
    if (!title.trim()) {
      if (!isAuto) showToast(language === 'bn' ? 'অনুগ্রহ করে একটি শিরোনাম দিন' : 'Please provide a title', 'error');
      return;
    }

    const postPayload: Partial<Post> = {
      title,
      slug: slug || `post-${Date.now()}`,
      content,
      summary: summary || title,
      featuredImage,
      imageCaption,
      categories,
      tags,
      status,
      scheduledAt,
      isPaywalled,
      readingTimeMinutes: readingTime,
      seo: {
        metaTitle: metaTitle || `${title} | Blogge`,
        metaDescription: metaDescription || summary || title,
        keywords: seoKeywords.length > 0 ? seoKeywords : tags
      },
      affiliateLinks
    };

    if (editingPostId) {
      updatePost(editingPostId, postPayload);
    } else {
      const created = createPost(postPayload);
      setEditingPostId(created.id);
    }

    setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    if (isAuto) {
      showToast(t('autoSaved'), 'info');
    }
  };

  // Rich Formatting Helpers
  const formatText = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertHtml = (htmlString: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, htmlString);
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertImageModal = () => {
    const url = prompt(language === 'bn' ? 'ছবির ইউআরএল (Image URL) দিন:' : 'Enter Image URL:', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000');
    if (url) {
      insertHtml(`<figure class="my-6"><img src="${url}" alt="Blog Image" class="w-full rounded-2xl shadow-md border border-white/10" /><figcaption class="text-center text-xs text-slate-400 mt-2">ছবি ক্যাপশন</figcaption></figure>`);
    }
  };

  const insertVideoModal = () => {
    const url = prompt(language === 'bn' ? 'ইউটিউব বা ভিডিও এম্বেড লিংক দিন:' : 'Enter YouTube or Video URL:', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
    if (url) {
      insertHtml(`<div class="my-6 aspect-video rounded-2xl overflow-hidden shadow-md border border-white/10"><iframe src="${url}" class="w-full h-full" allowfullscreen></iframe></div>`);
    }
  };

  // AI Content Generator Call
  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      showToast(language === 'bn' ? 'অনুগ্রহ করে লেখার বিষয় বা টপিক লিখুন' : 'Please enter a topic', 'error');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await safeFetch.post('/api/gemini/generate-post', {
        topic: aiTopic,
        tone: aiTone,
        language: aiLang,
        keywords: tags
      });
      const data = res.data;
      if (res.ok && data) {
        if (data.title) setTitle(data.title);
        if (data.summary) setSummary(data.summary);
        if (data.content) {
          setContent(data.content);
          if (editorRef.current) {
            editorRef.current.innerHTML = data.content;
          }
        }
        if (data.tags) setTags(data.tags);
        if (data.seo) {
          if (data.seo.metaTitle) setMetaTitle(data.seo.metaTitle);
          if (data.seo.metaDescription) setMetaDescription(data.seo.metaDescription);
          if (data.seo.keywords) setSeoKeywords(data.seo.keywords);
        }
        setIsAiOpen(false);
        showToast(language === 'bn' ? 'এআই দিয়ে পূর্ণাঙ্গ ব্লগ পোস্ট প্রস্তুত করা হয়েছে!' : 'Full blog post generated with AI!');
      } else {
        showToast(res.error || (language === 'bn' ? 'এআই পোস্ট তৈরিতে সমস্যা হয়েছে' : 'Failed to generate post'), 'error');
      }
    } catch (err) {
      showToast(language === 'bn' ? 'এআই পোস্ট তৈরিতে সমস্যা হয়েছে' : 'Failed to generate post', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // AI SEO Optimizer Call
  const handleAiSeoOptimize = async () => {
    setIsOptimizingSeo(true);
    try {
      const res = await safeFetch.post('/api/gemini/seo-suggest', {
        title,
        content,
        language
      });
      const data = res.data;
      if (res.ok && data) {
        if (data.metaTitle) setMetaTitle(data.metaTitle);
        if (data.metaDescription) setMetaDescription(data.metaDescription);
        if (data.keywords) setSeoKeywords(data.keywords);
        showToast(language === 'bn' ? `এসইও অপটিমাইজেশন সম্পন্ন! স্কোর: ${data.seoScore || 95}/100` : `SEO optimized! Score: ${data.seoScore || 95}/100`);
      } else {
        showToast(res.error || (language === 'bn' ? 'এসইও তৈরিতে সমস্যা হয়েছে' : 'Failed to optimize SEO'), 'error');
      }
    } catch (err) {
      showToast(language === 'bn' ? 'এসইও তৈরিতে সমস্যা হয়েছে' : 'Failed to optimize SEO', 'error');
    } finally {
      setIsOptimizingSeo(false);
    }
  };

  // AI Translate Call
  const handleAiTranslate = async () => {
    const targetLang = language === 'bn' ? 'en' : 'bn';
    setIsTranslating(true);
    try {
      const [resTitle, resContent] = await Promise.all([
        safeFetch.post('/api/gemini/translate', { text: title, targetLang }),
        safeFetch.post('/api/gemini/translate', { text: content, targetLang })
      ]);
      const dataTitle = resTitle.data;
      const dataContent = resContent.data;

      if (dataTitle?.translatedText) setTitle(dataTitle.translatedText);
      if (dataContent?.translatedText) {
        setContent(dataContent.translatedText);
        if (editorRef.current) editorRef.current.innerHTML = dataContent.translatedText;
      }
      showToast(language === 'bn' ? 'ইংরেজিতে অনুবাদ সম্পন্ন হয়েছে!' : 'Translated to Bengali successfully!');
    } catch (err) {
      showToast('Translation error', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  // Category tags handlers
  const handleAddCategory = () => {
    if (newCatInput.trim() && !categories.includes(newCatInput.trim())) {
      setCategories([...categories, newCatInput.trim()]);
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleAddAffiliate = () => {
    if (affTitle && affUrl) {
      setAffiliateLinks([...affiliateLinks, { title: affTitle, url: affUrl, discountCode: affCode }]);
      setAffTitle('');
      setAffUrl('');
      setAffCode('');
      showToast(language === 'bn' ? 'অ্যাফিলিয়েট লিংক যুক্ত হয়েছে' : 'Affiliate link added');
    }
  };

  return (
    <div id="post-editor-view" className="space-y-6">
      
      {/* Top Action Header in Frosted Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-posts"
            onClick={() => setDashboardTab('posts')}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">
              {editingPostId ? (language === 'bn' ? 'পোস্ট সম্পাদনা করুন' : 'Edit Blog Post') : (language === 'bn' ? 'নতুন পোস্ট তৈরি করুন' : 'Create New Post')}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{wordCount} শব্দ</span> •
              <span>~{readingTime} {t('minRead')}</span>
              {lastSaved && <span className="text-emerald-400">• {language === 'bn' ? `সেভ: ${lastSaved}` : `Saved at ${lastSaved}`}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          
          {/* AI Assist Drawer Button */}
          <button
            id="btn-open-ai-writer"
            onClick={() => setIsAiOpen(!isAiOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition border border-white/15"
          >
            <Wand2 className="w-4 h-4" />
            <span>{t('aiWritingAssist')}</span>
          </button>

          {/* Preview Modal Button */}
          <button
            id="btn-editor-preview"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel border border-white/10 text-slate-200 hover:text-white hover:border-indigo-400/50 font-semibold text-xs transition"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>{t('preview')}</span>
          </button>

          {/* Save Draft */}
          <button
            id="btn-save-draft"
            onClick={() => {
              setStatus('draft');
              handleSave();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel border border-white/10 text-slate-200 hover:text-white font-semibold text-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>{t('saveDraft')}</span>
          </button>

          {/* Publish / Update Button */}
          <button
            id="btn-publish-post"
            onClick={() => {
              setStatus('published');
              handleSave();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition border border-white/15"
          >
            <Send className="w-4 h-4" />
            <span>{editingPostId ? t('update') : t('publish')}</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Flyout Box */}
      {isAiOpen && (
        <div id="ai-assistant-card" className="p-5 glass-panel text-white rounded-3xl border border-indigo-500/40 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">{t('aiPostGenerator')} (Gemini 2026 Engine)</h3>
                <p className="text-xs text-slate-300">শিরোনাম বা বিষয়ের ওপর ভিত্তি করে পূর্ণাঙ্গ ও এসইও ফ্রেন্ডলি কন্টেন্ট তৈরি করুন।</p>
              </div>
            </div>
            <button onClick={() => setIsAiOpen(false)} className="text-slate-400 hover:text-white text-xs font-semibold">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder={language === 'bn' ? 'কী বিষয়ে লিখতে চান? (যেমন: রিয়্যাক্ট ১৯ ও বাংলা এআই বিপ্লব)' : 'Enter topic (e.g. Next-gen AI Tools in 2026)'}
                className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-slate-400 text-xs focus:outline-none"
              />
            </div>
            <div>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-xs focus:outline-none bg-slate-900"
              >
                <option value="informative">তথ্যবহুল (Informative)</option>
                <option value="storytelling">গল্পের ঢঙে (Storytelling)</option>
                <option value="analytical">বিশ্লেষণধর্মী (Analytical)</option>
                <option value="tutorial">টিউটোরিয়াল (Tutorial)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-trigger-ai-generate"
                onClick={handleAiGenerate}
                disabled={isGeneratingAi}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5 transition border border-white/15"
              >
                {isGeneratingAi ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'জেনারেট করুন' : 'Generate'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAiTranslate}
                disabled={isTranslating}
                title="Auto Translate"
                className="p-2.5 rounded-xl glass-panel hover:bg-white/10 text-white text-xs transition border border-white/10"
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Post Title & Rich Body */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Post Title Input */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-xl">
            <input
              id="post-editor-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('postTitlePlaceholder')}
              className="w-full text-xl sm:text-2xl font-bold bg-transparent text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* WYSIWYG Formatting Toolbar */}
          <div className="glass-panel p-2 rounded-2xl border border-white/10 shadow-xl flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => formatText('bold')}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              type="button"
              onClick={() => formatText('formatBlock', '<h2>')}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('formatBlock', '<h3>')}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              type="button"
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatText('insertOrderedList')}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<blockquote class="border-l-4 border-indigo-500 pl-4 py-2 italic my-4 text-slate-200 bg-white/5 rounded-r">উদ্ধৃতি এখানে লিখুন...</blockquote>')}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<pre class="bg-slate-950 text-indigo-300 p-4 rounded-xl font-mono text-sm my-4 overflow-x-auto border border-white/10"><code>// কোড লিখুন\nconsole.log("Hello Blogge!");</code></pre>')}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              type="button"
              onClick={insertImageModal}
              className="p-2 rounded-lg hover:bg-white/10 text-indigo-400"
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertVideoModal}
              className="p-2 rounded-lg hover:bg-white/10 text-purple-400"
              title="Embed Video"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          {/* WYSIWYG Editable Content Canvas in Frosted Glass */}
          <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[450px] p-6 focus-within:ring-2 focus-within:ring-indigo-500/40">
            <div
              id="wysiwyg-content-canvas"
              ref={editorRef}
              contentEditable
              onInput={(e) => setContent(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: content }}
              className="prose prose-invert max-w-none min-h-[400px] focus:outline-none text-slate-200 text-base leading-relaxed"
            />
          </div>

          {/* Short Summary Field */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {language === 'bn' ? 'পোস্টের সংক্ষিপ্ত সারসংক্ষেপ (Summary / Excerpt)' : 'Short Summary / Excerpt'}
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={language === 'bn' ? 'পাঠকদের জন্য ২ লাইনের আকর্ষণীয় সারসংক্ষেপ লিখুন...' : 'Write 2-line compelling excerpt...'}
              className="w-full p-3 rounded-xl glass-input text-white text-xs focus:outline-none"
            />
          </div>

        </div>

        {/* Right Sidebar: Post Settings, SEO, Categories, Featured Image */}
        <div className="space-y-4">
          
          {/* Post Configuration Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2">
              {t('postSettings')}
            </h3>

            {/* Status & Schedule */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('status')}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs focus:outline-none bg-slate-900"
              >
                <option value="published">{language === 'bn' ? 'প্রকাশিত (Published)' : 'Published'}</option>
                <option value="draft">{language === 'bn' ? 'ড্রাফট (Draft)' : 'Draft'}</option>
                <option value="scheduled">{language === 'bn' ? 'ভবিষ্যৎ শিডিউল (Scheduled)' : 'Scheduled'}</option>
                <option value="trash">{language === 'bn' ? 'ট্র্যাশ (Trash)' : 'Trash'}</option>
              </select>
            </div>

            {status === 'scheduled' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'প্রকাশের তারিখ ও সময়' : 'Publish Date & Time'}
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                />
              </div>
            )}

            {/* Custom Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('customSlug')}
              </label>
              <div className="flex items-center text-xs bg-white/5 rounded-xl border border-white/10 overflow-hidden px-3 py-1.5">
                <span className="text-slate-400 select-none">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('featuredImage')}
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs mb-2 focus:outline-none"
              />
              {featuredImage && (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-white/10">
                  <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('categorySelect')}
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-500/30"
                  >
                    {cat}
                    <button type="button" onClick={() => handleRemoveCategory(cat)} className="hover:text-rose-400">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder={language === 'bn' ? 'নতুন ক্যাটাগরি...' : 'New category...'}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('tagsInput')}
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tg) => (
                  <span key={tg} className="text-[11px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-lg">
                    #{tg}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="AI, Tech, Tutorial"
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Premium Paywall Toggle */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  {language === 'bn' ? 'পেইড / মেম্বার্স ওনলি' : 'Members Only Post'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === 'bn' ? 'শুধুমাত্র সাবস্ক্রাইবড ইউজাররা পড়তে পারবে' : 'Requires premium subscription'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isPaywalled}
                onChange={(e) => setIsPaywalled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

          </div>

          {/* SEO & Meta Data Card with AI Optimizer */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('seoSection')}
              </h3>
              <button
                type="button"
                onClick={handleAiSeoOptimize}
                disabled={isOptimizingSeo}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:underline"
              >
                {isOptimizingSeo ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>{language === 'bn' ? 'এআই এসইও অপটিমাইজ' : 'AI Optimize'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('metaTitle')} ({metaTitle.length}/60)
              </label>
              <input
                type="text"
                maxLength={60}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Google Search title..."
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('metaDesc')} ({metaDescription.length}/160)
              </label>
              <textarea
                rows={2}
                maxLength={160}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Google Search snippet..."
                className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
              />
            </div>

            {/* Google SERP Preview */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Google SERP Preview</span>
              <p className="text-indigo-400 font-medium truncate">{metaTitle || title || 'Post Title'}</p>
              <p className="text-emerald-400 text-[10px] font-mono truncate">blogge.io/blog/{slug || 'post-slug'}</p>
              <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{metaDescription || summary || 'Post search description preview'}</p>
            </div>
          </div>

          {/* Affiliate Links Box */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'bn' ? 'অ্যাফিলিয়েট ও স্পনসর লিংক' : 'Affiliate / Sponsor Links'}
            </h3>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder={language === 'bn' ? 'প্রোডাক্টের নাম (যেমন: Hostinger)' : 'Product Name'}
                value={affTitle}
                onChange={(e) => setAffTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white"
              />
              <input
                type="text"
                placeholder="https://affiliate.link/xyz"
                value={affUrl}
                onChange={(e) => setAffUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'কুপন কোড (ঐচ্ছিক)' : 'Promo code (optional)'}
                  value={affCode}
                  onChange={(e) => setAffCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input text-white"
                />
                <button
                  type="button"
                  onClick={handleAddAffiliate}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                >
                  {language === 'bn' ? 'যুক্ত করুন' : 'Add'}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Full Post Preview Modal */}
      {isPreviewOpen && (
        <div id="post-preview-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl shadow-2xl border border-white/20 overflow-y-auto p-6 sm:p-10 text-white">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="sticky top-0 float-right px-3 py-1.5 glass-panel text-white text-xs font-bold rounded-full shadow-lg border border-white/20 hover:bg-white/20"
            >
              ✕ {language === 'bn' ? 'বন্ধ করুন' : 'Close Preview'}
            </button>
            <div className="clear-both">
              <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-lg mb-3">
                {categories.join(', ')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
                {title || 'Untitled Post'}
              </h1>
              {featuredImage && (
                <img src={featuredImage} alt={title} className="w-full rounded-2xl aspect-video object-cover mb-6 shadow-xl border border-white/10" />
              )}
              <div 
                className="prose prose-invert max-w-none text-slate-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
