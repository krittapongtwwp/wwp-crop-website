import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { Shield, X } from 'lucide-react';
import { Button } from './ui/Button';

export function CookieConsent() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('wewebplus_cookie_consent');
    if (!hasConsented) {
      // Small delay before showing to not overwhelm on initial load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('wewebplus_cookie_consent', 'all');
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('wewebplus_cookie_consent', 'rejected');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[420px] z-[100]"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-[#0A0F1C]/70 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6">
            {/* Subtle glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-electric-blue/20 rounded-full blur-[50px] pointer-events-none" />
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-full bg-electric-blue/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-electric-blue" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  {t('Your Privacy, Transparently Managed', 'ความเป็นส่วนตัวของคุณ จัดการได้อย่างโปร่งใส')}
                </h3>
                <p className="text-sm text-cool-gray leading-relaxed">
                  {t(
                    'We use cookies to enhance your experience, analyze traffic, and improve our services. You can accept all cookies or manage your preferences.',
                    'เราใช้คุกกี้เพื่อยกระดับประสบการณ์ของคุณ วิเคราะห์การเข้าชม และปรับปรุงบริการของเรา คุณสามารถยอมรับคุกกี้ทั้งหมดหรือจัดการการตั้งค่าของคุณได้'
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="flex-1 bg-electric-blue hover:bg-sky-blue text-white shadow-lg shadow-electric-blue/20"
                >
                  {t('Accept All', 'ยอมรับทั้งหมด')}
                </Button>
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                  className="flex-1 bg-white/50 dark:bg-black/50 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {t('Reject All', 'ปฏิเสธทั้งหมด')}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-1">
                <button className="text-xs text-cool-gray hover:text-electric-blue transition-colors underline underline-offset-2">
                  {t('Customize Preferences', 'จัดการการตั้งค่า')}
                </button>
                <div className="flex gap-3">
                  <a href="/privacy" className="text-xs text-cool-gray hover:text-electric-blue transition-colors">
                    {t('Privacy Policy', 'นโยบายความเป็นส่วนตัว')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
