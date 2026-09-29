import React from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Users, Target, CheckCircle2, Star, Sparkles, ArrowRight } from 'lucide-react';
import Experts from '../../components/Home/Experts';
import Testimonial from '../../components/Home/Testimonial';
import WhyChooseUs from '../../components/Home/WhyChooseUs';
import SEO from '../../components/common/SEO';

const stats = [
  { value: '10,000+', label: 'Students Mentored' },
  { value: '98%', label: 'Success Rate' },
  { value: '50+', label: 'Expert Faculty' },
  { value: '15+', label: 'Years of Excellence' },
];

const values = [
  {
    icon: Target,
    title: 'Result-Oriented Learning',
    description: 'Structured pedagogy, curated study material, and regular test series designed to maximize exam scores.',
    color: 'bg-red-50 text-[#FB0500] border-red-200'
  },
  {
    icon: Users,
    title: 'Top-Tier Mentorship',
    description: 'Guidance from experienced educators and subject matter experts with proven track records.',
    color: 'bg-blue-50 text-[#0078FF] border-blue-200'
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Curriculum',
    description: 'In-depth coverage of syllabus with conceptual clarity, shortcut techniques, and doubts resolution.',
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  {
    icon: Award,
    title: 'Scholarship & Support',
    description: 'Merit-based scholarships and continuous support to empower deserving learners from all backgrounds.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  }
];

const About = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="About Roots Classes | Best JEE & NEET Coaching Academy in Ludhiana"
        description="Learn more about Roots Classes Ludhiana. 15+ years of excellence in coaching for IIT-JEE, NEET-UG, Olympiads, and Foundation batches."
        keywords="About Roots Classes, Best Coaching Institute in Ludhiana, Top JEE Institute Ludhiana, NEET Faculty Ludhiana"
        canonical="https://rootsclasses.in/about"
      />
      {/* Hero Header */}
      <section className="relative bg-[#0b0f19] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-red-900/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold tracking-wide uppercase text-blue-300 mb-6 border border-white/10">
            <Sparkles size={14} className="text-[#FB0500]" /> Empowering Future Leaders
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            About <span className="text-[#FB0500]">Roots</span> Classes
          </h1>
          <p className="mt-5 text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            We are committed to delivering premier education, personalized mentoring, and rigorous academic training for competitive and board examinations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/course"
              className="px-6 py-3 rounded-lg bg-[#FB0500] hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition duration-200 inline-flex items-center gap-2"
            >
              Explore Courses <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-6xl mx-auto -mt-10 px-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-6 sm:p-8">
          {stats.map((item, idx) => (
            <div key={idx} className="text-center py-3 md:py-0">
              <div className="text-2xl sm:text-4xl font-extrabold text-[#0078FF]">{item.value}</div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FB0500]">Our Purpose</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 leading-tight">
              Shaping Academic Success With Integrity & Passion
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
              Founded with the vision to bridge the gap between hard work and real competitive results, Roots Classes provides an all-inclusive ecosystem for students striving to excel in Board, JEE, NEET, and Olympiad examinations.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed text-sm sm:text-base">
              Our holistic methodology combines conceptual depth, extensive problem-solving drills, adaptive testing, and one-on-one doubt resolution sessions.
            </p>

            <div className="mt-6 space-y-3">
              {[
                'Expert faculties with decades of combined teaching experience',
                'Comprehensive study packages and digital test series',
                'Small batch sizes ensuring personalized attention',
                'Continuous performance tracking & parent-teacher interaction'
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#FB0500] shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${val.color} mb-4`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{val.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us & Faculty Section */}
      <WhyChooseUs />
      <Experts />
      <Testimonial />
    </div>
  );
};

export default About;
