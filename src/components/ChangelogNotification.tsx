import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ChevronRight, History } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../lib/api';
import { Link } from 'react-router-dom';

export function ChangelogNotification() {
  const { language } = useLanguage();
  const [latestLog, setLatestLog] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkChangelog = async () => {
      try {
        const res = await fetchApi('/content/changelog');
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const published = data.filter((log: any) => log.is_published === 1)
            .sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
          
          if (published.length > 0) {
            const latest = published[0];
            const lastSeenVersion = localStorage.getItem('wwp_last_seen_version');
            
            if (lastSeenVersion !== latest.version) {
              setLatestLog(latest);
              // Show after a short delay
              setTimeout(() => setIsVisible(true), 2000);
            }
          }
        }
      } catch (err) {
        console.error('Failed to check changelog', err);
      }
    };

    checkChangelog();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (latestLog) {
      localStorage.setItem('wwp_last_seen_version', latestLog.version);
    }
  };

  if (!latestLog) return null;

  const t = {
    newUpdate: language === 'en' ? "System Update" : "อัปเดตระบบ",
    viewAll: language === 'en' ? "Manage Updates" : "จัดการการอัปเดต",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bottom-8 right-6 z-50 max-w-sm w-full"
        >
          <div className="wwp-card p-5 shadow-2xl border-primary-blue/20 overflow-hidden relative group bg-white dark:bg-gray-800">
            <div className="absolute top-0 left-0 w-1 h-full wwp-gradient" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                <History className="w-5 h-5 text-primary-blue" />
              </div>
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-blue bg-blue-50 dark:bg-primary-blue/10 px-2 py-0.5 rounded">
                    {t.newUpdate}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted">
                    v{latestLog.version}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-main dark:text-white mb-1 line-clamp-1">
                  {language === 'en' ? latestLog.title_en : latestLog.title_th}
                </h4>
                <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {language === 'en' ? latestLog.content_en : latestLog.content_th}
                </p>
                <div className="flex items-center gap-4">
                  <Link 
                    to="/weadmin/changelog"
                    onClick={handleDismiss}
                    className="text-xs font-bold text-primary-blue hover:underline flex items-center"
                  >
                    {t.viewAll}
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                  <button 
                    onClick={handleDismiss}
                    className="text-xs font-bold text-text-muted hover:text-text-main"
                  >
                    {language === 'en' ? 'Dismiss' : 'ปิด'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
