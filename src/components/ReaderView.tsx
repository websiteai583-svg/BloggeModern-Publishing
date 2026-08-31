import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Eye, 
  Heart, 
  Calendar, 
  Clock, 
  Coffee, 
  Mail, 
  Layers, 
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  ExternalLink
} from 'lucide-react';

export const ReaderView: React.FC = () => {
  const { 
    posts, 
    settings, 
    setSelectedPostSlug, 
    setSelectedAuthorId,
    setViewMode, 
    setSelectedPageSlug, 
    pages, 
    language, 
    t, 
    searchQuery, 
    addToReadingList,
    removeFromReadingList,
    isPostInReadingList,
    toggleLikePost,
    isPostLiked,
    setIsDonationModalOpen,
    showToast 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Collect published posts only for reader
  const publishedPosts = posts.filter((p) => p.status === 'published');

  // Collect unique categories
  const allCategories = Array.from(
    new Set(publishedPosts.flatMap((p) => p.categories || []))
  );

  // Filter posts
  const filteredPosts = publishedPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || (post.categories && post.categories.includes(selectedCategory));
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = publishedPosts[0] || posts[0];
  const remainingPosts = filteredPosts.filter((p) => p.id !== (selectedCategory === 'all' && !searchQuery ? featuredPost?.id : ''));

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    showToast(language === 'bn' ? 'ধন্যবাদ! আপনি সফলভাবে নিউজলেটারে যুক্ত হয়েছেন।' : 'Thank you for subscribing to our newsletter!');
    setNewsletterEmail('');
  };

  return (
    <div id="reader-view-wrapper" className="min-h-screen text-slate-100 transition-colors">
      
      {/* Top Banner Leaderboard Ad (728x90) in Frosted Glass */}
      {settings?.adSlots?.headerAdEnabled && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="w-full h-20 sm:h-24 glass-panel rounded-2xl border border-white/10 flex items-center justify-between px-6 shadow-xl">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 block">SPONSORED ADVERTISEMENT</span>
              <p className="text-xs sm:text-sm font-bold text-white">
                {language === 'bn' ? 'হোস্টিংগার ক্লাউড হোস্টিং - ৮০% ছাড় ও ফ্রি ডোমেইন!' : 'Hostinger Cloud Hosting — 80% OFF + Free Domain!'}
              </p>
            </div>
            <a
              href="https://hostinger.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition whitespace-nowrap border border-white/15"
            >
              {language === 'bn' ? 'অফার দেখুন' : 'Claim Offer'}
            </a>
          </div>
        </div>
      )}

      {/* Main Blog Header / Tagline Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="ai-pill">
                {language === 'bn' ? 'পাবলিশিং হাব ও টেক ম্যাগাজিন' : 'Editorial Publication'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-2">
              {language === 'bn' ? settings.siteNameBn : settings.siteName}<span className="text-indigo-400">.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {language === 'bn' ? settings.taglineBn : settings.tagline}
            </p>
          </div>

          {/* Category Chips Horizontal Bar in Frosted Glass */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 self-start md:self-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition backdrop-blur-md ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-white/20'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:border-indigo-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'সব বিষয়' : 'All Topics'}
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition backdrop-blur-md ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-white/20'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:border-indigo-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Articles + Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feed (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Featured Article Spotlight Hero */}
            {selectedCategory === 'all' && !searchQuery && featuredPost && (
              <article
                id="featured-hero-article"
                onClick={() => {
                  setSelectedPostSlug(featuredPost.slug);
                  setViewMode('post-detail');
                }}
                className="group relative glass-panel rounded-3xl border border-white/15 overflow-hidden shadow-2xl hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
                  <img
                    src={featuredPost.featuredImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-bold uppercase rounded-lg shadow-md border border-white/10">
                        {featuredPost.categories?.[0] || 'Featured'}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {featuredPost.readingTimeMinutes} {t('minRead')}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight group-hover:text-indigo-300 transition-colors">
                      {featuredPost.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {featuredPost.summary}
                    </p>
                  </div>
                </div>
              </article>
            )}

            {/* Articles Grid (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {remainingPosts.map((post) => (
                <article
                  key={post.id}
                  id={`article-card-${post.id}`}
                  onClick={() => {
                    setSelectedPostSlug(post.slug);
                    setViewMode('post-detail');
                  }}
                  className="group glass-panel glass-panel-hover rounded-3xl border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-slate-900">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {post.categories?.[0] && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-md text-indigo-300 text-[10px] font-bold uppercase rounded-lg shadow-sm border border-white/10">
                          {post.categories[0]}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {post.readingTimeMinutes} {t('minRead')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.author?.id) {
                          setSelectedAuthorId(post.author.id);
                          setViewMode('view-blog');
                        }
                      }}
                      className="flex items-center gap-2 hover:text-white transition group/author"
                    >
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-500/50 group-hover/author:ring-indigo-400"
                      />
                      <span className="font-medium text-slate-200 text-[11px] group-hover/author:text-indigo-300">
                        {post.author.name}
                      </span>
                    </button>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPostInReadingList(post.id)) {
                            removeFromReadingList(post.id);
                          } else {
                            addToReadingList(post);
                          }
                        }}
                        className={`p-1 rounded-lg transition ${
                          isPostInReadingList(post.id)
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title={isPostInReadingList(post.id) ? 'Remove from Reading List' : 'Save to Reading List'}
                      >
                        {isPostInReadingList(post.id) ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikePost(post.id);
                        }}
                        className={`flex items-center gap-1 font-semibold p-1 rounded-lg transition ${
                          isPostLiked(post.id)
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-slate-400 hover:text-rose-400'
                        }`}
                        title="Like Post"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isPostLiked(post.id) ? 'fill-rose-500' : ''}`} />
                        <span>{post.likes}</span>
                      </button>

                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {remainingPosts.length === 0 && (
              <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-white/10 p-8 shadow-xl">
                <p className="text-sm font-semibold text-slate-400">কোনো পোস্ট পাওয়া যায়নি</p>
              </div>
            )}

          </div>

          {/* Right Sidebar Widgets (Span 4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Widget 1: Author Profile Bio */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl text-center">
              <img
                src={featuredPost?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt="Author"
                className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-indigo-500/30 mb-3"
              />
              <h3 className="text-base font-bold text-white">
                {featuredPost?.author?.name || 'তানভীর আহমেদ'}
              </h3>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                {language === 'bn' ? 'প্রধান সম্পাদক ও লেখক' : 'Editor-in-Chief'}
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {featuredPost?.author?.bio || 'প্রযুক্তি, কৃত্রিম বুদ্ধিমত্তা এবং ডিজিটাল কনটেন্ট বিষয়ে নিয়মিত গবেষণা ও লেখালেখি করি।'}
              </p>
              
              <button
                onClick={() => setIsDonationModalOpen(true)}
                className="mt-4 w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                <span>{t('donateBtn')}</span>
              </button>
            </div>

            {/* Widget 2: AdSense Rectangle Ad (300x250) */}
            {settings?.adSlots?.sidebarAdEnabled && (
              <div className="glass-panel p-4 rounded-3xl border border-dashed border-white/10 text-center min-h-[250px] flex flex-col items-center justify-center shadow-xl">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-2">GOOGLE ADSENSE (300x250)</span>
                <div className="p-4 bg-white/5 rounded-2xl shadow-inner border border-white/10 w-full backdrop-blur-md">
                  <span className="text-xs font-bold text-white block">🚀 Grow Your Startup with AI</span>
                  <p className="text-[11px] text-slate-400 mt-1">Get $200 Cloud credits today.</p>
                  <button className="mt-3 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition">
                    Learn More
                  </button>
                </div>
              </div>
            )}

            {/* Widget 3: Newsletter Subscribe */}
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'সাপ্তাহিক নিউজলেটার' : 'Weekly Digest'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn' ? 'সেরা টেক আর্টিকেল ও টিউটোরিয়াল সরাসরি আপনার ইমেইলে পেতে সাবস্ক্রাইব করুন।' : 'Subscribe to get hand-picked top articles straight to your inbox.'}
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl glass-input placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition border border-white/10"
                >
                  {language === 'bn' ? 'সাবস্ক্রাইব করুন' : 'Subscribe Free'}
                </button>
              </form>
            </div>

            {/* Widget 4: Trending / Popular Posts */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>{language === 'bn' ? 'জনপ্রিয় লেখাগুলো' : 'Trending Articles'}</span>
              </h3>

              <div className="space-y-3">
                {publishedPosts.slice(0, 3).map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPostSlug(p.slug);
                      setViewMode('post-detail');
                    }}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <span className="text-xl font-extrabold text-slate-500 font-mono group-hover:text-indigo-400 transition">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition line-clamp-2 leading-snug">
                        {p.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{p.views} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </main>

      {/* Modern Frosted Footer */}
      <footer className="mt-16 border-t border-white/10 glass-panel transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold border border-white/20">
                  B
                </div>
                <span className="font-bold text-lg text-white">
                  {language === 'bn' ? settings.siteNameBn : settings.siteName}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {language === 'bn' ? settings.taglineBn : settings.tagline}
              </p>
              <p className="text-[11px] text-indigo-400 font-mono">
                Frosted Glass Edition • Powered by Node.js, Express, React & AI
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                {language === 'bn' ? 'প্রয়োজনীয় পাতা' : 'Pages & Policies'}
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                {pages.filter(p => p.showInFooter).map((pg) => (
                  <li key={pg.id}>
                    <button
                      onClick={() => {
                        setSelectedPageSlug(pg.slug);
                        setViewMode('page-detail');
                      }}
                      className="hover:text-indigo-300 transition"
                    >
                      {pg.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Social Follow */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                {language === 'bn' ? 'সোশ্যাল মিডিয়া' : 'Follow Community'}
              </h4>
              <div className="flex gap-2">
                {['Facebook', 'Twitter', 'LinkedIn', 'YouTube'].map((net) => (
                  <a
                    key={net}
                    href="#"
                    onClick={(e) => { e.preventDefault(); showToast(`Opening ${net}`); }}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 flex items-center justify-center text-xs font-bold transition border border-white/10"
                  >
                    {net[0]}
                  </a>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} {language === 'bn' ? settings.siteNameBn : settings.siteName}. সর্বস্বত্ব সংরক্ষিত (All rights reserved).
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Footer Anchor Ad */}
      {settings?.adSlots?.footerStickyAdEnabled && (
        <div className="fixed bottom-0 left-0 right-0 z-30 glass-panel text-white p-3 shadow-2xl border-t border-white/10 flex items-center justify-between max-w-4xl mx-auto rounded-t-2xl px-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold uppercase rounded">Ad</span>
            <span className="text-xs font-medium truncate">🔥 Special Discount: Get Blogge Pro Premium Today for 50% Off!</span>
          </div>
          <button
            onClick={() => setIsDonationModalOpen(true)}
            className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap shadow-md"
          >
            Upgrade Now
          </button>
        </div>
      )}

    </div>
  );
};
