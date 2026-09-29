import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Tv, FileText, MessageSquare } from 'lucide-react';

const programs = [
  {
    num: '01', tag: 'Class 8–10', title: 'Foundation',
    desc: 'Build strong fundamentals. Integrated prep for boards with NEET & JEE introduction.',
    courses: [
      '1-year integrated with class 10th for Board | NEET | JEE',
      '2-year integrated with class 10th for Board | NEET | JEE',
    ],
    dark: false, accent: '#FB0500',
  },
  {
    num: '02', tag: 'NEET', title: 'Medical',
    desc: 'Crack NEET with structured programs led by experienced medical faculty.',
    badges: ['12th Integrated', '11th-12th Integrated', 'NEET Dropper'],
    courses: [
      '1-year integrated program class 12th',
      '2-year integrated classroom 11th & 12th',
      '1-year dropper course for NEET',
    ],
    dark: true, accent: '#0078FF',
  },
  {
    num: '03', tag: 'IIT-JEE', title: 'Engineering',
    desc: 'Master PCM with JEE-focused curriculum and intensive test series.',
    badges: ['12th Integrated', '11th-12th Integrated', 'JEE Dropper'],
    courses: [
      '1-year integrated program class 12th',
      '2-year integrated classroom 11th & 12th',
      '1-year dropper course for IIT-JEE',
    ],
    dark: false, accent: '#FB0500',
  },
];

const ProgramPage = () => (
  <div className="bg-dot-grid py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Our Programs</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Choose your stream</h2>
        </div>
        <Link to="/course" className="text-sm font-bold text-gray-900 border-b-2 border-gray-200 hover:border-[#FB0500] hover:text-[#FB0500] transition-colors pb-0.5 self-end">
          View all courses →
        </Link>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* Card 01 — Foundation */}
        <div className="md:col-span-5 bg-white rounded-md p-7 flex flex-col justify-between border border-gray-200 hover:border-[#FB0500]/40 hover:shadow-md transition-all group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm bg-red-50 text-[#FB0500] border border-red-100">{programs[0].tag}</span>
              <span className="text-6xl font-black text-gray-200 group-hover:text-[#FB0500]/20 transition-colors leading-none">{programs[0].num}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FB0500] transition-colors">{programs[0].title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{programs[0].desc}</p>
            <ul className="space-y-3">
              {programs[0].courses.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-sm bg-[#FB0500] flex-shrink-0" />
                  <span className="text-sm text-gray-600 font-medium">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/course" className="mt-8 block w-full">
            <button className="w-full py-3 rounded-md text-sm font-bold bg-[#FB0500] text-white hover:opacity-90 transition shadow-sm">
              Explore Foundation →
            </button>
          </Link>
        </div>

        {/* Right column */}
        <div className="md:col-span-7 grid grid-rows-2 gap-5">

          {/* Card 02 — Medical */}
          <div className="bg-white rounded-md p-7 flex flex-col justify-between group border border-gray-200 hover:border-[#0078FF]/40 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0078FF]/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm bg-blue-50 text-[#0078FF] border border-blue-100">{programs[1].tag}</span>
                <span className="text-6xl font-black text-gray-200 group-hover:text-[#0078FF]/20 transition-colors leading-none">{programs[1].num}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#0078FF] transition-colors">{programs[1].title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{programs[1].desc}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="flex gap-2 flex-wrap">
                {programs[1].badges.map((b, i) => (
                  <span key={i} className="text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-sm border border-gray-200">{b}</span>
                ))}
              </div>
              <Link to="/course" className="flex-shrink-0">
                <button className="w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-bold bg-[#0078FF] text-white hover:opacity-90 transition shadow-sm">
                  Enroll Now →
                </button>
              </Link>
            </div>
          </div>

          {/* Card 03 — Engineering */}
          <div className="bg-white rounded-md p-7 flex flex-col justify-between border border-gray-200 hover:border-[#FB0500]/40 hover:shadow-md transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm bg-red-50 text-[#FB0500] border border-red-100">{programs[2].tag}</span>
                <span className="text-6xl font-black text-gray-200 group-hover:text-[#FB0500]/20 transition-colors leading-none">{programs[2].num}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FB0500] transition-colors">{programs[2].title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{programs[2].desc}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="flex gap-2 flex-wrap">
                {programs[2].badges.map((b, i) => (
                  <span key={i} className="text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-sm border border-gray-200">{b}</span>
                ))}
              </div>
              <Link to="/course" className="flex-shrink-0">
                <button className="w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-bold bg-gray-900 text-white hover:bg-[#FB0500] transition-colors shadow-sm">
                  Explore Engineering →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: GraduationCap, label: 'Expert Faculty', color: 'border-red-100 text-[#FB0500]', bg: 'bg-red-50' },
          { icon: Tv, label: 'Live Classes', color: 'border-blue-100 text-[#0078FF]', bg: 'bg-blue-50' },
          { icon: FileText, label: 'Test Series', color: 'border-red-100 text-[#FB0500]', bg: 'bg-red-50' },
          { icon: MessageSquare, label: '24/7 Support', color: 'border-blue-100 text-[#0078FF]', bg: 'bg-blue-50' },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="bg-white rounded-xl px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-all">
              <div className={`w-9 h-9 rounded-lg ${f.bg} border ${f.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${f.color.split(' ')[1]}`} />
              </div>
              <span className="text-sm font-bold text-gray-800">{f.label}</span>
            </div>
          );
        })}
      </div>

    </div>
  </div>
);

export default ProgramPage;
