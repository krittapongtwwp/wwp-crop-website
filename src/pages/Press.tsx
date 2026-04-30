import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'motion/react';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';

export default function Press() {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadPress = async () => {
      try {
        const res = await fetchApi('/content/press');
        const data = res.data || res;
        setArticles(Array.isArray(data) ? data.filter((p: any) => p.is_published) : []);
      } catch (err) {
        console.error('Failed to load press items', err);
      } finally {
        setLoading(false);
      }
    };
    loadPress();
  }, []);

  const fallbackArticles = [
    {
      id: 'press-1',
      slug: 'wewebplus-wins-digital-agency-award',
      title_en: 'WEWEBPLUS Wins Digital Agency of the Year',
      title_th: 'WEWEBPLUS คว้ารางวัล Digital Agency of the Year',
      excerpt_en: 'Recognized for outstanding innovation and client success in enterprise digital transformation.',
      excerpt_th: 'ได้รับการยกย่องในด้านนวัตกรรมที่โดดเด่นและความสำเร็จของลูกค้าในการเปลี่ยนแปลงทางดิจิทัลระดับองค์กร',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80',
      category: 'Awards',
      published_at: '2023-11-15T00:00:00.000Z'
    },
    {
      id: 'press-2',
      slug: 'launching-new-ai-solutions',
      title_en: 'Launching New AI-Driven Enterprise Solutions',
      title_th: 'เปิดตัวโซลูชันระดับองค์กรที่ขับเคลื่อนด้วย AI ใหม่',
      excerpt_en: 'Our new suite of AI tools is designed to automate workflows and provide deep data insights.',
      excerpt_th: 'ชุดเครื่องมือ AI ใหม่ของเราได้รับการออกแบบมาเพื่อทำให้เวิร์กโฟลว์เป็นอัตโนมัติและให้ข้อมูลเชิงลึกที่ลึกซึ้ง',
      image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80',
      category: 'Product',
      published_at: '2023-10-02T00:00:00.000Z'
    },
    {
      id: 'press-3',
      slug: 'partnership-with-global-tech-leader',
      title_en: 'Strategic Partnership with Global Tech Leader',
      title_th: 'ความร่วมมือเชิงกลยุทธ์กับผู้นำด้านเทคโนโลยีระดับโลก',
      excerpt_en: 'Joining forces to deliver scalable cloud infrastructure and enhanced security for our clients.',
      excerpt_th: 'ผนึกกำลังเพื่อส่งมอบโครงสร้างพื้นฐานคลาวด์ที่ปรับขนาดได้และความปลอดภัยที่เพิ่มขึ้นสำหรับลูกค้าของเรา',
      image_url: 'https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&q=80',
      category: 'Partnership',
      published_at: '2023-08-20T00:00:00.000Z'
    }
  ];

  const displayArticles = articles.length > 0 ? articles : fallbackArticles;

  const totalPages = Math.ceil(displayArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = displayArticles.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white uppercase">
            <span className="text-gradient">PRESS</span>
          </h1>
          <p className="text-xl text-cool-gray leading-relaxed">
            {t(
              'Stay updated with the latest news and insights from WEWEBPLUS.',
              'ติดตามข่าวสารและข้อมูลเชิงลึกอัปเดตล่าสุดจาก WEWEBPLUS'
            )}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('No press articles available at the moment.', 'ยังไม่มีบทความข่าวในขณะนี้')}
            </h2>
            <p className="text-cool-gray">
              {t('Check back later for updates.', 'โปรดกลับมาตรวจสอบอีกครั้งในภายหลัง')}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {currentArticles.map((article, index) => (
                <Link to={`/press/${article.slug}`} key={article.id} className="group block">
                  <GlassCard delay={index * 0.1} className="h-full overflow-hidden p-0 border-transparent hover:border-electric-blue/50 transition-colors">
                    <div className="aspect-video overflow-hidden relative">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                      <img 
                        src={article.image_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80'} 
                        alt={language === 'en' ? article.title_en : article.title_th || article.title_en}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-electric-blue text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {article.category || 'News'}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-2 text-sm text-cool-gray mb-4">
                        <Calendar className="w-4 h-4" />
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-electric-blue transition-colors line-clamp-2">
                        {language === 'en' ? article.title_en : article.title_th || article.title_en}
                      </h3>
                      <p className="text-cool-gray leading-relaxed mb-6 line-clamp-2">
                        {language === 'en' ? article.excerpt_en : article.excerpt_th || article.excerpt_en}
                      </p>
                      <div className="flex items-center text-electric-blue font-medium group-hover:text-sky-blue transition-colors">
                        {t('Read More', 'อ่านเพิ่มเติม')}
                        <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-400 hover:text-electric-blue hover:border-electric-blue transition-colors disabled:opacity-50 disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 disabled:hover:text-gray-400"
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  const isActive = page === currentPage;
                  return (
                    <button 
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isActive 
                          ? 'bg-electric-blue text-white font-medium border border-electric-blue' 
                          : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-electric-blue hover:border-electric-blue'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-400 hover:text-electric-blue hover:border-electric-blue transition-colors disabled:opacity-50 disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 disabled:hover:text-gray-400"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
