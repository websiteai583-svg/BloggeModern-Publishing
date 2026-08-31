import { Post, Comment, StaticPage, LayoutWidget, ThemeConfig, AdSlot, MediaItem, SiteSettings, ActivityLog, User, NotificationItem } from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr_1787561633296',
    name: 'Sohelmolla admin',
    email: 'websiteai583@gmail.com',
    avatar: '/uploads/avatars/admin_avatar.jpg',
    bio: 'ব্লগারের প্রতিষ্ঠাতা, চিফ অ্যাডমিনিস্ট্রেটর ও টেক উৎসাহী।',
    role: 'admin',
    twoFactorEnabled: false,
    joinedAt: '2026-08-24'
  },
  {
    id: 'usr_tanvir',
    name: 'তানভীর আহমেদ (Tanvir Ahmed)',
    email: 'tanvir@blogge.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'টেক উদ্যোক্তা, ফুল-স্ট্যাক ডেভেলপার ও কন্টেন্ট ক্রিয়েটর। বাংলা ভাষায় আধুনিক প্রযুক্তির বিস্তার ঘটাতে ভালোবাসি।',
    role: 'editor',
    twoFactorEnabled: false,
    joinedAt: '2025-01-15',
    socialLinks: {
      twitter: 'https://twitter.com',
      github: 'https://github.com',
      facebook: 'https://facebook.com',
      website: 'https://blogge.io'
    }
  },
  {
    id: 'usr_editor',
    name: 'নুসরাত জাহান (Nusrat Jahan)',
    email: 'nusrat@blogge.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'প্রযুক্তি সাংবাদিক ও সাহিত্যপ্রেমী। এআই ও ভবিষ্যৎ টেকনোলজি নিয়ে নিয়মিত কলাম লেখেন।',
    role: 'editor',
    twoFactorEnabled: false,
    joinedAt: '2025-02-10'
  },
  {
    id: 'usr_author',
    name: 'রাফিদ হাসান (Rafid Hasan)',
    email: 'rafid@blogge.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'সফটওয়্যার আর্কিটেক্ট ও ওপেন-সোর্স কন্ট্রিবিউটর।',
    role: 'author',
    twoFactorEnabled: false,
    joinedAt: '2025-03-01'
  }
];

