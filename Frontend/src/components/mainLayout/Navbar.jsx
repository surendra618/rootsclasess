import React, { useEffect, useState, useRef } from 'react';
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard, UserCircle, BookOpen } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useStudentStore from '../../Store/studentstore';
import NotificationDropdown from '../Notification/NotificationDropdown';

const navItems = [
  { name: 'Courses', path: '/course' },
  { name: '100% Scholarship', path: '/scholarship' },
  { name: 'Test Series', path: '/test' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const { student, logout, setStudent } = useStudentStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* auth check */
  useEffect(() => {
    const check = () => {
      if (student && (student._id || student.id)) { setIsLoggedIn(true); return; }
      try {
        const s = localStorage.getItem('student');
        if (s) { const p = JSON.parse(s); if (p?._id || p?.id) { setIsLoggedIn(true); if (!student && setStudent) setStudent(p); return; } }
        const u = localStorage.getItem('user');
        if (u) { const p = JSON.parse(u); if (p?._id || p?.id) { setIsLoggedIn(true); return; } }
      } catch { }
      setIsLoggedIn(false);
    };
    check();
  }, [student, setStudent]);

  /* click outside */
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const getName = () => {
    if (student?.fullName) return student.fullName;
    if (student?.name) return student.name;
    try {
      const s = JSON.parse(localStorage.getItem('student') || '{}');
      return s.fullName || s.name || s.username || s.email?.split('@')[0] || 'Student';
    } catch { return 'Student'; }
  };

  const getEmail = () => {
    if (student?.email) return student.email;
    try { return JSON.parse(localStorage.getItem('student') || '{}').email || ''; } catch { return ''; }
  };

  const getProfileImage = () => {
    if (student?.profileImage) return student.profileImage;
    try {
      const s = JSON.parse(localStorage.getItem('student') || localStorage.getItem('user') || '{}');
      return s.profileImage || '';
    } catch { return ''; }
  };

  const isAdminOrInstructor = () => ['admin', 'instructor'].includes(student?.role);
  const isStudent = () => student?.role === 'student' || (!student?.role && isLoggedIn);

  const handleLogout = () => {
    ['user', 'student', 'token', 'authToken', 'studentToken'].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    logout?.();
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/stdlogin');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[60] w-full bg-white transition-shadow duration-200 ${scrolled ? 'shadow-[0_2px_15px_rgba(0,0,0,0.08)]' : ''}`}>
      {/* Announcement bar (Glassmorphism Light) */}
      <div className="relative overflow-hidden bg-[#fdfdfd]/80 backdrop-blur-md border-b border-gray-200/50 py-1.5 px-4 text-center">
        {/* Subtle decorative color accents */}
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-[#FB0500]/5 to-[#FB0500]/1 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-[#0078FF]/5 to-[#0078FF]/1 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center gap-2 text-[10px] sm:text-xs tracking-wide">
          <span className="flex items-center gap-1.5 font-bold text-gray-700 bg-[#FEF2F2] px-2.5 py-0.5 rounded-full border border-red-100/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB0500] animate-pulse"></span>
            Admissions open for 2025-26 batch
          </span>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <Link to="/scholarship" className="group flex items-center gap-1 font-black">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0078FF] to-[#28A745] group-hover:from-[#FB0500] group-hover:to-[#FB0500] transition-all">
              Apply for 100% Scholarship
            </span>
            <span className="text-[#28A745] group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`bg-white/95 backdrop-blur-md transition-shadow duration-200 ${scrolled ? 'shadow-[0_1px_20px_rgba(0,0,0,0.08)]' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/logo.svg" alt="Roots Classes" className="h-9 w-auto" />
              <div className="leading-tight">
                <span className="text-lg font-black text-[#FB0500] tracking-tight">Roots</span>
                <span className="text-lg font-black text-[#0a0a0a] tracking-tight"> Classes</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${isActive(item.path)
                    ? 'text-[#FB0500] font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <NotificationDropdown />
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer focus:outline-none overflow-hidden ring-2 ${isDropdownOpen ? 'ring-[#FB0500]' : 'ring-gray-200 hover:ring-[#FB0500]/50'}`}
                      title={getName()}
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#FB0500] to-red-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-xs overflow-hidden">
                        {getProfileImage() ? (
                          <img src={getProfileImage()} alt={getName()} className="w-full h-full object-cover" />
                        ) : (
                          getName()?.charAt(0)?.toUpperCase() || <User size={15} className="text-white" />
                        )}
                      </div>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-sm shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FB0500] to-red-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-xs overflow-hidden">
                              {getProfileImage() ? (
                                <img src={getProfileImage()} alt={getName()} className="w-full h-full object-cover" />
                              ) : (
                                getName()?.charAt(0)?.toUpperCase() || <User size={16} className="text-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{getName()}</p>
                              {getEmail() && <p className="text-xs text-gray-400 truncate">{getEmail()}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
                          {isAdminOrInstructor() && (
                            <button onClick={() => { navigate('/admin/'); setIsDropdownOpen(false); }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <LayoutDashboard size={16} className="text-gray-400" />Dashboard
                            </button>
                          )}
                          {isStudent() && (
                            <>
                              <button onClick={() => { navigate('/purchescourse'); setIsDropdownOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <BookOpen size={16} className="text-blue-600" />My Enrolled Courses
                              </button>
                              <button onClick={() => { navigate('/stdprofile'); setIsDropdownOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <UserCircle size={16} className="text-gray-400" />Student Dashboard
                              </button>
                            </>
                          )}
                        </div>
                        <div className="border-t border-gray-100 pt-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                            <LogOut size={16} />Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link to="/stdlogin">
                    <button className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 rounded-sm transition-all">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-4 py-1.5 text-sm font-semibold text-white bg-[#0078FF] hover:bg-[#0066DD] rounded-sm transition-all shadow-xs">
                      Sign Up Free
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-sm text-sm font-medium transition-colors ${isActive(item.path) ? 'text-[#FB0500] font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="mt-2 pt-3 border-t border-gray-100">
                {isLoggedIn ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FB0500] to-red-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-xs overflow-hidden">
                        {getProfileImage() ? (
                          <img src={getProfileImage()} alt={getName()} className="w-full h-full object-cover" />
                        ) : (
                          getName()?.charAt(0)?.toUpperCase() || <User size={14} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{getName()}</p>
                        {getEmail() && <p className="text-xs text-gray-400">{getEmail()}</p>}
                      </div>
                    </div>
                    {isAdminOrInstructor() && (
                      <Link to="/admin/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard size={16} className="text-gray-400" />Dashboard
                      </Link>
                    )}
                    {isStudent() && (
                      <>
                        <Link to="/purchescourse" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm text-gray-700 hover:bg-gray-50">
                          <BookOpen size={16} className="text-blue-600" />My Enrolled Courses
                        </Link>
                        <Link to="/stdprofile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm text-gray-700 hover:bg-gray-50">
                          <UserCircle size={16} className="text-gray-400" />Student Dashboard
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={16} />Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 px-1">
                    <Link to="/stdlogin" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-50">Login</button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full py-2 text-sm font-semibold text-white bg-[#0078FF] hover:bg-[#0066DD] rounded-sm shadow-xs">Sign Up Free</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
    {/* Spacer to prevent layout shift under fixed navbar */}
    <div className="h-[93px] w-full shrink-0 pointer-events-none" aria-hidden="true" />
  </>
  );
};

export default Navbar;
