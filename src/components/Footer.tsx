import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowUpRight, Mail, MapPin, Phone, Linkedin, Facebook, Twitter } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchApi } from '@/lib/api';

export function Footer() {
  const { t, language } = useLanguage();
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetchApi('/content/settings');
        const data = res.data || res;
        const siteConfig = Array.isArray(data) ? data.find((s: any) => s.key === 'site_config') : null;
        if (siteConfig && siteConfig.value) {
          setConfig(JSON.parse(siteConfig.value));
        }
      } catch (err) {
        console.error('Failed to load config', err);
      }
    }
    loadConfig();
  }, []);

  return (
    <footer className="bg-white dark:bg-[#050A15] text-gray-900 dark:text-white pt-32 pb-12 relative overflow-hidden border-t border-black/10 dark:border-white/10 transition-colors duration-300">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-sky-blue/10 dark:bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
          
          {/* Brand & CTA */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link to="/" className="inline-block mb-8">
              <img src="https://wewebplus.com/img/static/wewebplus.svg" alt="WEWEBPLUS Logo" className="h-10 w-auto dark:brightness-0 dark:invert" />
            </Link>
            <h3 className="text-3xl md:text-5xl font-light leading-tight mb-8 text-gray-600 dark:text-gray-300">
              {t('Ready to build', 'พร้อมที่จะสร้าง')} <br />
              <span className="font-bold text-gray-900 dark:text-white">{t('something extraordinary?', 'สิ่งที่พิเศษหรือยัง?')}</span>
            </h3>
            <Link to="/contact" className="group flex items-center gap-4 bg-black/5 dark:bg-white/5 hover:bg-electric-blue dark:hover:bg-electric-blue border border-black/10 dark:border-white/10 hover:border-electric-blue dark:hover:border-electric-blue rounded-full py-4 px-8 transition-all duration-500">
              <span className="font-semibold tracking-wide uppercase text-sm text-gray-900 dark:text-white group-hover:text-white">{t('Start a Project', 'เริ่มโครงการ')}</span>
              <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-electric-blue flex items-center justify-center group-hover:rotate-45 group-hover:bg-white group-hover:text-electric-blue transition-all duration-500">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-2">{t('Company', 'บริษัท')}</h4>
              {[
                { name: t('About Us', 'เกี่ยวกับเรา'), path: '/about' },
                { name: t('Work', 'ผลงาน'), path: '/work' },
                { name: t('Solutions', 'โซลูชัน'), path: '/solutions' },
                { name: t('Services', 'บริการ'), path: '/services' },
              ].map((link) => (
                <Link key={link.name} to={link.path} className="text-gray-600 dark:text-gray-400 hover:text-electric-blue dark:hover:text-white text-lg font-medium transition-colors relative group w-fit">
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-electric-blue transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-2">{t('Resources', 'ทรัพยากร')}</h4>
              {[
                { name: t('Press', 'ข่าวสาร'), path: '/press' },
                { name: t('Careers', 'ร่วมงานกับเรา'), path: '/careers' },
                { name: t('Contact', 'ติดต่อเรา'), path: '/contact' },
              ].map((link) => (
                <Link key={link.name} to={link.path} className="text-gray-600 dark:text-gray-400 hover:text-electric-blue dark:hover:text-white text-lg font-medium transition-colors relative group w-fit">
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-electric-blue transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Column 3 - Contact Info */}
            <div className="flex flex-col gap-6 col-span-2 md:col-span-1">
              <h4 className="text-xs font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase mb-2">{t('Get in Touch', 'ติดต่อเรา')}</h4>
              <div className="flex flex-col gap-4 text-gray-600 dark:text-gray-400">
                <a href={`mailto:${config.contact_email_general || 'contact@wewebplus.com'}`} className="hover:text-electric-blue dark:hover:text-white transition-colors flex items-center gap-3">
                  <Mail className="w-4 h-4 text-electric-blue" />
                  {config.contact_email_general || 'contact@wewebplus.com'}
                </a>
                <a href={`mailto:${config.contact_email_sales || 'sales@wewebplus.com'}`} className="hover:text-electric-blue dark:hover:text-white transition-colors flex items-center gap-3">
                  <Mail className="w-4 h-4 text-electric-blue" />
                  {config.contact_email_sales || 'sales@wewebplus.com'}
                </a>
                <a href={`tel:${(config.contact_phone_sales || '0869207736').replace(/\s/g, '')}`} className="hover:text-electric-blue dark:hover:text-white transition-colors flex items-center gap-3">
                  <Phone className="w-4 h-4 text-electric-blue" />
                  Sale: {config.contact_phone_sales || '086 920 7736'}
                </a>
                <a href={`tel:${(config.contact_phone_support || '0805909842').replace(/\s/g, '')}`} className="hover:text-electric-blue dark:hover:text-white transition-colors flex items-center gap-3">
                  <Phone className="w-4 h-4 text-electric-blue" />
                  Support: {config.contact_phone_support || '080 590 9842'}
                </a>
                <div className="flex items-start gap-3 mt-2">
                  <MapPin className="w-4 h-4 text-electric-blue shrink-0 mt-1" />
                  <span className="text-sm leading-relaxed whitespace-pre-line">
                    {language === 'en' 
                      ? (config.contact_address_en || '172 Soi Prasertmanukit 14\nPrasert Manukit Road, Chorakhe Bua,\nLat Phrao District, Bangkok 10230')
                      : (config.contact_address_th || '172 ซอยประเสริฐมนูกิจ 14\nถนนประเสริฐมนูกิจ แขวงจรเข้บัว\nเขตลาดพร้าว กรุงเทพมหานคร 10230')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Massive Typography */}
        <div className="w-full border-t border-black/10 dark:border-white/10 pt-12 pb-8 flex flex-col items-center justify-center relative">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-[12vw] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-black/20 to-black/5 dark:from-white/20 dark:to-white/5 select-none pointer-events-none"
          >
            {config.site_name || 'WEWEBPLUS'}
          </motion.h1>
          
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} {config.site_name || 'WEWEBPLUS'} Co., Ltd. {t('All rights reserved.', 'สงวนลิขสิทธิ์.')}
            </p>
            
            <div className="flex items-center gap-6">
              <a href={config.social_linkedin || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:border-electric-blue hover:bg-electric-blue transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={config.social_facebook || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:border-electric-blue hover:bg-electric-blue transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={config.social_twitter || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white hover:border-electric-blue hover:bg-electric-blue transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/privacy" className="hover:text-electric-blue dark:hover:text-white transition-colors">{t('Privacy Policy', 'นโยบายความเป็นส่วนตัว')}</Link>
              <Link to="/terms" className="hover:text-electric-blue dark:hover:text-white transition-colors">{t('Terms of Service', 'ข้อกำหนดการให้บริการ')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
