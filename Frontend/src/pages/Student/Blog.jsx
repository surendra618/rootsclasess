import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../services/endpoints';
import { BookOpen, Calendar, User, ArrowRight, X, Search, Clock, ChevronRight, Share2, Tag, CheckCircle2, Mail, Sparkles } from 'lucide-react';

const FALLBACK_BLOGS = [
  {
    _id: 'fb-1',
    title: '10 Proven Strategies to Crack NEET & JEE Physics with Top Ranks',
    content: `Physics is often considered one of the most challenging subjects for competitive exam aspirants. However, with the right approach, conceptual clarity, and systematic problem-solving strategies, you can turn Physics into your highest-scoring subject.\n\n1. Focus on Fundamental Concepts: Don't memorize formulas without understanding their derivation and real-world application.\n2. Daily Numerical Practice: Solve at least 30-40 numerical problems daily across different topics.\n3. Master Previous Year Questions (PYQs): Analyze the last 10 years of question papers to identify high-weightage chapters like Mechanics, Electrodynamics, and Modern Physics.\n4. Time Management: Practice speed and accuracy by taking timed sectional tests weekly.`,
    category: 'Exam Prep',
    author: 'Physics Dept, Root Faculty',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'fb-2',
    title: 'How Rohit Scored 690/720 in NEET: Preparation Roadmap & Notes Strategy',
    content: `Success in national entrance exams isn't about studying 18 hours a day — it's about studying smart. Here is how Rohit Kumar, one of Root Classes top performers, structured his preparation.\n\nRohit emphasized NCERT line-by-line reading for Biology and Chemistry, maintaining concise revision short notes, and taking full-length mock tests every Sunday followed by 2 hours of thorough mistake analysis.`,
    category: 'Success Stories',
    author: 'Student Success Team',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    _id: 'fb-3',
    title: 'Essential Organic Chemistry Reaction Mechanisms Every Student Must Know',
    content: `Organic Chemistry can seem daunting with hundreds of reactions and mechanisms. By mastering key mechanisms such as SN1, SN2, Electrophilic Addition, and Nucleophilic Substitution, you can predict outputs effortlessly.\n\nKeep a dedicated reaction notebook with visual charts for quick revision before exams.`,
    category: 'Study Tips',
    author: 'Chemistry Dept, Root Faculty',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
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

// Standard Blog Card
const BlogCard = ({ blog, onClick }) => (
  <div
    onClick={() => onClick(blog)}
    className="group cursor-pointer bg-white rounded-md border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col"
  >
    <div className="relative h-48 overflow-hidden bg-slate-100">
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format"; }}
      />
      <div className="absolute top-3 left-3">
        <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-sm text-[10px] font-bold text-slate-800 uppercase tracking-wider shadow-xs border border-slate-200">
          {blog.category || 'Education'}
        </span>
      </div>
    </div>

    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 mb-2.5">
        <span className="flex items-center gap-1"><Calendar size={12} className="text-[#FB0500]" /> {formatDate(blog.createdAt)}</span>
        <span>•</span>
        <span className="flex items-center gap-1"><Clock size={12} className="text-[#0078FF]" /> 4 min read</span>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-2.5 group-hover:text-[#0078FF] transition-colors line-clamp-2 leading-snug">
        {blog.title}
      </h3>

      <p className="text-xs text-slate-500 mb-5 line-clamp-3 leading-relaxed flex-1">
        {getExcerpt(blog.content)}
      </p>

      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
            <User size={12} />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[120px]">{blog.author || 'Root Faculty'}</span>
        </div>

        <span className="text-xs font-bold text-slate-900 flex items-center gap-1 group-hover:text-[#0078FF] group-hover:translate-x-0.5 transition-all">
          Read <ChevronRight size={13} className="text-[#FB0500]" />
        </span>
      </div>
    </div>
  </div>
);

// Blog Reader Modal
const BlogDetail = ({ blog, onClose }) => {
  if (!blog) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 pb-8 overflow-y-auto animate-fadeIn">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-sm border border-slate-200 shadow-2xl flex flex-col animate-slideUp my-auto z-10">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB0500]" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Root Insights Article</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Close Article"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar">
          <div className="h-64 sm:h-80 md:h-96 w-full relative bg-slate-100 overflow-hidden">
            <img
              src={blog.image}
              className="w-full h-full object-cover"
              alt={blog.title}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format"; }}
            />
          </div>

          <div className="px-6 sm:px-12 py-8">
            <div className="flex flex-wrap items-center gap-4 mb-5 text-xs font-semibold text-slate-500">
              <span className="px-3 py-1 bg-red-50 text-[#FB0500] border border-red-200 rounded-sm font-bold uppercase tracking-wider text-[10px]">
                {blog.category || 'Education'}
              </span>
              <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> {formatDate(blog.createdAt)}</span>
              <span className="flex items-center gap-1.5"><User size={13} className="text-slate-400" /> By {blog.author || 'Root Faculty'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base border-t border-slate-100 pt-6 pb-12 whitespace-pre-line">
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

  const categories = ['All', 'Exam Prep', 'Success Stories', 'Updates', 'Study Tips'];

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
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.content && b.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = activeCategory === 'All' || b.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setEmailInput('');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-[#0078FF] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading articles...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Refined Header Banner with Glowing Background */}
      <section className="bg-gradient-to-b from-blue-50/70 via-slate-50 to-white border-b border-slate-200 pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Dot Pattern & Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="text-xs font-bold text-[#FB0500] uppercase tracking-[0.25em] mb-3 inline-block bg-red-50/90 border border-red-100 px-3.5 py-1 rounded-sm shadow-2xs">
            The Roots Blog
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Expert Insights & <span className="text-[#0078FF]">Guidance</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
            Stay updated with the latest competitive exam strategies, subject tips, and inspiring performer stories.
          </p>

          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/95 backdrop-blur-md border border-slate-300 rounded-full px-5 py-3.5 pl-11 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0078FF]/15 focus:border-[#0078FF] text-sm shadow-md transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <div className="sticky top-[80px] z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 whitespace-nowrap flex items-center gap-1">
            <Tag size={13} className="text-[#0078FF]" /> Topic:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat
                  ? 'bg-[#0078FF] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-md border border-dashed border-slate-300 p-8">
            <BookOpen size={44} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No articles found</h3>
            <p className="text-xs text-slate-500 mb-4">Try searching with a different term or select another category.</p>
            <button
              onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
              className="px-4 py-2 bg-[#0078FF] text-white rounded-md font-bold text-xs hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog, idx) => (
              <BlogCard
                key={blog._id || idx}
                blog={blog}
                onClick={(b) => { setSelectedBlog(b); document.body.style.overflow = 'hidden'; }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Newsletter CTA Footer Banner - Clean White Theme */}
      <section className="bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100 border-t border-slate-200 py-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Dot Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-4xl mx-auto bg-white rounded-sm p-8 sm:p-12 text-center border border-slate-200 shadow-sm relative z-10">
          <div className="w-10 h-10 rounded-sm bg-blue-50 border border-blue-100 text-[#0078FF] flex items-center justify-center mx-auto mb-4">
            <Mail size={20} />
          </div>

          <span className="text-[10px] font-bold text-[#FB0500] uppercase tracking-[0.2em] bg-red-50 border border-red-100 px-3 py-1 rounded-sm inline-block mb-3">
            ROOT INSIGHTS NEWSLETTER
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Stay Updated with Expert Exam Strategies
          </h2>

          <p className="text-slate-600 mb-8 max-w-md mx-auto text-xs sm:text-sm font-medium leading-relaxed">
            Get exclusive test notifications, preparation roadmaps, and study materials delivered directly to your inbox.
          </p>

          {subscribed ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-sm text-sm font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Thank you! You have successfully subscribed.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-white border border-slate-300 rounded-sm px-4 py-2.5 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] transition-all"
              />
              <button
                type="submit"
                className="bg-[#0078FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-sm text-sm font-bold transition-all shadow-xs whitespace-nowrap flex items-center justify-center gap-2"
              >
                Subscribe Free
                <Sparkles size={15} />
              </button>
            </form>
          )}
        </div>
      </section>

      {selectedBlog && (
        <BlogDetail
          blog={selectedBlog}
          onClose={() => { setSelectedBlog(null); document.body.style.overflow = 'auto'; }}
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Blog;