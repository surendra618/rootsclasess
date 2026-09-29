import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../services/endpoints';
import VideoCarousel from './VideoCarousel';
import ReactFastMarquee from "react-fast-marquee";

const Marquee = ReactFastMarquee.default || ReactFastMarquee;

/* alternate red/blue per card */
const cardAccents = ['#FB0500','#0078FF','#FB0500','#0078FF','#FB0500','#0078FF'];

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const GetTestinomial = async () => {
    try {
      setLoading(true);
      const res = await axios.post(api.testimonial.getTestimonial);
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTestimonials(res.data.data.map((item, i) => ({
          id: item._id, name: item.name, image: item.image,
          achievement: item.achievement, rating: parseInt(item.rating) || 5,
          quote: item.review, category: item.Course,
          accent: cardAccents[i % cardAccents.length],
        })));
      }
      setError(null);
    } catch { setError('Failed to load testimonials'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { GetTestinomial(); }, []);

  if (loading) return <div className="py-20 flex items-center justify-center"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FB0500]" /></div>;
  if (error)   return (
    <div className="py-16 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-3">{error}</p>
        <button onClick={GetTestinomial} className="px-4 py-2 bg-[#FB0500] text-white rounded-lg text-xs hover:opacity-90">Try Again</button>
      </div>
    </div>
  );

  return (
    <>
      {/* Testimonials */}
      <div className="bg-dot-grid py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto overflow-hidden">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Success Stories</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What our students say</h2>
            </div>
            <div className="flex gap-8 flex-shrink-0">
              <div className="text-center">
                <div className="text-2xl font-black text-[#FB0500]">10,000+</div>
                <div className="text-xs text-gray-400 mt-0.5">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-[#0078FF]">98%</div>
                <div className="text-xs text-gray-400 mt-0.5">Success Rate</div>
              </div>
            </div>
          </div>

          {testimonials.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No testimonials yet.</p>
          ) : (
            <div className="pb-4">
              <Marquee pauseOnHover={true} speed={40} gradient={false}>
                {testimonials.map((t, i) => {
                  const isDark = false; // Always light
                  return (
                    <div key={t.id}
                      className={`
                        w-[85vw] md:w-[40vw] lg:w-[30vw] mx-2 h-full
                        ${isDark ? 'bg-[#0a1628]' : 'bg-white'}
                      rounded-md p-6 flex flex-col justify-between border
                      ${isDark ? 'border-blue-900/30' : 'border-gray-200'}
                      hover:shadow-md transition-shadow
                    `}
                  >
                    {/* Accent top line */}
                    <div className="w-8 h-1 rounded-sm mb-4" style={{ backgroundColor: t.accent }} />

                    {/* Large quote */}
                    <div className="text-5xl font-black leading-none mb-3 opacity-40" style={{ color: t.accent }}>"</div>

                    <p className={`text-sm leading-relaxed flex-1 mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t.quote}
                    </p>

                    <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                      <img
                        src={t.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=${t.accent.replace('#','')}&color=fff`} 
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white/20"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=${t.accent.replace('#','')}&color=fff`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.name}</p>
                        <p className="text-xs text-gray-400 truncate">{t.achievement}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-sm text-white" style={{ backgroundColor: t.accent }}>
                        {t.category}
                      </span>
                    </div>
                  </div>
                );
              })}
              </Marquee>
            </div>
          )}
        </div>
      </div>

      {/* Video Stories */}
      <div className="bg-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <VideoCarousel />
        </div>
      </div>
    </>
  );
};

export default TestimonialsPage;
