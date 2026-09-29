import React, { useState } from 'react';
import { Phone, X, MessageSquare } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  if (location.pathname !== '/') {
    return null;
  }

  const whatsappNumber = "919877515330";
  const phoneNumber = "+91 98775-15330";

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[99999] flex flex-col items-end gap-2.5 font-sans select-none">
      {/* Floating Options Popup */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 animate-fadeIn duration-200">
          
          {/* WhatsApp Pill Option */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hello%20Roots%20Classes,%20I%20have%20an%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 bg-white border border-gray-200 shadow-lg hover:shadow-xl rounded-full py-1.5 px-3.5 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-900 group-hover:text-[#25D366] transition-colors pl-1">
              WhatsApp
            </span>
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
              <FaWhatsapp size={18} />
            </div>
          </a>

          {/* Call Us Pill Option */}
          <a
            href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
            className="group flex items-center gap-2.5 bg-white border border-gray-200 shadow-lg hover:shadow-xl rounded-full py-1.5 px-3.5 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-900 group-hover:text-[#FB0500] transition-colors pl-1">
              Call us
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FB0500] hover:bg-[#d90400] flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
              <Phone size={15} />
            </div>
          </a>

        </div>
      )}

      {/* Main Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact support"
        className="relative w-12 h-12 rounded-full bg-[#FB0500] hover:bg-[#d90400] text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none ring-4 ring-[#FB0500]/20"
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-110' : 'rotate-0 scale-100'}`}>
          {isOpen ? <X size={21} strokeWidth={2.5} /> : <MessageSquare size={21} strokeWidth={2.2} />}
        </div>

        {/* Subtle Ping Animation when closed */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FB0500] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-[#FB0500]"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingContact;
