import React from 'react';

const reasons = [
  { num: '01', title: 'Expert Faculty',          desc: 'Learn from IIT/AIIMS alumni and educators with proven NEET & JEE results year after year.', accent: '#FB0500', bg: 'bg-red-50',  border: 'border-red-100' },
  { num: '02', title: 'Live & Recorded Classes', desc: 'Attend live sessions or watch recordings at your own pace — anytime, anywhere.',            accent: '#0078FF', bg: 'bg-blue-50', border: 'border-blue-100' },
  { num: '03', title: 'Regular Test Series',     desc: 'Weekly chapter tests, full-length mocks, and detailed analytics to track progress.',         accent: '#FB0500', bg: 'bg-red-50',  border: 'border-red-100' },
  { num: '04', title: 'Personal Doubt Sessions', desc: 'One-on-one doubt clearing, dedicated WhatsApp groups, and personal mentorship.',              accent: '#0078FF', bg: 'bg-blue-50', border: 'border-blue-100' },
];

const WhyChooseUs = () => (
  <div className="bg-line-grid py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

        {/* Left sticky */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Why Roots Classes</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Everything you need to
            <span className="block mt-1 relative w-fit">
              crack your exam
              <span className="absolute left-0 -bottom-1 w-full h-1 bg-[#FB0500] rounded-sm" />
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-6 leading-relaxed">
            Structured, focused, and results-driven programs trusted by thousands of students across Punjab.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-md p-4 border border-gray-200 shadow-sm hover:border-[#FB0500]/40 transition-all">
              <div className="text-2xl font-black text-[#FB0500]">10K+</div>
              <div className="text-xs font-medium text-gray-500 mt-0.5">Students</div>
            </div>
            <div className="bg-white rounded-md p-4 border border-gray-200 shadow-sm hover:border-[#0078FF]/40 transition-all">
              <div className="text-2xl font-black text-[#0078FF]">98%</div>
              <div className="text-xs font-medium text-gray-500 mt-0.5">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Right numbered list */}
        <div className="lg:col-span-8 space-y-4">
          {reasons.map((r) => (
            <div key={r.num} className="bg-white rounded-md p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all flex items-start gap-5 group">
              <div className={`flex-shrink-0 w-11 h-11 rounded-md ${r.bg} border ${r.border} flex items-center justify-center mt-0.5`}>
                <span className="text-sm font-black" style={{ color: r.accent }}>{r.num}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-[#FB0500] transition-colors">{r.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
);

export default WhyChooseUs;
