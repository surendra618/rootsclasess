import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../services/endpoints';
import {
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  X,
  Search,
  Clock,
  ChevronRight,
  Tag,
  CheckCircle2,
  Mail,
  Sparkles,
  TrendingUp,
  Share2,
  Flame,
  Bookmark
} from 'lucide-react';

const FALLBACK_BLOGS = [
  {
    _id: 'fb-1',
    title: '10 Proven Strategies to Crack NEET & JEE Physics with Top Ranks',
    content: `Physics is often considered one of the most challenging subjects for competitive exam aspirants. However, with the right approach, conceptual clarity, and systematic problem-solving strategies, you can turn Physics into your highest-scoring subject.\n\n1. Focus on Fundamental Concepts: Don't memorize formulas without understanding their derivation and real-world application.\n2. Daily Numerical Practice: Solve at least 30-40 numerical problems daily across different topics.\n3. Master Previous Year Questions (PYQs): Analyze the last 10 years of question papers to identify high-weightage chapters like Mechanics, Electrodynamics, and Modern Physics.\n4. Time Management: Practice speed and accuracy by taking timed sectional tests weekly.`,
    category: 'Exam Prep',
    author: 'Surendra Sir & Physics Dept',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=1000&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
    isFeatured: true,
    readTime: '5 min read'
  },
  {
    _id: 'fb-2',
    title: 'How Rohit Scored 690/720 in NEET: Preparation Roadmap & Notes Strategy',
    content: `Success in national entrance exams isn't about studying 18 hours a day — it's about studying smart. Here is how Rohit Kumar, one of Root Classes top performers, structured his preparation.\n\nRohit emphasized NCERT line-by-line reading for Biology and Chemistry, maintaining concise revision short notes, and taking full-length mock tests every Sunday followed by 2 hours of thorough mistake analysis.`,
    category: 'Success Stories',
    author: 'Student Success Team',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    readTime: '4 min read'
  },
  {
    _id: 'fb-3',
    title: 'Essential Organic Chemistry Reaction Mechanisms Every Student Must Know',
    content: `Organic Chemistry can seem daunting with hundreds of reactions and mechanisms. By mastering key mechanisms such as SN1, SN2, Electrophilic Addition, and Nucleophilic Substitution, you can predict outputs effortlessly.\n\nKeep a dedicated reaction notebook with visual charts for quick revision before board and entrance exams.`,
    category: 'Study Tips',
    author: 'Chemistry Faculty',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    readTime: '6 min read'
  },
  {
    _id: 'fb-4',
    title: 'Class 10 CBSE Board 2026: High-Weightage Chapters in Science & Math',
    content: `Maximize your board score by focusing strategically on chapters that consistently carry the highest marks. In Science: Electricity, Light & Carbon Compounds account for nearly 40% of the theory paper.\n\nPractice NCERT Exemplar questions and solve at least 5 sample papers under strict exam conditions.`,
    category: 'Updates',
    author: 'Root Academic Council',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    readTime: '4 min read'
  }
];

const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getExcerpt = (content, maxLength = 130) => {
  if (!content) return 'No summary available.';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

// Standard Blog Card (No shadows, rounded-md, crisp borders)
const BlogCard = ({ blog, onClick }) => {
  const cardImage = (blog.title?.toLowerCase().includes('iit') || blog.image?.includes('atpstar'))
    ? '/iit_jee_prep_hd.jpg'
    : (blog.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format');

  return (
    <article
      onClick={() => onClick({ ...blog, image: cardImage })}
      className="group cursor-pointer bg-white rounded-md border border-slate-200 overflow-hidden hover:border-[#0078FF] transition-colors flex flex-col"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={cardImage}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/iit_jee_prep_hd.jpg';
          }}
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 bg-white/95 border border-slate-200 rounded-md text-[10px] font-bold text-slate-800 uppercase tracking-wider">
            {blog.category || 'Education'}
          </span>
        </div>
      </div>

    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400 mb-2.5">
        <span className="flex items-center gap-1">
          <Calendar size={12} className="text-[#FB0500]" /> {formatDate(blog.createdAt)}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock size={12} className="text-[#0078FF]" /> {blog.readTime || '4 min read'}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#0078FF] transition-colors line-clamp-2 leading-snug">
        {blog.title}
      </h3>

      <p className="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed flex-1">
        {getExcerpt(blog.content)}
      </p>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
            <User size={12} />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[130px]">
            {blog.author || 'Root Faculty'}
          </span>
        </div>

        <span className="text-xs font-bold text-slate-900 flex items-center gap-1 group-hover:text-[#0078FF] group-hover:translate-x-0.5 transition-transform">
          Read <ChevronRight size={13} className="text-[#FB0500]" />
        </span>
      </div>
    </div>
  </article>
  );
};

