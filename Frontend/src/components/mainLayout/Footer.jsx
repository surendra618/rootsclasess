import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Programs & Exam Categories requested by user (JEE, NEET, SSC, Classes)
  const programLinks = [
    { name: "IIT-JEE (Main & Adv.)", href: "/course" },
    { name: "NEET-UG (Medical)", href: "/course" },
    { name: "SSC & Govt. Exams", href: "/course" },
    { name: "Class 11th & 12th Boards", href: "/course" },
    { name: "Class 9th & 10th Foundation", href: "/course" },
    { name: "Class 7th & 8th Pre-Found.", href: "/course" },
    { name: "100% Scholarship (RTSE)", href: "/scholarship" }
  ];

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Classroom Courses", href: "/course" },
    { name: "Test Series", href: "/test" },
    { name: "Educational Blogs", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
    { name: "Terms & Conditions", href: "/termsandconditions" },
    { name: "Privacy Policy", href: "/privacypolicy" }
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook size={16} />,
      href: "https://www.facebook.com/rootsclasses1313/",
      color: "hover:bg-[#1877F2] hover:border-[#1877F2]"
    },
    {
      name: "Instagram",
      icon: <FaInstagram size={16} />,
      href: "https://www.instagram.com/roots_classes?igsh=cndtdml4MW0wNmFz",
      color: "hover:bg-[#E4405F] hover:border-[#E4405F]"
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={16} />,
      href: "https://www.linkedin.com/company/roots-classes/",
      color: "hover:bg-[#0A66C2] hover:border-[#0A66C2]"
    },
    {
      name: "YouTube",
      icon: <FaYoutube size={16} />,
      href: "https://www.youtube.com/@nikolaphysics",
      color: "hover:bg-[#FF0000] hover:border-[#FF0000]"
    }
  ];

  return (
    <footer className="bg-[#0b0f19] text-gray-400 border-t border-gray-800/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          
          {/* 1. Brand Section */}
          <div className="text-center sm:text-left">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="Roots Classes" className="h-9 w-auto" />
              <div className="leading-tight text-left">
                <span className="text-xl font-black text-[#FB0500] tracking-tight">Roots</span>
                <span className="text-xl font-black text-white tracking-tight"> Classes</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto sm:mx-0 mb-6">
              Empowering learners worldwide. Premier coaching for JEE, NEET, SSC, and Foundation classes in Ludhiana.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 justify-center sm:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`w-9 h-9 rounded-lg bg-gray-800/70 border border-gray-700/50 flex items-center justify-center text-gray-300 transition-all duration-300 hover:text-white ${social.color} hover:scale-105`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* 2. Popular Courses / Programs (Requested Column: SSC, JEE, NEET, Classes) */}
          <div className="text-center sm:text-left">
            <h3 className="text-base font-bold text-white mb-4 relative inline-block">
              Popular Programs
              <span className="absolute -bottom-1.5 left-0 w-7 h-0.5 bg-[#FB0500] rounded-full"></span>
            </h3>
            <ul className="space-y-2.5 mt-2">
              {programLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-white text-sm transition-all duration-200 inline-flex items-center gap-2 group"
                  >
                    <ChevronRight size={14} className="text-[#FB0500] transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Quick Links / Pages */}
          <div className="text-center sm:text-left">
            <h3 className="text-base font-bold text-white mb-4 relative inline-block">
              Quick Links
              <span className="absolute -bottom-1.5 left-0 w-7 h-0.5 bg-[#FB0500] rounded-full"></span>
            </h3>
            <ul className="space-y-2.5 mt-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-all duration-200 inline-flex items-center gap-2 group"
                  >
                    <ChevronRight size={14} className="text-[#FB0500] transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Corporate Office */}
          <div className="text-center sm:text-left">
            <h3 className="text-base font-bold text-white mb-4 relative inline-block">
              Corporate Office
              <span className="absolute -bottom-1.5 left-0 w-7 h-0.5 bg-[#FB0500] rounded-full"></span>
            </h3>
            <div className="space-y-3.5 mt-2">
              {/* Phone */}
              <a href="tel:+919877515330" className="flex items-center gap-3 group justify-center sm:justify-start text-sm hover:text-white transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gray-800/70 border border-gray-700/50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FB0500] group-hover:border-[#FB0500] transition-all duration-200">
                  <Phone size={16} className="text-gray-300 group-hover:text-white" />
                </div>
                <span className="text-gray-300 font-medium">+91 98775-15330</span>
              </a>

              {/* Email */}
              <a href="mailto:rootsclasses1313@gmail.com" className="flex items-center gap-3 group justify-center sm:justify-start text-sm hover:text-white transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gray-800/70 border border-gray-700/50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FB0500] group-hover:border-[#FB0500] transition-all duration-200">
                  <Mail size={16} className="text-gray-300 group-hover:text-white" />
                </div>
                <span className="text-gray-300 font-medium break-all">rootsclasses1313@gmail.com</span>
              </a>

              {/* Address */}
              <div className="flex items-start gap-3 justify-center sm:justify-start text-sm">
                <div className="w-9 h-9 rounded-lg bg-gray-800/70 border border-gray-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} className="text-gray-300" />
                </div>
                <span className="text-gray-300 text-left leading-relaxed">
                  Gill Rd, Opp. ITI College,<br />
                  Shilapuri, Ludhiana, Punjab 141003
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {currentYear} Roots Classes. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/termsandconditions" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/privacypolicy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;