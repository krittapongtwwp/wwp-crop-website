import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Globe, Sun, Moon, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: t('Home', 'หน้าแรก'), path: '/' },
    { name: t('About', 'เกี่ยวกับเรา'), path: '/about' },
    { name: t('Services', 'บริการ'), path: '/services' },
    { name: t('Solutions', 'โซลูชัน'), path: '/solutions' },
    { name: t('Work', 'ผลงาน'), path: '/work' },
    { name: t('Press', 'ข่าวสาร'), path: '/press' },
    { name: t('Careers', 'ร่วมงานกับเรา'), path: '/careers' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled 
            ? 'py-4 bg-white/80 dark:bg-[#050A15]/80 backdrop-blur-3xl border-b border-gray-200/50 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative flex items-center justify-between transition-all duration-500 ease-out">
            {/* Subtle glow effect when scrolled */}
            {isScrolled && (
              <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-electric-blue/5 to-transparent pointer-events-none" />
            )}

            <Link to="/" className="relative z-10 flex items-center gap-2 group">
              <img 
                src="https://wewebplus.com/img/static/wewebplus.svg" 
                alt="WEWEBPLUS Logo" 
                className="h-7 w-auto transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center relative z-10" onMouseLeave={() => setHoveredPath(null)}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const isHovered = hoveredPath === link.path;
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onMouseEnter={() => setHoveredPath(link.path)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                      isActive 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    
                    {/* Hover Pill */}
                    {isHovered && (
                      <motion.div
                        layoutId="nav-hover"
                        className="absolute inset-0 bg-gray-100 dark:bg-white/10 rounded-full -z-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-electric-blue rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden lg:flex items-center gap-2 relative z-10">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-bold tracking-wider"
              >
                <Globe className="w-4 h-4" />
                {language.toUpperCase()}
              </button>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-2" />

              <Link to="/contact">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden group px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t('Start a Project', 'เริ่มโครงการ')}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-electric-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden relative z-50 p-2 -mr-2 text-gray-900 dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white/95 dark:bg-[#0A0F1C]/95 backdrop-blur-xl flex flex-col pt-24 pb-8 px-6 lg:hidden"
          >
            <div className="flex-1 overflow-y-auto flex flex-col justify-center">
              <nav className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-3xl font-bold tracking-tight flex items-center justify-between group ${
                        location.pathname === link.path 
                          ? 'text-electric-blue' 
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className={`w-6 h-6 transition-transform duration-300 ${
                        location.pathname === link.path ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                      }`} />
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl font-bold tracking-tight flex items-center justify-between group text-gray-900 dark:text-white"
                  >
                    <span>{t('Contact', 'ติดต่อเรา')}</span>
                    <ChevronRight className="-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 w-6 h-6 transition-transform duration-300" />
                  </Link>
                </motion.div>
              </nav>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                  className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-600 dark:text-gray-400"
                >
                  <Globe className="w-5 h-5" />
                  {language === 'en' ? 'SWITCH TO THAI' : 'เปลี่ยนเป็นภาษาอังกฤษ'}
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
              
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-4 rounded-xl bg-electric-blue text-white text-lg font-bold shadow-lg shadow-electric-blue/20 flex items-center justify-center gap-2">
                  {t('Start a Project', 'เริ่มโครงการ')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