export const initialPosts: Post[] = [
  {
    id: 'post_1',
    title: '২০২৬ সালে কৃত্রিম বুদ্ধিমত্তা ও জেনারেটিভ এআই বিপ্লব: বাংলা কন্টেন্ট ক্রিয়েটরদের নতুন দিগন্ত',
    slug: 'ai-revolution-and-bangla-content-creators-2026',
    summary: 'কৃত্রিম বুদ্ধিমত্তা কীভাবে বাংলা ব্লগিং, কনটেন্ট তৈরি ও এসইও অপটিমাইজেশনে বৈপ্লবিক পরিবর্তন এনেছে এবং ক্রিয়েটররা কীভাবে লাভবান হতে পারেন।',
    content: `
      <p class="lead font-medium text-lg mb-4">কৃত্রিম বুদ্ধিমত্তা (AI) এখন আর কেবল ভবিষ্যতের কল্পনা নয়, বরং বর্তমান ডিজিটাল দুনিয়ার সবচেয়ে শক্তিশালী ইঞ্জিন। ২০২৬ সালে এসে আমরা দেখছি কীভাবে এলএলএম ও জেনারেটিভ এআই কন্টেন্ট ক্রিয়েশনকে কয়েক গুণ দ্রুত ও নিখুঁত করে তুলেছে।</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-3">বাংলা ভাষায় এআই এর অভূতপূর্ব উন্নয়ন</h2>
      <p class="mb-4">পূর্বে বাংলা ভাষার ক্ষেত্রে ন্যাচারাল ল্যাঙ্গুয়েজ প্রসেসিং (NLP) কিছুটা পিছিয়ে থাকলেও জেমিনি এবং আধুনিক এআই মডেলগুলোর কল্যাণে বাংলা ব্যাকরণ, সাহিত্যরস ও প্রাঞ্জল অনুবাদ এখন মানুষের লেখার সমতুল্য হয়ে উঠেছে।</p>
      
      <div class="p-4 my-6 bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600 rounded-r-lg">
        <h4 class="font-bold text-blue-900 dark:text-blue-200">মূল পর্যবেক্ষণ:</h4>
        <p class="text-sm text-blue-800 dark:text-blue-300">সঠিক প্রম্পট ইঞ্জিনিয়ারিং জানা থাকলে একটি সাধারণ ধারণাকে মাত্র কয়েক সেকেন্ডে পূর্ণাঙ্গ ও গবেষণাভিত্তিক আর্টিকেলে রূপান্তর করা সম্ভব।</p>
      </div>

      <h2 class="text-2xl font-bold mt-6 mb-3">কন্টেন্ট ক্রিয়েটরদের জন্য ৫টি সেরা কৌশল</h2>
      <ol class="list-decimal pl-6 space-y-2 mb-6">
        <li><strong>এআই আউটলাইন তৈরি:</strong> লেখার শুরুতে বিস্তারিত স্ট্রাকচার তৈরি করে নেওয়া।</li>
        <li><strong>রিয়েল-টাইম ফ্যাক্ট চেকিং:</strong> তথ্যের সত্যতা যাচাই করা।</li>
        <li><strong>এসইও অপ্টিমাইজেশন:</strong> কিওয়ার্ড ডেনসিটি ও সার্চ ইনটেন্ট মিলিয়ে মেটা ট্যাগ জেনারেট করা।</li>
        <li><strong>হাই-রেজুলেশন থাম্বনেইল তৈরি:</strong> এআই ভিজ্যুয়াল দিয়ে পাঠকদের আকর্ষণ বৃদ্ধি।</li>
        <li><strong>বহুভাষিক প্রচার:</strong> এক ক্লিকে বাংলা থেকে ইংরেজিতে বা অন্যান্য ভাষায় অনুবাদ করে গ্লোবাল অডিয়েন্স ধরা।</li>
      </ol>

      <blockquote class="border-l-4 border-amber-500 pl-4 py-2 italic my-6 text-gray-700 dark:text-gray-300 bg-amber-50/50 dark:bg-amber-950/20 rounded-r">
        "প্রযুক্তি মানুষকে প্রতিস্থাপন করবে না, কিন্তু যে মানুষ প্রযুক্তি ব্যবহার করবে সে পেছনের সবাইকে ছাড়িয়ে যাবে।"
      </blockquote>

      <h2 class="text-2xl font-bold mt-6 mb-3">উপসংহার</h2>
      <p class="mb-4">আপনি যদি একজন ব্লগার বা রাইটার হন, তবে এআই টুলসকে আপনার প্রতিদ্বন্দ্বী না ভেবে পরম বন্ধু হিসেবে গ্রহণ করুন। ব্লগারের নতুন এআই স্টুডিও এই কাজটিকে আরও সহজ করে দিয়েছে।</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    imageCaption: 'ডিজিটাল ক্রিয়েটিভিটি এবং এআই সমন্বয়ের প্রতীকী ছবি',
    author: {
      id: 'usr_admin',
      name: 'তানভীর আহমেদ',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'টেক উদ্যোক্তা ও কন্টেন্ট ক্রিয়েটর'
    },
    categories: ['প্রযুক্তি', 'কৃত্রিম বুদ্ধিমত্তা', 'কন্টেন্ট মার্কেটিং'],
    tags: ['AI', 'Gemini', 'Blogging', 'Bangla', 'SEO'],
    status: 'published',
    publishedAt: '2026-08-15T10:30:00Z',
    updatedAt: '2026-08-18T14:20:00Z',
    views: 4820,
    likes: 342,
    isLikedByUser: false,
    isPaywalled: false,
    readingTimeMinutes: 5,
    seo: {
      metaTitle: '২০২৬ সালে কৃত্রিম বুদ্ধিমত্তা ও জেনারেটিভ এআই বিপ্লব | Blogge',
      metaDescription: 'জানুন কীভাবে আধুনিক এআই ও জেমিনি ব্যবহার করে বাংলা ব্লগের কন্টেন্ট কোয়ালিটি এবং ট্রাফিক ১০ গুণ বৃদ্ধি করবেন।',
      keywords: ['AI blogging', 'Bangla AI', 'Content creation 2026', 'SEO tips']
    },
    affiliateLinks: [
      {
        title: 'সেরা হোস্টিং ডিল (৭০% ছাড়)',
        url: 'https://hostinger.com',
        discountCode: 'BLOGGE70'
      }
    ]
  },
  {
    id: 'post_2',
    title: 'ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট রোডম্যাপ ২০২৬: রিয়্যাক্ট ১৯, নোড ও ক্লাউড কম্পিউটিং',
    slug: 'fullstack-web-development-roadmap-2026',
    summary: 'একজন আধুনিক ফুল-স্ট্যাক ডেভেলপার হতে ২০২৬ সালে আপনার কী কী জানা জরুরি — ফ্রন্টএন্ড, ব্যাকএন্ড, ডেভঅপস ও এআই ইন্টিগ্রেশন।',
    content: `
      <p class="lead font-medium text-lg mb-4">ওয়েব ডেভেলপমেন্ট জগৎ দ্রুত পরিবর্তিত হচ্ছে। আজ শুধু HTML, CSS ও JS জানাই যথেষ্ট নয়; ক্লাউড নেটিভ আর্কিটেকচার এবং ইন্টেলিজেন্ট এপিআই ব্যবহারের দক্ষতা অপরিহার্য।</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-3">১. ফ্রন্টএন্ড আর্কিটেকচার</h2>
      <p class="mb-4">React 19 এবং আধুনিক কম্পাইলার অপ্টিমাইজেশন আমাদের স্টেট ম্যানেজমেন্ট ও রেন্ডারিং পারফরম্যান্সে অনেক সুবিধা দিয়েছে। Tailwind CSS v4 এর বিদ্যুৎগতির ইঞ্জিন স্টাইলিংকে আনন্দদায়ক করেছে।</p>

      <h2 class="text-2xl font-bold mt-6 mb-3">২. ব্যাকএন্ড ও মাইক্রোসার্ভিসেস</h2>
      <p class="mb-4">Node.js + Express বা Fastify এর সাথে TypeScript এখন ইন্ডাস্ট্রির অবিসংবাদিত স্ট্যান্ডার্ড। ডেটাবেস হিসেবে MongoDB বা PostgreSQL ক্লাউড সার্ভারলেস সমাধানগুলো জনপ্রিয়তার শীর্ষে।</p>
      
      <pre class="bg-gray-900 text-green-400 p-4 rounded-lg my-4 text-sm font-mono overflow-x-auto">
// Example modern express route with async handling
app.get('/api/posts', async (req, res) => {
  const posts = await db.collection('posts').find({ status: 'published' }).toArray();
  res.json({ success: true, count: posts.length, data: posts });
});</pre>

      <h2 class="text-2xl font-bold mt-6 mb-3">৩. এআই ও ডেভঅপস স্কিল</h2>
      <p class="mb-4">Docker, CI/CD পাইপলাইন এবং ব্যাকএন্ডে Gemini/OpenAI SDK দিয়ে অটোমেশন গড়ে তোলার জ্ঞান আপনাকে অন্যদের থেকে বহুদূর এগিয়ে রাখবে।</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    imageCaption: 'আধুনিক কোডিং ও ওয়েব ডেভেলপমেন্ট ওয়ার্কস্পেস',
    author: {
      id: 'usr_author',
      name: 'রাফিদ হাসান',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    categories: ['প্রযুক্তি', 'প্রোগ্রামিং', 'টিউটোরিয়াল'],
    tags: ['React', 'Nodejs', 'TypeScript', 'WebDev', 'Career'],
    status: 'published',
    publishedAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-12T09:00:00Z',
    views: 3190,
    likes: 280,
    isLikedByUser: false,
    isPaywalled: false,
    readingTimeMinutes: 7,
    seo: {
      metaTitle: 'ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট রোডম্যাপ ২০২৬ | Blogge Tech',
      metaDescription: '২০২৬ সালের জন্য তৈরি সম্পূর্ণ ফুল-স্ট্যাক রোডম্যাপ। রিয়্যাক্ট, নোড, ক্লাউড ও এআই ইন্টিগ্রেশন বিস্তারিত।',
      keywords: ['Web Development Roadmap', 'React 19', 'Fullstack Developer', 'Node.js']
    }
  },
  {
    id: 'post_3',
    title: 'ব্লগ থেকে প্রতি মাসে ১০০০ ডলার আয়ের বাস্তবসম্মত গাইডলাইন: এডসেন্স, অ্যাফিলিয়েট ও স্পনসরশিপ',
    slug: 'how-to-earn-1000-dollars-per-month-blogging-guide',
    summary: 'ওয়েবসাইট মনিটাইজেশন ও প্যাসিভ ইনকামের প্রমাণিত কলাকৌশল — গুগল অ্যাডসেন্স, অ্যাফিলিয়েট নেটওয়ার্ক ও পেইড মেম্বারশিপ।',
    content: `
      <p class="lead font-medium text-lg mb-4">অনেকেরই ধারণা ব্লগিং থেকে আয় করা কেবল পুরনো দিনের গল্প। কিন্তু বাস্তবতা হলো, মানসম্মত ও নির্দিষ্ট নিশ-ভিত্তিক (Niche) ব্লগের চাহিদা এখন আগের চেয়েও বহুগুণ বেশি।</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-3">আয়ের ৩টি মূল স্তম্ভ</h2>
      <ul class="list-disc pl-6 space-y-3 mb-6">
        <li><strong>গুগল অ্যাডসেন্স ও ডিসপ্লে অ্যাডস:</strong> হাই সিপিসি (High CPC) কিওয়ার্ডে ট্রাফিক এনে অটো অ্যাডস ও ইন-পোস্ট ব্যানার থেকে প্যাসিভ ইনকাম।</li>
        <li><strong>অ্যাফিলিয়েট মার্কেটিং:</strong> আপনি যে সফটওয়্যার বা গ্যাজেট ব্যবহার করেন তার সৎ রিভিউ ও অ্যাফিলিয়েট লিংক শেয়ার করা।</li>
        <li><strong>প্রিমিয়াম সাবস্ক্রিপশন ও ডোনেশন:</strong> ডেডিকেটেড পাঠকদের জন্য স্পেশাল এক্সক্লুসিভ আর্টিকেল ও টিপস সুবিধা।</li>
      </ul>

      <h2 class="text-2xl font-bold mt-6 mb-3">ট্রাফিক বৃদ্ধির গোপন সূত্র</h2>
      <p class="mb-4">লং-টেইল কিওয়ার্ড টার্গেট করুন, পেজ লোডিং স্পিড ২ সেকেন্ডের নিচে রাখুন এবং সোশ্যাল মিডিয়া কমিউনিটিতে সক্রিয় থাকুন।</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&auto=format&fit=crop&q=80',
    imageCaption: 'ডিজিটাল ইনভেস্টমেন্ট ও ব্লগ মনিটাইজেশন',
    author: {
      id: 'usr_admin',
      name: 'তানভীর আহমেদ',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    categories: ['ব্যবসা ও ফ্রিল্যান্সিং', 'উপার্জন', 'টিপস'],
    tags: ['AdSense', 'Affiliate', 'Passive Income', 'Monetization'],
    status: 'published',
    publishedAt: '2026-08-05T08:15:00Z',
    updatedAt: '2026-08-06T11:45:00Z',
    views: 6540,
    likes: 512,
    isLikedByUser: false,
    isPaywalled: false,
    readingTimeMinutes: 6,
    seo: {
      metaTitle: 'ব্লগ থেকে প্রতি মাসে ১০০০ ডলার আয়ের বাস্তবসম্মত গাইডলাইন',
      metaDescription: 'গুগল অ্যাডসেন্স ও অ্যাফিলিয়েট থেকে প্যাসিভ ইনকাম করার কার্যকরী নিয়মাবলি।',
      keywords: ['Earn from blog', 'Google Adsense income', 'Affiliate marketing Bangla']
    }
  },
  {
    id: 'post_4',
    title: 'প্রশান্ত মনের খোঁজে: ডিজিটাল যুগে ফোকাস ধরে রাখার ৫টি বৈজ্ঞানিক অভ্যাস',
    slug: 'mindfulness-and-deep-focus-in-digital-era',
    summary: 'নোটিফিকেশনের ভিড়ে মনোযোগ নষ্ট না করে ডিপ ওয়ার্ক (Deep Work) ও মানসিক প্রশান্তি অর্জনের কার্যকরী রূপরেখা।',
    content: `
      <p class="lead font-medium text-lg mb-4">আমাদের মস্তিষ্ক একটানা হাজারো নোটিফিকেশন ও শর্ট ভিডিও ফিডের দ্বারা অতিরিক্ত স্টিমুলেশনের শিকার হচ্ছে। কীভাবে এই ডিজিটাল ক্লান্তি দূর করবেন?</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-3">১. পমোডোরো ও টাইম-ব্লকিং কৌশল</h2>
      <p class="mb-4">প্রতি ২৫ মিনিট সম্পূর্ণ একক কোনো কাজে ফোকাস করুন এবং ৫ মিনিট চোখ বন্ধ করে বিশ্রাম নিন। ফোনে ডু-নট-ডিস্টার্ব (DND) চালু রাখুন।</p>

      <h2 class="text-2xl font-bold mt-6 mb-3">২. সকালের প্রথম এক ঘণ্টা স্ক্রিন-ফ্রি থাকা</h2>
      <p class="mb-4">ঘুম থেকে উঠেই ফোন চেক করার অভ্যাস ডোপামিন স্পাইক ঘটিয়ে সারাদিনের উৎপাদনশীলতা কমিয়ে দেয়। সকালে একটু হাঁটা, মেডিটেশন বা বই পড়ার অভ্যাস গড়ে তুলুন।</p>
    `,
    featuredImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    imageCaption: 'প্রকৃতির সান্নিধ্যে মানসিক প্রশান্তি',
    author: {
      id: 'usr_editor',
      name: 'নুসরাত জাহান',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    categories: ['লাইফস্টাইল', 'মানসিক স্বাস্থ্য', 'মোটিভেশন'],
    tags: ['Mindfulness', 'Productivity', 'DeepWork', 'MentalHealth'],
    status: 'published',
    publishedAt: '2026-07-28T16:00:00Z',
    updatedAt: '2026-07-29T10:00:00Z',
    views: 2410,
    likes: 198,
    isLikedByUser: false,
    isPaywalled: false,
    readingTimeMinutes: 4,
    seo: {
      metaTitle: 'ডিজিটাল যুগে ফোকাস ধরে রাখার বৈজ্ঞানিক অভ্যাস | Blogge Life',
      metaDescription: 'ডিপ ওয়ার্ক ও ডিজিটাল ডিটক্সের মাধ্যমে মনোযোগ ও উৎপাদনশীলতা বৃদ্ধির সহজ উপায়।',
      keywords: ['Deep work', 'Digital detox', 'Mindfulness Bangla', 'Focus hacks']
    }
  }
];

export const initialComments: Comment[] = [
  {
    id: 'comm_1',
    postId: 'post_1',
    authorName: 'সাকিব আল হাসান',
    authorEmail: 'sakib@gmail.com',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    content: 'অসাধারণ তথ্যবহুল একটি লেখা! বিশেষ করে জেমিনি এআই দিয়ে বাংলা কন্টেন্ট লেখার পার্টটা দারুণ লেগেছে।',
    createdAt: '2026-08-16T11:20:00Z',
    status: 'approved',
    likes: 14,
    parentId: null,
    replies: [
      {
        id: 'comm_1_rep_1',
        postId: 'post_1',
        authorName: 'তানভীর আহমেদ (লেখক)',
        authorEmail: 'tanvir@blogge.io',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'ধন্যবাদ ভাই! আশা করি ব্লগারের এআই টুল ব্যবহার করে উপকৃত হবেন।',
        createdAt: '2026-08-16T12:05:00Z',
        status: 'approved',
        likes: 6,
        parentId: 'comm_1'
      }
    ]
  },
  {
    id: 'comm_2',
    postId: 'post_2',
    authorName: 'মেহজাবিন চৌধুরী',
    authorEmail: 'mehjabin@dev.com',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    content: 'React 19 এবং Tailwind v4 এর সংমিশ্রণে সত্যিই কাজ করা অনেক দ্রুত হয়ে গেছে। চমৎকার রোডম্যাপ!',
    createdAt: '2026-08-11T14:40:00Z',
    status: 'approved',
    likes: 8,
    parentId: null,
    replies: []
  },
  {
    id: 'comm_3',
    postId: 'post_3',
    authorName: 'অজানা স্প্যামার',
    authorEmail: 'casino@spam.xyz',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    content: 'Play casino online win free crypto click here http://spam.xyz',
    createdAt: '2026-08-07T03:10:00Z',
    status: 'spam',
    likes: 0,
    parentId: null,
    replies: []
  }
];

export const initialPages: StaticPage[] = [
  {
    id: 'page_about',
    title: 'আমাদের সম্পর্কে (About Us)',
    slug: 'about-us',
    status: 'published',
    isDefault: true,
    updatedAt: '2026-08-01',
    content: `
      <h2>ব্লগার প্রো (Blogge Pro) এর পরিচিতি</h2>
      <p>ব্লগার প্রো হলো একটি আধুনিক, শক্তিশালী এবং আন্তর্জাতিক মানের ডিজিটাল পাবলিশিং প্ল্যাটফর্ম। এটি লেখক, সাংবাদিক, প্রযুক্তিবিদ এবং কনটেন্ট ক্রিয়েটরদের জন্য নিজস্ব চিন্তা-ভাবনা সহজে প্রকাশ করার একটি উন্মুক্ত স্থান।</p>
      <h3>আমাদের লক্ষ্য</h3>
      <p>বাংলা ও বিশ্বভাষায় জ্ঞানভিত্তিক কন্টেন্টকে আরও সমৃদ্ধ ও সবার জন্য সহজে উন্মুক্ত করা।</p>
    `,
    seo: {
      metaTitle: 'আমাদের সম্পর্কে | Blogge Pro Platform',
      metaDescription: 'ব্লগার প্রো পাবলিশিং প্ল্যাটফর্ম সম্পর্কে বিস্তারিত জানুন।'
    }
  },
  {
    id: 'page_contact',
    title: 'যোগাযোগ (Contact Us)',
    slug: 'contact-us',
    status: 'published',
    isDefault: true,
    updatedAt: '2026-08-01',
    content: `
      <h2>আমাদের সাথে যোগাযোগ করুন</h2>
      <p>যেকোনো প্রশ্ন, মতামত, বা বাণিজ্যিক বিজ্ঞাপনের জন্য আমাদের সাথে ইমেইল বা সোশ্যাল মিডিয়ায় যোগাযোগ করতে পারেন।</p>
      <p><strong>ইমেইল:</strong> support@blogge.io</p>
      <p><strong>ঠিকানা:</strong> গুলশান-২, ঢাকা, বাংলাদেশ</p>
    `,
    seo: {
      metaTitle: 'যোগাযোগ করুন | Blogge Contact',
      metaDescription: 'ব্লগার প্রো টিমের সাথে সরাসরি যোগাযোগের ঠিকানা ও মাধ্যম।'
    }
  },
  {
    id: 'page_privacy',
    title: 'গোপনীয়তা নীতি (Privacy Policy)',
    slug: 'privacy-policy',
    status: 'published',
    isDefault: true,
    updatedAt: '2026-08-01',
    content: `
      <h2>গোপনীয়তা ও ডেটা সুরক্ষা নীতি</h2>
      <p>আমরা আমাদের পাঠকদের তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিত করি। আপনার ব্যক্তিগত ইমেইল বা কুকি ডেটা কখনোই তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।</p>
    `,
    seo: {
      metaTitle: 'গোপনীয়তা নীতি | Blogge Privacy Policy',
      metaDescription: 'ব্লগার প্ল্যাটফর্মে আপনার ডেটা সুরক্ষা ও নিরাপত্তা সংক্রান্ত তথ্যাবলি।'
    }
  },
  {
    id: 'page_terms',
    title: 'ব্যবহারের শর্তাবলী (Terms & Conditions)',
    slug: 'terms-and-conditions',
    status: 'published',
    isDefault: true,
    updatedAt: '2026-08-01',
    content: `
      <h2>ব্যবহারের শর্তাবলী</h2>
      <p>ব্লগার প্রো ব্যবহারের মাধ্যমে আপনি সকল কপিরাইট ও শিষ্টাচার নীতি মেনে চলার অঙ্গীকার করছেন। কোনো ধরনের ঘৃণাসূচক বা বেআইনি কন্টেন্ট প্রচার নিষিদ্ধ।</p>
    `,
    seo: {
      metaTitle: 'ব্যবহারের শর্তাবলী | Terms of Service',
      metaDescription: 'আমাদের সাইট ব্যবহারের নিয়মাবলি ও শর্তাবলি।'
    }
  }
];

export const initialThemes: ThemeConfig[] = [
  {
    id: 'theme_frosted_glass',
    name: 'Frosted Glass',
    nameBn: 'ফ্রস্টেড গ্লাস (Frosted Glass)',
    description: 'ফিউচারিস্টিক ফ্রস্টেড গ্লাসিমর্ফিজম, মেস ব্যাকগ্রাউন্ড, ব্লার এফেক্ট ও ইন্ডিগো/ভায়োলেট অ্যাকসেন্ট।',
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    fontFamilyHeading: 'sans-serif',
    fontFamilyBody: 'sans-serif',
    primaryColor: '#6366f1', // Indigo
    accentColor: '#a855f7', // Purple
    bgColorLight: '#f1f5f9',
    cardBgLight: 'rgba(255, 255, 255, 0.75)',
    bgColorDark: '#0f172a',
    cardBgDark: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    headerStyle: 'standard'
  },
  {
    id: 'theme_classic',
    name: 'Blogger Classic',
    nameBn: 'ব্লগার ক্লাসিক',
    description: 'গুগল ব্লগারে সুপরিচিত ট্রেডিশনাল পরিষ্কার লেআউট, ডানদিকের সাইডবার এবং টপ অরেঞ্জ/ব্লু অ্যাকসেন্ট।',
    previewImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    fontFamilyHeading: 'sans-serif',
    fontFamilyBody: 'sans-serif',
    primaryColor: '#f97316', // Orange
    accentColor: '#0284c7', // Sky
    bgColorLight: '#f8fafc',
    cardBgLight: '#ffffff',
    bgColorDark: '#0f172a',
    cardBgDark: '#1e293b',
    borderRadius: '12px',
    headerStyle: 'standard'
  },
  {
    id: 'theme_editorial',
    name: 'Editorial Minimal',
    nameBn: 'এডিটোরিয়াল মিনিমাল',
    description: 'মিডিয়াম ও সাবস্ট্যাক স্টাইলের দৃষ্টিনন্দন সেরিফ টাইপোগ্রাফি ও নিঃসীম পড়ার অভিজ্ঞতা।',
    previewImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    fontFamilyHeading: 'serif',
    fontFamilyBody: 'serif',
    primaryColor: '#18181b', // Zinc 900
    accentColor: '#10b981', // Emerald
    bgColorLight: '#fafaf9',
    cardBgLight: '#ffffff',
    bgColorDark: '#18181b',
    cardBgDark: '#27272a',
    borderRadius: '8px',
    headerStyle: 'minimal'
  },
  {
    id: 'theme_cyber',
    name: 'Cyber Tech Nova',
    nameBn: 'সাইবার টেক নোভা',
    description: 'ফিউচারিস্টিক ডার্ক-ব্লু ও নিয়ন অ্যাকসেন্ট যুক্ত প্রযুক্তি ও কোডিং স্পেশাল থিম।',
    previewImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    fontFamilyHeading: 'monospace',
    fontFamilyBody: 'sans-serif',
    primaryColor: '#6366f1', // Indigo
    accentColor: '#06b6d4', // Cyan
    bgColorLight: '#f0fdf4',
    cardBgLight: '#ffffff',
    bgColorDark: '#030712',
    cardBgDark: '#111827',
    borderRadius: '16px',
    headerStyle: 'bold_banner'
  },
  {
    id: 'theme_bangla',
    name: 'Bangla Sahitto Elegance',
    nameBn: 'বাংলা সাহিত্য এলিগ্যান্স',
    description: 'উষ্ণ ক্লাসিক বইয়ের পাতা সদৃশ ব্যাকগ্রাউন্ড ও রবীন্দ্র-নজরুল যুগের সাহিত্যিক আবহ।',
    previewImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    fontFamilyHeading: 'serif',
    fontFamilyBody: 'sans-serif',
    primaryColor: '#9a3412', // Amber 800
    accentColor: '#b45309', // Amber 700
    bgColorLight: '#fffbeb', // Warm amber-50
    cardBgLight: '#ffffff',
    bgColorDark: '#1c1917',
    cardBgDark: '#292524',
    borderRadius: '10px',
    headerStyle: 'centered'
  },
  {
    id: 'theme_magazine',
    name: 'Vibrant Magazine',
    nameBn: 'ভাইব্র্যান্ট ম্যাগাজিন',
    description: 'মাল্টি-কলাম গ্রিড, ট্রেন্ডিং স্পটলাইট ও কালারফুল ব্যাজ সমৃদ্ধ আধুনিক নিউজ ও ম্যাগাজিন থিম।',
    previewImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
    fontFamilyHeading: 'sans-serif',
    fontFamilyBody: 'sans-serif',
    primaryColor: '#e11d48', // Rose
    accentColor: '#8b5cf6', // Violet
    bgColorLight: '#fdf4ff',
    cardBgLight: '#ffffff',
    bgColorDark: '#170b20',
    cardBgDark: '#261238',
    borderRadius: '14px',
    headerStyle: 'bold_banner'
  },
  {
    id: 'theme_monochrome',
    name: 'Monochrome Studio',
    nameBn: 'মনোক্রোম স্টুডিও',
    description: 'উচ্চ কনট্রাস্টের ব্ল্যাক অ্যান্ড হোয়াইট মিনিমালিস্টিক আর্ট ও ডিজাইন ব্লগের জন্য সেরা।',
    previewImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
    fontFamilyHeading: 'sans-serif',
    fontFamilyBody: 'sans-serif',
    primaryColor: '#000000',
    accentColor: '#52525b',
    bgColorLight: '#ffffff',
    cardBgLight: '#f4f4f5',
    bgColorDark: '#09090b',
    cardBgDark: '#18181b',
    borderRadius: '4px',
    headerStyle: 'minimal'
  }
];

export const initialWidgets: LayoutWidget[] = [
  { id: 'w_header', title: 'Header & Brand Title', type: 'header', section: 'header', order: 1, isEnabled: true },
  { id: 'w_navbar', title: 'Top Navigation Menu', type: 'navbar', section: 'top_bar', order: 2, isEnabled: true },
  { id: 'w_hero', title: 'Featured Post Spotlight', type: 'featured_slider', section: 'hero', order: 3, isEnabled: true },
  { id: 'w_main', title: 'Main Blog Posts Feed', type: 'main_posts', section: 'content_top', order: 4, isEnabled: true },
  { id: 'w_author', title: 'Author Profile Widget', type: 'author_bio', section: 'sidebar', order: 5, isEnabled: true },
  { id: 'w_popular', title: 'Popular Posts Widget', type: 'popular_posts', section: 'sidebar', order: 6, isEnabled: true },
  { id: 'w_adsense', title: 'AdSense Banner (300x250)', type: 'adsense_banner', section: 'sidebar', order: 7, isEnabled: true },
  { id: 'w_categories', title: 'Categories Cloud', type: 'categories', section: 'sidebar', order: 8, isEnabled: true },
  { id: 'w_newsletter', title: 'Newsletter Box', type: 'newsletter', section: 'sidebar', order: 9, isEnabled: true },
  { id: 'w_social', title: 'Social Follow Buttons', type: 'social_follow', section: 'sidebar', order: 10, isEnabled: true },
  { id: 'w_footer_about', title: 'About Site Info', type: 'footer_about', section: 'footer', order: 11, isEnabled: true },
  { id: 'w_footer_links', title: 'Quick Links & Policies', type: 'footer_links', section: 'footer', order: 12, isEnabled: true },
  { id: 'w_footer_copy', title: 'Copyright & Socials', type: 'footer_copyright', section: 'footer', order: 13, isEnabled: true }
];

export const initialAdSlots: AdSlot[] = [
  {
    id: 'ad_header',
    title: 'Top Leaderboard Banner',
    location: 'header_leaderboard',
    isEnabled: true,
    adType: 'custom_banner',
    bannerImageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    targetUrl: 'https://google.com',
    altText: 'হোস্টিং সুপার অফার - ৭০% ছাড়'
  },
  {
    id: 'ad_sidebar',
    title: 'Sidebar Rectangle (300x250)',
    location: 'sidebar_rectangle',
    isEnabled: true,
    adType: 'adsense',
    adsenseSlotId: 'ca-pub-9847291839281729'
  },
  {
    id: 'ad_inpost',
    title: 'In-Post Content Native Ad',
    location: 'in_post_banner',
    isEnabled: true,
    adType: 'custom_banner',
    bannerImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    targetUrl: 'https://ai.studio',
    altText: 'AI Studio দ্বারা স্পনসরকৃত'
  }
];

export const initialMedia: MediaItem[] = [
  {
    id: 'med_1',
    name: 'ai-creative-revolution.jpg',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    type: 'image',
    sizeBytes: 420000,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-15',
    dimensions: { width: 1200, height: 800 }
  },
  {
    id: 'med_2',
    name: 'fullstack-coding-setup.jpg',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    type: 'image',
    sizeBytes: 580000,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-10',
    dimensions: { width: 1200, height: 800 }
  },
  {
    id: 'med_3',
    name: 'digital-earnings-guide.jpg',
    url: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&auto=format&fit=crop&q=80',
    type: 'image',
    sizeBytes: 310000,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-05',
    dimensions: { width: 1200, height: 750 }
  },
  {
    id: 'med_4',
    name: 'mindfulness-nature-peace.jpg',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
    type: 'image',
    sizeBytes: 490000,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-07-28',
    dimensions: { width: 1200, height: 800 }
  }
];

export const initialSettings: SiteSettings = {
  siteName: 'Blogge Pro',
  siteNameBn: 'ব্লগার প্রো (Blogge)',
  tagline: 'The Next-Gen Digital Publishing Platform',
  taglineBn: 'আধুনিক বাংলা ও আন্তর্জাতিক ডিজিটাল পাবলিশিং প্ল্যাটফর্ম',
  description: 'প্রযুক্তি, এআই, ক্যারিয়ার, সাহিত্য ও লাইফস্টাইল নিয়ে নিয়মিত সেরা লেখালেখির নির্ভরযোগ্য প্ল্যাটফর্ম।',
  logoUrl: '',
  faviconUrl: '',
  language: 'bn', // Default Bengali (বাংলা)
  themeId: 'theme_frosted_glass',
  customCss: '/* Custom CSS injected here */\n.post-card:hover { transform: translateY(-4px); transition: all 0.25s ease; }',
  customHeaderHtml: '<!-- Custom Header Scripts (Google Analytics/AdSense) -->',
  customFooterHtml: '<!-- Custom Footer Scripts -->',
  googleAdsensePubId: 'ca-pub-8492049182374928',
  isAdsenseAutoAds: true,
  googleSearchConsoleMeta: '<meta name="google-site-verification" content="blogge-verify-code-xyz" />',
  googleSearchConsoleVerification: '<meta name="google-site-verification" content="blogge-verify-code-xyz" />',
  robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nSitemap: https://blogge.io/sitemap.xml',
  enableComments: true,
  moderateComments: true,
  allowPublicComments: true,
  commentApprovalRequired: false,
  spamFilterKeywords: ['casino', 'viagra', 'free money', 'crypto scam', 'click here for prize'],
  securitySettings: {
    twoFactorRequired: false,
    loginNotifications: true,
    sessionTimeoutMinutes: 60
  },
  adSlots: {
    adsensePublisherId: 'ca-pub-8492049182374928',
    autoAdsEnabled: true,
    headerAdEnabled: true,
    sidebarAdEnabled: true,
    inPostAdEnabled: true,
    footerStickyAdEnabled: false
  },
  donationConfig: {
    isEnabled: true,
    enabled: true,
    title: 'ব্লগটি ভালো লাগলে একটি কফি উপহার দিন!',
    description: 'আপনার ছোট্ট সহযোগিতা আমাদেরকে আরও তথ্যবহুল ও গবেষণাধর্মী কন্টেন্ট তৈরি করতে অনুপ্রেরণা জোগাবে।',
    bkashNumber: '01700-000000',
    nagadNumber: '01800-000000',
    stripeEnabled: true,
    paypalEmail: 'donate@blogge.io'
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    github: 'https://github.com'
  }
};

export const initialLogs: ActivityLog[] = [
  {
    id: 'log_1',
    userId: 'usr_admin',
    userName: 'তানভীর আহমেদ',
    action: 'POST_PUBLISHED',
    actionBn: 'নতুন পোস্ট প্রকাশিত',
    details: '২০২৬ সালে কৃত্রিম বুদ্ধিমত্তা ও জেনারেটিভ এআই বিপ্লব',
    timestamp: '2026-08-15T10:30:00Z',
    ipAddress: '103.145.12.88'
  },
  {
    id: 'log_2',
    userId: 'usr_admin',
    userName: 'তানভীর আহমেদ',
    action: 'SETTINGS_UPDATE',
    actionBn: 'সাইট সেটিংস আপডেট',
    details: 'গুগল অ্যাডসেন্স পাবলিশার আইডি কনফিগার করা হয়েছে',
    timestamp: '2026-08-14T16:20:00Z',
    ipAddress: '103.145.12.88'
  },
  {
    id: 'log_3',
    userId: 'usr_editor',
    userName: 'নুসরাত জাহান',
    action: 'THEME_CUSTOMIZE',
    actionBn: 'থিম পরিবর্তন',
    details: 'Blogger Classic থিম সক্রিয় করা হয়েছে',
    timestamp: '2026-08-12T08:10:00Z',
    ipAddress: '103.111.45.19'
  }
];

export const initialAnalytics = {
  liveVisitors: 0,
  totalViews: 0,
  totalVisitors: 0,
  avgReadingTime: 'No data yet',
  bounceRate: 'No data yet',
  deviceStats: {
    mobile: 0,
    desktop: 0,
    tablet: 0
  },
  countries: [],
  trafficHistory: [],
  sessions: [],
  postViews: []
};

export const initialDonations = [
  {
    id: 'don_1',
    donorName: 'মুনতাসির মাহমুদ (Muntasir)',
    donorEmail: 'muntasir@gmail.com',
    amount: 500,
    currency: 'BDT',
    paymentMethod: 'bkash' as const,
    transactionId: 'BK9A72X81Q',
    reference: 'Coffee Treat',
    status: 'completed' as const,
    isAnonymous: false,
    message: 'অসাধারণ সব বাংলা কন্টেন্ট লেখার জন্য অনেক ধন্যবাদ!',
    receiptNumber: 'RCPT-2026-8819',
    createdAt: '2026-08-20T14:22:00Z'
  },
  {
    id: 'don_2',
    donorName: 'Anonymous Donor',
    donorEmail: '',
    amount: 1000,
    currency: 'BDT',
    paymentMethod: 'nagad' as const,
    transactionId: 'NG4B99182Z',
    reference: 'Support',
    status: 'verified' as const,
    isAnonymous: true,
    message: 'Keep rocking with technology articles!',
    receiptNumber: 'RCPT-2026-8820',
    createdAt: '2026-08-21T09:15:00Z'
  }
];

export const initialPayments = [
  {
    id: 'pay_1',
    userId: 'usr_author',
    userEmail: 'rafid@blogge.io',
    planId: 'pro_monthly',
    planName: 'Blogger Pro VIP Membership',
    amount: 9.99,
    currency: 'USD',
    status: 'paid' as const,
    paymentMethod: 'stripe',
    transactionId: 'ch_3N84x92819827391',
    invoiceNumber: 'INV-2026-0041',
    createdAt: '2026-08-10T12:00:00Z'
  }
];

export const initialCampaigns = [
  {
    id: 'camp_1',
    subject: '২০২৬ সালের সেরা টেক ব্লগ সামারি ও বিশেষ এআই গাইড',
    content: 'প্রিয় পাঠক, এ সপ্তাহের সেরা টেকনোলজি আর্টিকেলের নির্বাচিত সংকলন আপনার জন্য...',
    sentAt: '2026-08-18T16:00:00Z',
    status: 'sent' as const,
    recipientCount: 1240,
    openRate: 48.5
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'নতুন মন্তব্য এসেছে',
    message: 'আপনার "২০২৬ সালে কৃত্রিম বুদ্ধিমত্তা ও জেনারেটিভ এআই বিপ্লব" আর্টিকেলে একটি নতুন মন্তব্য করা হয়েছে।',
    time: '৫ মিনিট আগে',
    read: false,
    type: 'comment',
    targetId: 'post_1'
  },
  {
    id: 'n2',
    title: 'নতুন সাবস্ক্রাইবার যোগ হয়েছেন!',
    message: 'techfan@gmail.com আপনার নিউজলেটারে সাবস্ক্রাইব করেছেন।',
    time: '১ ঘণ্টা আগে',
    read: false,
    type: 'subscriber'
  },
  {
    id: 'n3',
    title: 'নতুন ডোনেশন প্রাপ্তি',
    message: 'মাহমুদুল হক এর কাছ থেকে ৫০০ BDT ডোনেশন ভেরিফাইড হয়েছে।',
    time: '৩ ঘণ্টা আগে',
    read: false,
    type: 'donation'
  },
  {
    id: 'n4',
    title: 'গুগল সার্চ কনসোল ইনডেক্সিং সফল',
    message: 'আপনার ব্লগের সকল সাইটম্যাপ সফলভাবে ইনডেক্স করা হয়েছে।',
    time: 'গতকাল',
    read: true,
    type: 'system'
  }
];

