import React from 'react';

const stats = [
  { value: '10,000+', label: 'Students Enrolled', color: '#FB0500' }, // Red
  { value: '98%', label: 'Selection Rate', color: '#0078FF' }, // Blue
  { value: '50+', label: 'Expert Faculty', color: '#28A745' }, // Green
  { value: '10+', label: 'Years of Excellence', color: '#F1C40F' }, // Yellow
];

const StatsBar = () => (
  <div className="relative py-10 bg-white border-b border-gray-100 shadow-sm overflow-hidden">
    {/* Subtle Background Pattern */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
    
    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-gray-100">
        {stats.map((s) => (
          <div key={s.label} className="text-center px-6 transition-transform duration-300 hover:scale-105">
            <div 
              className="text-3xl md:text-4xl font-black mb-1 drop-shadow-sm" 
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StatsBar;
