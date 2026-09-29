import React, { useEffect, useState } from 'react';
import Classes from './Classes';
import Testimonial from './Testimonial';
import CallBack from './CallBack';
import Experts from './Experts';
import StatsBar from './StatsBar';
import WhyChooseUs from './WhyChooseUs';
import FAQ from './FAQ';
import SEO from '../common/SEO';
import axios from 'axios';
import api from '../../services/endpoints';
import fallbackImage from '../../assets/fallback.jpg';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SliderPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([
    {
      _id: 'default',
      image: fallbackImage,
      desktopImage: fallbackImage,
      tabletImage: fallbackImage,
      mobileImage: fallbackImage,
      title: "Roots Classes",
      subtitle: "Empowering Your Future with Quality Education",
      buttonText: "Explore Courses",
      classText: "Join the Journey"
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const GetSlider = async () => {
    try {
      // Keep showing the default slide while loading
      const res = await axios.post(api.slider.getSlider);
      if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSlides(res.data.data);
      } else if (res.data?.data?.data && Array.isArray(res.data.data.data) && res.data.data.data.length > 0) {
        setSlides(res.data.data.data);
      }
      // If API fails or returns empty, we keep the default slide
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { GetSlider(); }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length > 0 && !isPaused) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length, isPaused]);

  const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which is the best JEE coaching institute in Ludhiana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Roots Classes is widely regarded as one of the best JEE coaching institutes in Ludhiana, Punjab, offering expert faculty, small batch sizes, personalized mentoring, and comprehensive study materials for JEE Main & Advanced."
        }
      },
      {
        "@type": "Question",
        "name": "Does Roots Classes offer scholarships for NEET and JEE preparation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Roots Classes conducts the Roots Scholarship Admission Test (RSAT) where meritorious students can secure up to 100% scholarship on tuition fees."
        }
      },
      {
        "@type": "Question",
        "name": "What courses are offered at Roots Classes Ludhiana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Roots Classes offers 1-Year & 2-Year classroom programs for IIT-JEE (Main + Advanced), NEET (UG) Medical, Pre-Foundation courses for Classes 8, 9 & 10, and Board Exam crash courses."
        }
      }
    ]
  };

  return (
    <>
      <SEO
        title="Best JEE & NEET Coaching in Ludhiana | Roots Classes"
        description="Roots Classes is the premier coaching institute in Ludhiana for IIT JEE, NEET (UG), Foundation (Class 8-10), and Board exam preparation. Top faculty, 100% scholarship test."
        keywords="Best JEE Coaching in Ludhiana, NEET Coaching Ludhiana, IIT JEE Classes Ludhiana, Best Coaching Institute in Ludhiana, Foundation Classes Ludhiana, Roots Classes"
        canonical="https://rootsclasses.in/"
        schema={homeFaqSchema}
      />
      {/* Slider */}
      {slides.length > 0 && (
        <div
          className="relative w-full group bg-white sm:px-4 lg:px-6 mt-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative w-full overflow-hidden border border-gray-100 bg-slate-50 shadow-lg max-h-[280px] md:max-h-[320px] lg:max-h-[380px]">
            {slides.map((slide, idx) => (
              <div
                key={slide._id || idx}
                className={`${currentSlide === idx ? 'relative' : 'absolute inset-0'} flex h-full w-full items-center justify-center transition-all duration-700 ease-in-out transform ${currentSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
              >
                {/* Preserve the full banner image without cropping or stretching. */}
                <picture className="block w-full">
                  <source
                    media="(max-width: 639px)"
                    srcSet={slide.mobileImage || slide.tabletImage || slide.desktopImage || slide.image}
                  />
                  <source
                    media="(max-width: 1023px)"
                    srcSet={slide.tabletImage || slide.desktopImage || slide.image}
                  />
                  <img
                    src={slide.desktopImage || slide.image}
                    alt={slide.title || `Slide ${idx + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </picture>

                {/* 2. Optional Gradient Overlay (PW style for readability) */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
              </div>
            ))}

            {/* Navigation Arrows (PW Style) */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-gray-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white sm:left-4 sm:p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-gray-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white sm:right-4 sm:p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight size={22} />
            </button>

            {/* Pagination Dots (Modern Pill Style) */}
            <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center gap-2 sm:bottom-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="relative z-20">
        <StatsBar />
      </div>

      {/* Programs */}
      <Classes />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Expert Faculty */}
      <Experts />

      {/* Student Testimonials + Videos */}
      <Testimonial />

      {/* FAQ */}
      <FAQ />

      {/* Callback Form */}
      <CallBack />
    </>
  );
};

export default SliderPage;