// Blog Reader Modal (Clean rounded-md, no heavy shadows)
const BlogDetail = ({ blog, onClose }) => {
  if (!blog) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 pb-8 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-md border border-slate-200 flex flex-col my-auto z-10">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FB0500]" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Root Knowledge Hub</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="h-64 sm:h-72 w-full relative bg-slate-100 overflow-hidden">
            <img
              src={blog.image}
              className="w-full h-full object-cover"
              alt={blog.title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format';
              }}
            />
          </div>

          <div className="px-6 sm:px-10 py-6 sm:py-8">
            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-semibold text-slate-500">
              <span className="px-2.5 py-1 bg-red-50 text-[#FB0500] border border-red-200 rounded-md font-bold uppercase tracking-wider text-[10px]">
                {blog.category || 'Education'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" /> {formatDate(blog.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <User size={13} className="text-slate-400" /> By {blog.author || 'Root Faculty'}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 mb-5 leading-snug">
              {blog.title}
            </h1>

            <div className="text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base border-t border-slate-100 pt-5 pb-8 whitespace-pre-line font-normal">
              {blog.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const dynamicCategories = ['All', ...new Set(blogs.map(b => b.category).filter(Boolean))];
  const categories = dynamicCategories.length > 1 ? dynamicCategories : ['All', 'Exam Prep', 'Success Stories', 'Updates', 'Study Tips'];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await axios.post(api.blog.getblog);
        const data = res.data?.data?.data || res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setBlogs(data);
        } else {
          setBlogs(FALLBACK_BLOGS);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setBlogs(FALLBACK_BLOGS);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.content && b.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = activeCategory === 'All' || b.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featuredBlog = blogs.find(b => b.isFeatured) || blogs[0];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setEmailInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-9 h-9 border-2 border-slate-200 border-t-[#0078FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-[#FB0500] selection:text-white">

      {/* ── 1. Hero Section with Rich Technical Background ────────────────────────── */}
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-100/70 pt-10 pb-12 md:pt-14 md:pb-16 border-b border-slate-200 overflow-hidden">
        
        {/* Crisp Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.45] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Dual Accent Blooms */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#FB0500]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-20 w-96 h-96 bg-[#0078FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Technical Corner Markers */}
        <div className="hidden md:block absolute top-6 left-10 text-slate-300 font-mono text-xs select-none pointer-events-none">
          + ——— [ ROOT_ACADEMY : KNOWLEDGE_FEED ]
        </div>
        <div className="hidden md:block absolute top-6 right-10 text-slate-300 font-mono text-xs select-none pointer-events-none">
          [ EXAM_PREP & STRATEGIES ] ——— +
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 px-4 sm:px-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200 mb-3.5">
            <span className="w-2 h-2 rounded-full bg-[#FB0500] animate-ping" />
            <span className="text-[10px] font-bold text-slate-700 tracking-wider uppercase">
              The Roots Knowledge Base
            </span>
            <span className="text-[10px] font-bold text-[#0078FF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Updated Daily
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Expert Insights &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB0500] via-[#0078FF] to-blue-700">
              Exam Guidance.
            </span>
          </h1>

          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
            Stay updated with the latest competitive exam strategies, subject tips, and inspiring student success stories from top mentors.
          </p>

          {/* Clean Rounded-md Search Input (No Shadows) */}
          <div className="max-w-lg mx-auto relative">
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 pl-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0078FF] transition-colors"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. Category Navigation Bar (Clean rounded-md, no shadow) ── */}
      <div className="sticky top-[72px] z-20 bg-white border-b border-slate-200 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 whitespace-nowrap flex items-center gap-1.5">
              <Tag size={13} className="text-[#0078FF]" /> Topic:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#0078FF] text-white border border-[#0078FF]'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium text-slate-400 shrink-0 hidden sm:block">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'}
          </span>
        </div>
      </div>

      {/* ── 3. Main Content Area ────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Featured Article Banner (Only on "All" and when not searching) */}
        {activeCategory === 'All' && !searchTerm && featuredBlog && (() => {
          const isJeeOrLowRes =
            featuredBlog.title?.toLowerCase().includes('iit') ||
            featuredBlog.title?.toLowerCase().includes('jee') ||
            featuredBlog.image?.includes('atpstar') ||
            !featuredBlog.image;
          const displayImage = isJeeOrLowRes ? '/iit_jee_prep_hd.jpg' : featuredBlog.image;

          return (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FB0500]" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Featured Masterclass Spotlight
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#FB0500] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md">
                  Must Read for Aspirants
                </span>
              </div>

              <div
                onClick={() => {
                  setSelectedBlog({
                    ...featuredBlog,
                    image: displayImage
                  });
                  document.body.style.overflow = 'hidden';
                }}
                className="group cursor-pointer bg-white rounded-md border border-slate-200 overflow-hidden hover:border-[#0078FF] transition-colors grid grid-cols-1 lg:grid-cols-12"
              >
                {/* Left: HD Clean Image (5 Cols) */}
                <div className="lg:col-span-5 min-h-[260px] sm:min-h-[320px] lg:min-h-[420px] relative bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={displayImage}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/iit_jee_prep_hd.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                  <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-[#FB0500] text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                    ⭐ TOP RECOMMENDED
                  </span>
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white text-[11px] font-semibold flex items-center justify-between bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-md border border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Complete Preparation Guide
                    </span>
                    <span className="text-slate-300">HD Read</span>
                  </div>
                </div>

                {/* Right: Rich, Full Content (7 Cols) */}
                <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between bg-white">
                  <div>
                    {/* Header meta */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 mb-2.5">
                      <span className="text-[#FB0500] font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-md text-[10px] uppercase">
                        {featuredBlog.category || 'Exam Prep'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {formatDate(featuredBlog.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#0078FF] font-bold">
                        <Clock size={12} /> 6 Min Comprehensive Read
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 mb-2.5 group-hover:text-[#0078FF] transition-colors leading-snug">
                      {featuredBlog.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 font-normal">
                      Cracking national entrance exams like IIT-JEE on your very first attempt demands a disciplined balance between in-depth conceptual clarity, rigorous daily numerical targets, and systematic error analysis.
                    </p>

                    {/* 4 Strategy Pillars / Key Highlights (Fills the right side cleanly) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                          🎯 Concept Derivations
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Master foundational derivations in Mechanics, Electrodynamics & Organic mechanisms.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                          ⚡ 40+ Daily PYQ Target
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Solve graded chapter numericals with a dedicated mistake logbook.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                          📊 Weekly NTA Mock Tests
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Full-length CBT mock simulations with 2-hour mistake analysis.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-0.5">
                          📋 Formula Mind Maps
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Maintain high-yield quick revision sheets for rapid exam recall.
                        </p>
                      </div>
                    </div>

                    {/* Quick Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ⭐ Top 1% Ranker Secrets
                      </span>
                      <span className="text-[10px] font-bold text-[#0078FF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        📚 Formula Sheets Included
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        🎓 Mentored by Surendra Sir
                      </span>
                    </div>
                  </div>

                  {/* Bottom Author & CTA Row */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-[#0078FF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        SS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">Surendra Sir & Senior Faculty</p>
                        <p className="text-[10px] text-slate-400">Physics HOD & Academic Council</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="py-2 px-4 rounded-md bg-[#FB0500] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {searchTerm
              ? `Search Results for "${searchTerm}"`
              : activeCategory === 'All'
              ? 'All Latest Articles'
              : `${activeCategory} Articles`}
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Showing {filteredBlogs.length} results
          </span>
        </div>

        {/* Articles Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-md border border-slate-200 p-8">
            <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">No articles found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try searching with another keyword or pick a different topic filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
              }}
              className="px-4 py-2 bg-[#0078FF] hover:bg-blue-600 text-white rounded-md font-bold text-xs transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBlogs.map((blog, idx) => (
              <BlogCard
                key={blog._id || idx}
                blog={blog}
                onClick={(b) => {
                  setSelectedBlog(b);
                  document.body.style.overflow = 'hidden';
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── 4. Newsletter Banner (Clean rounded-md, no shadow) ──────── */}
      <section className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-md p-6 sm:p-8 text-center border border-slate-200 bg-slate-50">
          <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 text-[#0078FF] flex items-center justify-center mx-auto mb-3">
            <Mail size={18} />
          </div>

          <span className="text-[10px] font-bold text-[#FB0500] uppercase tracking-wider bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-md inline-block mb-2">
            ROOT INSIGHTS NEWSLETTER
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Stay Updated with Expert Exam Strategies
          </h2>

          <p className="text-slate-600 mb-6 max-w-md mx-auto text-xs leading-relaxed">
            Get exclusive test notifications, preparation roadmaps, and high-weightage study notes delivered directly to your inbox.
          </p>

          {subscribed ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Thank you! You have successfully subscribed.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-white border border-slate-300 rounded-md px-3.5 py-2 text-slate-900 placeholder:text-slate-400 text-xs outline-none focus:border-[#0078FF] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#0078FF] hover:bg-blue-600 text-white px-5 py-2 rounded-md text-xs font-bold transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Subscribe Free</span>
                <Sparkles size={13} />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <BlogDetail
          blog={selectedBlog}
          onClose={() => {
            setSelectedBlog(null);
            document.body.style.overflow = 'auto';
          }}
        />
      )}

    </div>
  );
};

export default Blog;