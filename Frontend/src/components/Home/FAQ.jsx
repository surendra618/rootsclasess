import React, { useState } from 'react';

const faqs = [
  { q: 'What courses does Roots Classes offer?', a: 'We offer Foundation (Class 8–10), Medical (NEET), and Engineering (IIT-JEE) programs — both classroom and online. Each includes live classes, recordings, test series, and doubt sessions.' },
  { q: 'How are the online classes conducted?', a: 'Live via our platform with recordings available 24/7. You also get PDF notes, practice sheets, and weekly tests included.' },
  { q: 'Is there an EMI option for course fees?', a: 'Yes — flexible monthly installment plans are available. Contact our counselors for a plan that fits your budget.' },
  { q: 'How do I enroll in a course?', a: 'Enroll directly on the website, visit our Ludhiana center, or call +91 98775-15330 for assisted enrollment.' },
  { q: 'Do you provide study material?', a: 'Yes — chapter-wise notes, DPPs, previous year papers, and formula booklets are provided to all enrolled students.' },
  { q: 'Is there a scholarship program?', a: 'Yes — up to 100% scholarship based on a merit-cum-need test. Students from EWS backgrounds get additional concessions.' },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);

  return (
    <div className="bg-dot-grid py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left label */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Frequently<br />Asked<br />
              <span className="text-[#FB0500]">Questions</span>
            </h2>
            <p className="text-sm text-gray-400 mt-6 leading-relaxed">
              Everything you need to know before joining. Can't find your answer?{' '}
              <a href="/contact" className="text-[#FB0500] hover:underline font-medium">Contact us →</a>
            </p>
          </div>

          {/* Right accordion */}
          <div className="lg:col-span-8 divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className={`text-sm font-semibold pr-8 transition-colors ${open === i ? 'text-[#FB0500]' : 'text-gray-800 group-hover:text-[#FB0500]'}`}>
                    {faq.q}
                  </span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${open === i ? 'bg-[#FB0500] rotate-45' : 'bg-gray-100'}`}>
                    <svg className="w-3 h-3" fill="none" stroke={open === i ? 'white' : '#6b7280'} viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <p className="pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FAQ;
