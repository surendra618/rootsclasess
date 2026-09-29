import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import api from '../../services/endpoints';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const VideoCarousel = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(api.successStory.get);
      if (res.data.success) {
        setVideos(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let animationId;
    const scroll = () => {
      if (scrollRef.current && !isPaused) {
        scrollRef.current.scrollLeft += 0.8;
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    if (videos.length > 0) {
      animationId = requestAnimationFrame(scroll);
    }

    return () => cancelAnimationFrame(animationId);
  }, [videos, isPaused]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FB0500]" />
      </div>
    );
  }

  if (videos.length === 0) return null;

  // Duplicate videos for infinite effect
  const displayVideos = [...videos, ...videos];

  return (
    <div className="relative w-full">
      {/* Header Navigation Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-[#FB0500] uppercase tracking-widest mb-1">Watch & Learn</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Success Stories in Action</h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="w-10 h-10 rounded-md bg-white border border-gray-200 text-gray-700 hover:text-[#FB0500] hover:border-[#FB0500] flex items-center justify-center transition-all shadow-sm"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-10 h-10 rounded-md bg-white border border-gray-200 text-gray-700 hover:text-[#FB0500] hover:border-[#FB0500] flex items-center justify-center transition-all shadow-sm"
            aria-label="Next video"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Scroll Container */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex space-x-5 overflow-x-auto scrollbar-none py-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayVideos.map((video, index) => (
            <a
              key={`${video._id}-${index}`}
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-shrink-0 w-80 bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md hover:border-[#FB0500]/50 transition-all duration-300 flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video overflow-hidden bg-gray-900">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FB0500] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm backdrop-blur-sm border border-white/10">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Info Container */}
              <div className="p-4 flex flex-col flex-1 justify-between bg-white">
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[#FB0500] transition-colors">
                  {video.title}
                </h3>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#FB0500] uppercase tracking-wider">
                  <span>Watch Success Story</span>
                  <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoCarousel;
