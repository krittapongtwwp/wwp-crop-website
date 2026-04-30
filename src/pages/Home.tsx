import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionValue } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';

export default function Home() {
  const { t, language } = useLanguage();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [solutionsData, setSolutionsData] = useState<any[]>([]);
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [clientsData, setClientsData] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [sectionsRes, servicesRes, portfolioRes, clientsRes, heroRes] = await Promise.all([
          fetchApi('/content/homepage_sections'),
          fetchApi('/content/services'),
          fetchApi('/content/portfolio'),
          fetchApi('/content/clients'),
          fetchApi('/content/hero_banners')
        ]);
        
        const sections = sectionsRes.data || sectionsRes;
        const services = servicesRes.data || servicesRes;
        const portfolio = portfolioRes.data || portfolioRes;
        const clients = clientsRes.data || clientsRes;
        const heroes = heroRes.data || heroRes;

        setSectionsData(Array.isArray(sections) ? sections : []);
        setSolutionsData(Array.isArray(services) ? services.filter((s: any) => s.is_published) : []);
        setPortfolioData(Array.isArray(portfolio) ? portfolio.filter((p: any) => p.is_published) : []);
        setClientsData(Array.isArray(clients) ? clients.filter((c: any) => c.is_published) : []);
        setHeroBanners(Array.isArray(heroes) ? heroes.filter((h: any) => h.is_active).sort((a: any, b: any) => a.sort_order - b.sort_order) : []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  const getSection = (key: string) => {
    return sectionsData.find(s => s.section_key === key) || {};
  };

  const getLocalized = (section: any, field: string, fallback: string) => {
    if (!section) return fallback;
    const val = language === 'en' ? section[`${field}_en`] : section[`${field}_th`];
    return val || fallback;
  };

  // Mouse tracking for subtle parallax and glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Global Scroll
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 800], [1, 0]);
  
  // Fallback data if backend is empty
  const solutions = solutionsData.length > 0 ? solutionsData.map((s, i) => ({
    id: `0${i + 1}`,
    title: getLocalized(s, 'title', s.title_en),
    desc: getLocalized(s, 'description', s.description_en),
    color: ['from-blue-600/30', 'from-sky-500/30', 'from-indigo-500/30'][i % 3]
  })) : [
    { id: '01', title: 'Enterprise Web Applications', desc: 'Complex, secure, and robust web apps designed to streamline mission-critical operations at scale.', color: 'from-blue-600/30' },
    { id: '02', title: 'AI-Enhanced Business Tools', desc: 'Intelligent automation and data-driven insights to future-proof your enterprise and accelerate growth.', color: 'from-sky-500/30' },
    { id: '03', title: 'Digital Experience & UX/UI', desc: 'World-class, user-centric interface design that drives engagement, conversion, and brand loyalty.', color: 'from-indigo-500/30' },
  ];

  const works = portfolioData.length > 0 ? portfolioData.map(p => ({
    title: getLocalized(p, 'title', p.title_en),
    category: p.industry || 'Project',
    img: p.cover_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000'
  })) : [
    { title: 'National Public Service Portal', category: 'GovTech', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000' },
    { title: 'Global Banking Dashboard', category: 'FinTech', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000' },
    { title: 'Smart City Mobility App', category: 'Urban Tech', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=2000' }
  ];

  const clients = clientsData.length > 0 ? clientsData.map(c => c.name) : ["Ministry of Finance", "Global Bank Corp", "Tech Innovators Inc", "National Healthcare", "Smart City Initiative", "Enterprise Solutions"];

  return (
    <div className="bg-white dark:bg-[#02040A] text-gray-900 dark:text-white selection:bg-electric-blue selection:text-white font-sans overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Cursor Glow - Subtle */}
      <motion.div 
        className="fixed top-0 left-0 w-[800px] h-[800px] bg-electric-blue/10 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen"
        animate={{
          x: mousePosition.x - 400,
          y: mousePosition.y - 400,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 50, mass: 1 }}
      />

      {/* Dynamic Sections based on Database Order */}
      {[...sectionsData].sort((a, b) => a.sort_order - b.sort_order).map((section) => {
        if (section.is_visible === 0) return null;

        switch (section.section_key) {
          case 'hero':
            return (
              <section key="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                {heroBanners.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHeroIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 z-0"
                    >
                      {heroBanners[currentHeroIndex].media_type === 'video' ? (
                        <video
                          src={heroBanners[currentHeroIndex].media_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover opacity-40"
                        />
                      ) : (
                        <div 
                          className="w-full h-full bg-cover bg-center opacity-40"
                          style={{ backgroundImage: `url(${heroBanners[currentHeroIndex].media_url})` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-[#02040A] opacity-80" />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-sky-400/20 rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_12s_ease-in-out_infinite_reverse]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15] mix-blend-overlay" />
                    
                    {/* Sculptural Glass Element */}
                    <motion.div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] border border-black/5 dark:border-white/5 rounded-[40%] bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent backdrop-blur-3xl shadow-[inset_0_0_100px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_0_100px_rgba(255,255,255,0.02)]"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}

                <motion.div 
                  style={{ y: heroY, opacity: heroOpacity }} 
                  className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-20"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`content-${currentHeroIndex}`}
                      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center"
                    >
                      <div className="mb-8">
                        <span className="text-xs md:text-sm font-medium tracking-[0.4em] uppercase text-gray-500 dark:text-gray-400">
                          {heroBanners.length > 0 
                            ? getLocalized(heroBanners[currentHeroIndex], 'subtitle', t('DIGITAL BUSINESS PARTNER', 'พันธมิตรธุรกิจดิจิทัล'))
                            : getLocalized(section, 'subtitle', t('DIGITAL BUSINESS PARTNER', 'พันธมิตรธุรกิจดิจิทัล'))}
                        </span>
                      </div>
                      
                      <div className="overflow-hidden mb-2">
                        <h1 className="text-[15vw] md:text-[11vw] font-black leading-[0.8] tracking-tighter">
                          {heroBanners.length > 0
                            ? getLocalized(heroBanners[currentHeroIndex], 'title', t('WEWEBPLUS', 'WEWEBPLUS'))
                            : getLocalized(section, 'title', t('WEWEBPLUS', 'WEWEBPLUS'))}
                        </h1>
                      </div>
                      
                      <div>
                        <p className="max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 mt-6">
                          {heroBanners.length > 0
                            ? getLocalized(heroBanners[currentHeroIndex], 'description', t('We engineer premium digital experiences, enterprise platforms, and AI-driven solutions that transform businesses for the modern era.', 'เราสร้างสรรค์ประสบการณ์ดิจิทัลระดับพรีเมียม แพลตฟอร์มองค์กร และโซลูชันที่ขับเคลื่อนด้วย AI เพื่อพลิกโฉมธุรกิจสู่ยุคสมัยใหม่'))
                            : getLocalized(section, 'description', t('We engineer premium digital experiences, enterprise platforms, and AI-driven solutions that transform businesses for the modern era.', 'เราสร้างสรรค์ประสบการณ์ดิจิทัลระดับพรีเมียม แพลตฟอร์มองค์กร และโซลูชันที่ขับเคลื่อนด้วย AI เพื่อพลิกโฉมธุรกิจสู่ยุคสมัยใหม่'))}
                        </p>
                        <Link to={heroBanners.length > 0 && heroBanners[currentHeroIndex].button_link ? heroBanners[currentHeroIndex].button_link : "/contact"} className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-transparent border border-black/20 dark:border-white/20 text-gray-900 dark:text-white rounded-full overflow-hidden transition-all duration-700 hover:border-transparent">
                          <div className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
                          <span className="relative z-10 text-lg font-bold tracking-widest uppercase group-hover:text-white dark:group-hover:text-black transition-colors duration-700">
                            {heroBanners.length > 0 && getLocalized(heroBanners[currentHeroIndex], 'button_text', '')
                              ? getLocalized(heroBanners[currentHeroIndex], 'button_text', t('Initiate', 'เริ่มต้น'))
                              : t('Initiate', 'เริ่มต้น')}
                          </span>
                          <ArrowUpRight className="relative z-10 w-5 h-5 group-hover:text-white dark:group-hover:text-black transition-colors duration-700" />
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
                
                {/* Carousel Indicators */}
                {heroBanners.length > 1 && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {heroBanners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentHeroIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'w-8 bg-black dark:bg-white' : 'bg-black/30 dark:bg-white/30'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </section>
            );

          case 'solutions':
            return (
              <SolutionsSection 
                key="solutions"
                solutions={solutions}
              />
            );

          case 'portfolio':
            return (
              <section key="portfolio" className="relative h-screen w-full bg-white dark:bg-[#02040A] z-30 transition-colors duration-500 flex flex-col">
                {/* Section Header */}
                <div className="absolute top-12 left-6 md:left-12 z-20 mix-blend-difference pointer-events-none">
                  <h2 className="text-xs font-bold tracking-[0.4em] text-white uppercase">
                    {getLocalized(section, 'title', t('Selected Works', 'ผลงานที่คัดสรร'))}
                  </h2>
                </div>

                {/* Horizontal Scrolling Container */}
                <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                  {works.map((work, i) => (
                    <div key={i} className="w-screen shrink-0 h-full snap-center flex items-center justify-center p-0 md:p-12 relative group">
                      {/* Massive Project Frame */}
                      <div className="relative w-full h-full md:rounded-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 group-hover:bg-white/10 dark:group-hover:bg-black/10 transition-colors duration-1000 z-10" />
                        <motion.img 
                          initial={{ scale: 1.2 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          src={work.img} 
                          alt={work.title} 
                          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[3s] ease-out" 
                        />
                        
                        {/* Cinematic Overlay */}
                        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-20 bg-gradient-to-t from-white dark:from-[#02040A] via-white/40 dark:via-[#02040A]/40 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-1000">
                          <div className="max-w-6xl">
                            <div className="overflow-hidden mb-6">
                              <span className="block text-gray-500 dark:text-white/50 font-mono text-xl tracking-widest uppercase transform md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-1000 ease-[0.16,1,0.3,1]">
                                {work.category}
                              </span>
                            </div>
                            <h4 className="text-6xl md:text-8xl lg:text-[8rem] font-bold text-gray-900 dark:text-white mb-12 tracking-tighter leading-[0.9] transform md:translate-y-12 md:group-hover:translate-y-0 transition-transform duration-1000 delay-100 ease-[0.16,1,0.3,1]">
                              {work.title}
                            </h4>
                            <div className="overflow-hidden">
                              <Link to="/work" className="inline-flex items-center gap-6 text-2xl font-light text-gray-900 dark:text-white hover:text-electric-blue transition-colors transform md:translate-y-full md:group-hover:translate-y-0 duration-1000 delay-200 ease-[0.16,1,0.3,1]">
                                {t('View Exhibit', 'ชมนิทรรศการ')} <ArrowRight className="w-8 h-8" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'clients':
            return (
              <section key="clients" className="pt-20 pb-32 bg-white dark:bg-[#02040A] overflow-hidden relative z-20 transition-colors duration-500">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-[#02040A] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-[#02040A] to-transparent z-10 pointer-events-none" />
                
                <div className="flex flex-col gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000 group">
                  <div className="flex whitespace-nowrap animate-marquee w-max group-hover:pause">
                    {[...clients, ...clients, ...clients].map((c, i) => (
                      <Link to="/work" key={`r1-${i}`} className="mx-8 text-[6vw] font-black text-gray-300 dark:text-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-500 uppercase tracking-tighter leading-none">
                        {c}
                      </Link>
                    ))}
                  </div>
                  <div className="flex whitespace-nowrap animate-marquee-reverse w-max ml-[-10%] group-hover:pause">
                    {[...clients, ...clients, ...clients].map((c, i) => (
                      <Link to="/work" key={`r2-${i}`} className="mx-8 text-[6vw] font-black text-gray-300 dark:text-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-500 uppercase tracking-tighter leading-none">
                        {c}
                      </Link>
                    ))}
                  </div>
                  <div className="flex whitespace-nowrap animate-marquee w-max ml-[-5%] group-hover:pause">
                    {[...clients, ...clients, ...clients].map((c, i) => (
                      <Link to="/work" key={`r3-${i}`} className="mx-8 text-[6vw] font-black text-gray-300 dark:text-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-500 uppercase tracking-tighter leading-none">
                        {c}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'manifesto':
            return (
              <section key="manifesto" className="py-40 bg-white dark:bg-[#02040A] relative overflow-hidden z-20 transition-colors duration-500">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                  <div className="max-w-7xl mx-auto">
                    <motion.h2 
                      initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-24 text-gray-900 dark:text-white"
                    >
                      {getLocalized(section, 'title', t('BUILT FOR SCALE.', 'สร้างมาเพื่อการขยายตัว'))}<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-500 to-gray-800 dark:from-gray-500 dark:to-gray-800">{getLocalized(section, 'subtitle', t('DESIGNED FOR IMPACT.', 'ออกแบบมาเพื่อสร้างผลกระทบ'))}</span>
                    </motion.h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 w-full">
                      {[
                        { title: t('Elite Engineering', 'วิศวกรรมชั้นยอด'), desc: t('Robust, scalable, and secure architectures built for the enterprise.', 'สถาปัตยกรรมที่แข็งแกร่ง ขยายได้ และปลอดภัย สร้างขึ้นสำหรับองค์กร') },
                        { title: t('Award-Winning Design', 'การออกแบบที่ได้รับรางวัล'), desc: t('Immersive, user-centric digital experiences that define categories.', 'ประสบการณ์ดิจิทัลที่ดื่มด่ำและเน้นผู้ใช้เป็นศูนย์กลางที่กำหนดหมวดหมู่') }
                      ].map((item, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="relative group"
                        >
                          <div className="absolute -inset-6 bg-black/5 dark:bg-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          <div className="relative">
                            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">{item.title}</h3>
                            <p className="text-2xl text-gray-600 dark:text-gray-400 font-light leading-relaxed">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'cta':
            return (
              <section key="cta" className="relative min-h-screen flex items-center justify-center bg-white dark:bg-[#02040A] overflow-hidden z-20 transition-colors duration-500">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15] mix-blend-overlay" />
                
                {/* Massive glowing orb rising from the bottom */}
                <div className="absolute -bottom-[50vh] left-1/2 -translate-x-1/2 w-[150vw] h-[100vh] bg-blue-600/20 rounded-[100%] blur-[150px] pointer-events-none" />
                
                <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
                  <motion.h2 
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }} whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[15vw] md:text-[12vw] font-black tracking-tighter leading-[0.8] mb-16 text-gray-900 dark:text-white"
                  >
                    {getLocalized(section, 'title', t("INITIATE", "เริ่มต้น"))}<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-400 dark:from-white dark:to-gray-800">
                      {getLocalized(section, 'subtitle', t("THE FUTURE.", "อนาคต"))}
                    </span>
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to="/contact" className="group relative inline-flex items-center justify-center gap-6 px-16 py-8 bg-transparent border border-black/20 dark:border-white/20 text-gray-900 dark:text-white rounded-full overflow-hidden transition-all duration-700 hover:border-transparent backdrop-blur-md">
                      <div className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
                      <span className="relative z-10 text-2xl font-bold tracking-widest uppercase group-hover:text-white dark:group-hover:text-black transition-colors duration-700">
                        {t('Contact Us', 'ติดต่อเรา')}
                      </span>
                      <ArrowUpRight className="relative z-10 w-8 h-8 group-hover:text-white dark:group-hover:text-black transition-colors duration-700" />
                    </Link>
                  </motion.div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

    </div>
  );
}

function SolutionsSection({ solutions }: { solutions: any[] }) {
  const solutionsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: solutionsScroll } = useScroll({
    target: solutionsRef,
    offset: ["start end", "end start"]
  });

  return (
    <section ref={solutionsRef} className="relative bg-white dark:bg-[#02040A] z-20 transition-colors duration-500">
      <div className="relative h-[300vh]">
        {solutions.map((sol, i) => (
          <SolutionItem 
            key={i} 
            sol={sol} 
            i={i} 
            total={solutions.length} 
            scrollProgress={solutionsScroll} 
          />
        ))}
      </div>
    </section>
  );
}

function SolutionItem({ sol, i, total, scrollProgress }: { sol: any, i: number, total: number, scrollProgress: MotionValue<number>, key?: any }) {
  // Calculate opacity and blur based on scroll progress
  // Progress goes from 0 to 1 over the 300vh section
  // Each item takes up 1/total of the scroll distance
  const step = 1 / total;
  const startFadeIn = Math.max(0, (i - 0.5) * step);
  const fullyVisibleStart = i * step;
  const fullyVisibleEnd = (i + 0.5) * step;
  const endFadeOut = (i + 1) * step;

  const opacity = useTransform(
    scrollProgress,
    [startFadeIn, fullyVisibleStart, fullyVisibleEnd, endFadeOut],
    [0, 1, 1, 0]
  );
  
  const scale = useTransform(
    scrollProgress,
    [fullyVisibleEnd, endFadeOut],
    [1, 0.9]
  );

  const blur = useTransform(
    scrollProgress,
    [startFadeIn, fullyVisibleStart, fullyVisibleEnd, endFadeOut],
    ["blur(20px)", "blur(0px)", "blur(0px)", "blur(20px)"]
  );

  return (
    <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{
          scale: i === total - 1 ? 1 : scale,
          opacity: opacity,
          filter: blur,
        }}
      >
        <div className="absolute inset-0 bg-white dark:bg-[#02040A] transition-colors duration-500">
          {/* Refractive Glass Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${sol.color} to-transparent opacity-10`} />
          <div className="absolute inset-0 backdrop-blur-[100px]" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent" />
          
          <div className="container mx-auto px-6 h-full flex flex-col justify-center relative z-10">
            <div className="max-w-5xl">
              <div className="overflow-hidden mb-8">
                <motion.span 
                  initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-electric-blue font-mono text-2xl md:text-4xl block tracking-widest"
                >
                  {sol.id} /
                </motion.span>
              </div>
              <div className="overflow-hidden mb-10">
                <motion.h2 
                  initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-gray-900 dark:text-white"
                >
                  {sol.title}
                </motion.h2>
              </div>
              <motion.p 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-2xl md:text-4xl text-gray-600 dark:text-gray-400 font-light leading-tight max-w-3xl"
              >
                {sol.desc}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
