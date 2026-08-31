import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Wand2, 
  Globe, 
  Search, 
  RefreshCw, 
  Check, 
  ArrowRight, 
  Copy, 
  FileText,
  Type,
  FileEdit,
  AlignLeft,
  CheckCheck,
  Lightbulb,
  HelpCircle,
  Share2,
  Sliders,
  Send,
  Download
} from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitize';
import { safeFetch } from '../../utils/safeFetch';

export const AiStudio: React.FC = () => {
  const { createPost, setEditingPostId, setDashboardTab, language, t, showToast } = useApp();

  const [activeTool, setActiveTool] = useState<
    | 'writer'
    | 'seo'
    | 'translator'
    | 'titles'
    | 'meta'
    | 'rewrite'
    | 'summarizer'
    | 'grammar'
    | 'ideas'
    | 'faq'
    | 'social'
  >('writer');
  
  const [loading, setLoading] = useState(false);

  // Tool 1: Writer
  const [topic, setTopic] = useState('২০২৬ সালে কৃত্রিম বুদ্ধিমত্তা ও বাংলা কনটেন্ট ক্রিয়েশন');
  const [tone, setTone] = useState<'informative' | 'storytelling' | 'analytical' | 'tutorial'>('informative');
  const [targetLength, setTargetLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generatedPost, setGeneratedPost] = useState<any>(null);

  // Tool 2: SEO
  const [seoTitle, setSeoTitle] = useState('সেরা ১০টি এআই টুল যা আপনার কাজ সহজ করবে');
  const [seoContent, setSeoContent] = useState('কৃত্রিম বুদ্ধিমত্তা বর্তমানে আমাদের দৈনন্দিন জীবনের অন্যতম গুরুত্বপূর্ণ অংশ।');
  const [seoResult, setSeoResult] = useState<any>(null);

  // Tool 3: Translator
  const [transInput, setTransInput] = useState('Welcome to the next generation Blogger platform with Gemini AI.');
  const [transOutput, setTransOutput] = useState('');
  const [transTarget, setTransTarget] = useState<'bn' | 'en'>('bn');

  // Tool 4: Title Generator
  const [titleTopic, setTitleTopic] = useState('ওয়েব ডেভেলপমেন্টের আধুনিক টেকনোলজি');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  // Tool 5: Meta Description Generator
  const [metaInput, setMetaInput] = useState('React 19 এবং ক্লাউড কম্পিউটিং নিয়ে একটি পূর্ণাঙ্গ টিউটোরিয়াল আর্টিকেল');
  const [generatedMeta, setGeneratedMeta] = useState('');

  // Tool 6: Rewrite
  const [rewriteInput, setRewriteInput] = useState('বর্তমানে ইন্টারনেটে প্রচুর কন্টেন্ট রয়েছে যা মানুষের খুব একটা কাজে আসে না। তাই ভালো কন্টেন্ট তৈরি করা দরকার।');
  const [rewrittenText, setRewrittenText] = useState('');

  // Tool 7: Summarizer
  const [summaryInput, setSummaryInput] = useState('২০২৬ সালে কৃত্রিম বুদ্ধিমত্তা (AI) এখন আর কেবল ভবিষ্যতের কল্পনা নয়, বরং বর্তমান ডিজিটাল দুনিয়ার সবচেয়ে শক্তিশালী ইঞ্জিন। এলএলএম ও জেনারেটিভ এআই কন্টেন্ট ক্রিয়েশনকে কয়েক গুণ দ্রুত ও নিখুঁত করে তুলেছে। বাংলা ভাষায় এর বিকাশ ক্রিয়েটরদের জন্য তৈরি করেছে নতুন সম্ভাবনার দুয়ার।');
  const [summaryResult, setSummaryResult] = useState<{ summary: string; bulletPoints: string[] } | null>(null);

  // Tool 8: Grammar Fixer
  const [grammarInput, setGrammarInput] = useState('আমি কালকে স্কুলে গিয়াছিলাম এবং অনেক কিছু শিখচি।');
  const [grammarResult, setGrammarResult] = useState<any>(null);

  // Tool 9: Content Ideas
  const [ideaTopic, setIdeaTopic] = useState('প্রযুক্তি ও ফ্রিল্যান্সিং');
  const [generatedIdeas, setGeneratedIdeas] = useState<Array<{ title: string; description: string }>>([]);

  // Tool 10: FAQ Generator
  const [faqTopic, setFaqTopic] = useState('ব্লগার মনিটাইজেশন ও গুগল অ্যাডসেন্স');
  const [generatedFaqs, setGeneratedFaqs] = useState<Array<{ q: string; a: string }>>([]);

  // Tool 11: Social Caption Generator
  const [socialTopic, setSocialTopic] = useState('নতুন ব্লগ পোস্ট: ২০২৬ সালের সেরা প্রোগ্রামিং ভাষা');
  const [generatedCaptions, setGeneratedCaptions] = useState<Array<{ platform: string; text: string; hashtags: string }>>([]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(language === 'bn' ? 'ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Copied to clipboard!');
  };

  // Generic AI tool caller
  const callAiTool = async (toolType: string, input: string, options = {}) => {
    setLoading(true);
    try {
      const res = await safeFetch.post('/api/gemini/ai-tools', {
        toolType,
        input,
        options: { ...options, language }
      });
      return res.data;
    } catch (err) {
      showToast('AI request failed', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Action Triggers
  const handleGeneratePost = async () => {
    setLoading(true);
    try {
      const res = await safeFetch.post('/api/gemini/generate-post', {
        topic,
        tone,
        language,
        targetLength
      });
      if (res.ok && res.data) {
        setGeneratedPost(res.data);
        showToast(language === 'bn' ? 'এআই পোস্ট সফলভাবে তৈরি হয়েছে!' : 'AI post generated!');
      } else {
        showToast(res.error || 'Generation failed', 'error');
      }
    } catch {
      showToast('Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSeo = async () => {
    setLoading(true);
    try {
      const res = await safeFetch.post('/api/gemini/seo-suggest', {
        title: seoTitle,
        content: seoContent,
        language
      });
      if (res.ok && res.data) {
        setSeoResult(res.data);
        showToast('SEO Audit completed!');
      } else {
        showToast(res.error || 'SEO analysis failed', 'error');
      }
    } catch {
      showToast('SEO analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const res = await safeFetch.post('/api/gemini/translate', {
        text: transInput,
        targetLang: transTarget
      });
      if (res.ok && res.data?.translatedText) {
        setTransOutput(res.data.translatedText);
        showToast('Translated successfully!');
      } else {
        showToast(res.error || 'Translation error', 'error');
      }
    } catch {
      showToast('Translation error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTitles = async () => {
    const data = await callAiTool('title-generator', titleTopic);
    if (data?.titles) setGeneratedTitles(data.titles);
  };

  const handleGenerateMeta = async () => {
    const data = await callAiTool('meta-description', metaInput);
    if (data?.metaDescription) setGeneratedMeta(data.metaDescription);
  };

  const handleRewrite = async () => {
    const data = await callAiTool('rewrite', rewriteInput);
    if (data?.rewritten) setRewrittenText(data.rewritten);
  };

  const handleSummarize = async () => {
    const data = await callAiTool('summarizer', summaryInput);
    if (data) setSummaryResult(data);
  };

  const handleFixGrammar = async () => {
    const data = await callAiTool('grammar-fixer', grammarInput);
    if (data) setGrammarResult(data);
  };

  const handleGenerateIdeas = async () => {
    const data = await callAiTool('content-ideas', ideaTopic);
    if (data?.ideas) setGeneratedIdeas(data.ideas);
  };

  const handleGenerateFaqs = async () => {
    const data = await callAiTool('faq-generator', faqTopic);
    if (data?.faqs) setGeneratedFaqs(data.faqs);
  };

  const handleGenerateSocial = async () => {
    const data = await callAiTool('social-caption', socialTopic);
    if (data?.captions) setGeneratedCaptions(data.captions);
  };

  const toolsList = [
    { id: 'writer', icon: Wand2, title: language === 'bn' ? 'এআই আর্টিকেল রাইটার' : 'Blog Post Writer' },
    { id: 'seo', icon: Search, title: language === 'bn' ? 'এসইও অডিটর' : 'SEO Analyzer' },
    { id: 'translator', icon: Globe, title: language === 'bn' ? 'দ্বিভাষিক অনুবাদক' : 'Bilingual Translator' },
    { id: 'titles', icon: Type, title: language === 'bn' ? 'টাইটেল জেনারেটর' : 'Title Generator' },
    { id: 'meta', icon: FileText, title: language === 'bn' ? 'মেটা ডেসক্রিপশন' : 'Meta Description' },
    { id: 'rewrite', icon: FileEdit, title: language === 'bn' ? 'কন্টেন্ট রি-রাইট' : 'Rewrite / Polish' },
    { id: 'summarizer', icon: AlignLeft, title: language === 'bn' ? 'আর্টিকেল সামারি' : 'Article Summarizer' },
    { id: 'grammar', icon: CheckCheck, title: language === 'bn' ? 'ব্যাকরণ ও বানান' : 'Grammar & Style' },
    { id: 'ideas', icon: Lightbulb, title: language === 'bn' ? 'টপিক ও আইডিয়া' : 'Content Ideas' },
    { id: 'faq', icon: HelpCircle, title: language === 'bn' ? 'FAQ প্রশ্নোত্তর' : 'FAQ Generator' },
    { id: 'social', icon: Share2, title: language === 'bn' ? 'সোশ্যাল ক্যাপশন' : 'Social Captions' }
  ];

  return (
    <div id="ai-studio-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-orange-500/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('aiStudio')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'bn' ? '১১টি অত্যাধুনিক জেমিনি এআই টুলস — বাংলা ও ইংরেজি কন্টেন্ট অটোমেশন' : '11 Next-Gen Gemini AI Studio Publishing & Optimization Tools'}
            </p>
          </div>
        </div>
      </div>

      {/* 11-Tool Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {toolsList.map(t => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Active Tool Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">

        {/* TOOL 1: BLOG POST WRITER */}
        {activeTool === 'writer' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'এআই ব্লগ পোস্ট ক্রিয়েটর (AI Blog Writer)' : 'AI Blog Post Generator'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">প্রম্পট দিন এবং সম্পূর্ণ গবেষণাভিত্তিক ও এসইও অপটিমাইজড আর্টিকেল জেনারেট করুন।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'আর্টিকেলের বিষয় বা শিরোনাম' : 'Article Topic / Keyword'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., ২০২৬ সালের সেরা ওয়েব ফ্রেমওয়ার্ক"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'লেখার টোন (Tone)' : 'Tone of Voice'}
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="informative">তথ্যবহুল ও প্রাঞ্জল (Informative)</option>
                  <option value="storytelling">গল্পের ঢঙে (Storytelling)</option>
                  <option value="analytical">বিশ্লেষণধর্মী (Analytical)</option>
                  <option value="tutorial">টিউটোরিয়াল বা গাইড (Tutorial)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGeneratePost}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'এআই আর্টিকেল তৈরি করছে...' : 'পূর্ণাঙ্গ আর্টিকেল তৈরি করুন (Generate Full Article)'}</span>
            </button>

            {generatedPost && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{generatedPost.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedPost.content)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                      title="Copy HTML"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const newPost = createPost({
                          title: generatedPost.title,
                          content: generatedPost.content,
                          summary: generatedPost.summary,
                          tags: generatedPost.tags || ['AI', 'Tech'],
                          readingTimeMinutes: generatedPost.readingTimeMinutes || 4,
                          seo: generatedPost.seo
                        });
                        setEditingPostId(newPost.id);
                        setDashboardTab('editor');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow"
                    >
                      <span>পোস্ট এডিটরে খুলুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(generatedPost.content) }}
                />
              </div>
            )}
          </div>
        )}

        {/* TOOL 2: SEO ANALYZER */}
        {activeTool === 'seo' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'এআই এসইও অডিটর ও মেটা ট্যাগ অপ্টিমাইজার' : 'AI SEO Audit & Optimizer'}
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">আর্টিকেলের শিরোনাম</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">কন্টেন্ট স্নিপেট</label>
                <textarea
                  value={seoContent}
                  onChange={(e) => setSeoContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleAnalyzeSeo}
                disabled={loading}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow"
              >
                {loading ? 'অডিট হচ্ছে...' : 'এসইও স্কোর ও মেটা ট্যাগ জেনারেট করুন'}
              </button>
            </div>

            {seoResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-emerald-500 text-white font-black text-lg rounded-xl shadow">
                    {seoResult.seoScore || 94}/100
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">সার্চ ইঞ্জিন স্কোর</h4>
                    <p className="text-[10px] text-slate-400">গুগল ও বিং সার্চের জন্য অত্যন্ত উপযোগী</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p><strong>প্রস্তাবিত মেটা টাইটেল:</strong> {seoResult.metaTitle}</p>
                  <p><strong>প্রস্তাবিত মেটা ডেসক্রিপশন:</strong> {seoResult.metaDescription}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {seoResult.keywords?.map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 text-[10px] font-mono rounded">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 3: TRANSLATOR */}
        {activeTool === 'translator' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'দ্বিভাষিক প্রাঞ্জল অনুবাদক (Bangla & English)' : 'Bilingual Translator'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">মূল টেক্সট</label>
                <textarea
                  value={transInput}
                  onChange={(e) => setTransInput(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">অনুবাদ আউটপুট</label>
                  {transOutput && (
                    <button
                      onClick={() => copyToClipboard(transOutput)}
                      className="text-[10px] text-orange-500 font-bold hover:underline"
                    >
                      কপি করুন
                    </button>
                  )}
                </div>
                <div className="w-full h-36 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white overflow-y-auto font-medium">
                  {transOutput || 'অনুবাদ দেখতে বাটনে চাপুন...'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={transTarget}
                onChange={(e) => setTransTarget(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="bn">Translate to বাংলা</option>
                <option value="en">Translate to English</option>
              </select>

              <button
                onClick={handleTranslate}
                disabled={loading}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow"
              >
                {loading ? 'অনুবাদ হচ্ছে...' : 'অনুবাদ করুন (Translate)'}
              </button>
            </div>
          </div>
        )}

        {/* TOOL 4: TITLES */}
        {activeTool === 'titles' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Type className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'হাই-সিটিআর টাইটেল জেনারেটর' : 'High CTR Title Generator'}
              </h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={titleTopic}
                onChange={(e) => setTitleTopic(e.target.value)}
                placeholder="বিষয় লিখুন..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button
                onClick={handleGenerateTitles}
                disabled={loading}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
              >
                {loading ? 'জেনারেট হচ্ছে...' : 'টাইটেল খুঁজুন'}
              </button>
            </div>

            {generatedTitles.length > 0 && (
              <div className="space-y-2">
                {generatedTitles.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                    <span>{t}</span>
                    <button onClick={() => copyToClipboard(t)} className="p-1 text-slate-400 hover:text-orange-500">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOOL 5: META DESCRIPTION */}
        {activeTool === 'meta' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'এসইও মেটা ডেসক্রিপশন জেনারেটর' : 'Meta Description Generator'}
              </h2>
            </div>
            <textarea
              value={metaInput}
              onChange={(e) => setMetaInput(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
            <button
              onClick={handleGenerateMeta}
              disabled={loading}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              {loading ? 'জেনারেট হচ্ছে...' : 'মেটা ডেসক্রিপশন তৈরি করুন'}
            </button>
            {generatedMeta && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs flex justify-between">
                <p className="text-emerald-900 dark:text-emerald-200 font-medium">{generatedMeta}</p>
                <button onClick={() => copyToClipboard(generatedMeta)} className="text-emerald-600 font-bold ml-2">কপি</button>
              </div>
            )}
          </div>
        )}

        {/* TOOL 6: REWRITE */}
        {activeTool === 'rewrite' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'কন্টেন্ট রি-রাইটার ও প্যারাফ্রেজ' : 'Content Rewriter & Polish'}
              </h2>
            </div>
            <textarea
              value={rewriteInput}
              onChange={(e) => setRewriteInput(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
            <button
              onClick={handleRewrite}
              disabled={loading}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              {loading ? 'পরিমার্জন হচ্ছে...' : 'আকর্ষণীয় ভাষায় রূপান্তর করুন'}
            </button>
            {rewrittenText && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 flex justify-between">
                <p className="text-slate-800 dark:text-slate-200">{rewrittenText}</p>
                <button onClick={() => copyToClipboard(rewrittenText)} className="text-orange-500 font-bold ml-2">কপি</button>
              </div>
            )}
          </div>
        )}

        {/* TOOL 7: SUMMARIZER */}
        {activeTool === 'summarizer' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'আর্টিকেল সামারাইজার (সারসংক্ষেপ)' : 'Article Summarizer'}
              </h2>
            </div>
            <textarea
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              {loading ? 'সামারি তৈরি হচ্ছে...' : 'সারসংক্ষেপ জেনারেট করুন'}
            </button>
            {summaryResult && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">{summaryResult.summary}</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  {summaryResult.bulletPoints?.map((bp, i) => (
                    <li key={i}>{bp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TOOL 8: GRAMMAR */}
        {activeTool === 'grammar' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'বাংলা ও ইংরেজি ব্যাকরণ ও বানান পরীক্ষক' : 'Grammar & Spell Checker'}
              </h2>
            </div>
            <textarea
              value={grammarInput}
              onChange={(e) => setGrammarInput(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
            <button
              onClick={handleFixGrammar}
              disabled={loading}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              {loading ? 'যাচাই হচ্ছে...' : 'বানান ও বাক্যরীতি সংশোধন করুন'}
            </button>
            {grammarResult && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-xs border border-emerald-200 dark:border-emerald-900 space-y-2">
                <p className="font-bold text-emerald-900 dark:text-emerald-200">{grammarResult.correctedText}</p>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {grammarResult.changesMade?.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 9: IDEAS */}
        {activeTool === 'ideas' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'ভাইরাল ব্লগ টপিক ও কন্টেন্ট আইডিয়া' : 'Content Ideas Generator'}
              </h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={ideaTopic}
                onChange={(e) => setIdeaTopic(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button
                onClick={handleGenerateIdeas}
                disabled={loading}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
              >
                {loading ? 'আইডিয়া খুঁজছে...' : 'নতুন আইডিয়া পান'}
              </button>
            </div>
            {generatedIdeas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedIdeas.map((idea, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white">{idea.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{idea.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOOL 10: FAQ */}
        {activeTool === 'faq' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'স্বয়ংক্রিয় FAQ প্রশ্ন ও উত্তর জেনারেটর' : 'FAQ Generator'}
              </h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={faqTopic}
                onChange={(e) => setFaqTopic(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button
                onClick={handleGenerateFaqs}
                disabled={loading}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
              >
                {loading ? 'জেনারেট হচ্ছে...' : 'FAQ তৈরি করুন'}
              </button>
            </div>
            {generatedFaqs.length > 0 && (
              <div className="space-y-2">
                {generatedFaqs.map((faq, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <h4 className="font-bold text-orange-600 dark:text-orange-400">Q: {faq.q}</h4>
                    <p className="text-slate-700 dark:text-slate-300">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOOL 11: SOCIAL CAPTIONS */}
        {activeTool === 'social' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-orange-500" />
                {language === 'bn' ? 'সোশ্যাল মিডিয়া ক্যাপশন ও হ্যাশট্যাগ' : 'Social Media Caption Generator'}
              </h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={socialTopic}
                onChange={(e) => setSocialTopic(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button
                onClick={handleGenerateSocial}
                disabled={loading}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
              >
                {loading ? 'ক্যাপশন তৈরি হচ্ছে...' : 'ক্যাপশন পান'}
              </button>
            </div>
            {generatedCaptions.length > 0 && (
              <div className="space-y-3">
                {generatedCaptions.map((cap, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <span className="px-2 py-0.5 bg-orange-500 text-white rounded font-bold">{cap.platform}</span>
                    <p className="text-slate-800 dark:text-slate-200">{cap.text}</p>
                    <p className="text-orange-500 font-mono text-[10px]">{cap.hashtags}</p>
                    <button onClick={() => copyToClipboard(cap.text)} className="text-[10px] text-orange-600 font-bold">কপি করুন</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
