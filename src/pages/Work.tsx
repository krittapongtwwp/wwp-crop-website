import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';

export default function Work() {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 4;

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const res = await fetchApi('/content/portfolio');
        const data = res.data || res;
        setPortfolioData(Array.isArray(data) ? data.filter((p: any) => p.is_published) : []);
      } catch (err) {
        console.error('Failed to load portfolio data', err);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, []);

  const fallbackPortfolio = [
    {
      id: 'work-1',
      slug: 'national-public-service-portal',
      title_en: 'National Public Service Portal',
      title_th: 'พอร์ทัลบริการสาธารณะแห่งชาติ',
      client_name_en: 'Ministry of Finance',
      client_name_th: 'กระทรวงการคลัง',
      industry: 'GovTech',
      description_en: 'A comprehensive digital portal streamlining government services for millions of citizens.',
      description_th: 'พอร์ทัลดิจิทัลที่ครอบคลุมซึ่งเพิ่มประสิทธิภาพบริการของรัฐสำหรับประชาชนหลายล้านคน',
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: 'work-2',
      slug: 'global-banking-dashboard',
      title_en: 'Global Banking Dashboard',
      title_th: 'แดชบอร์ดการธนาคารระดับโลก',
      client_name_en: 'Global Bank Corp',
      client_name_th: 'โกลบอล แบงก์ คอร์ป',
      industry: 'FinTech',
      description_en: 'An intuitive and secure financial dashboard managing billions in daily transactions.',
      description_th: 'แดชบอร์ดทางการเงินที่ใช้งานง่ายและปลอดภัย ซึ่งจัดการธุรกรรมหลายพันล้านรายการต่อวัน',
      cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: 'work-3',
      slug: 'smart-city-mobility-app',
      title_en: 'Smart City Mobility App',
      title_th: 'แอปพลิเคชันการเดินทางในเมืองอัจฉริยะ',
      client_name_en: 'Smart City Initiative',
      client_name_th: 'โครงการเมืองอัจฉริยะ',
      industry: 'Urban Tech',
      description_en: 'A unified mobility application integrating public transit, ride-sharing, and micro-mobility.',
      description_th: 'แอปพลิเคชันการเดินทางแบบครบวงจรที่รวมระบบขนส่งสาธารณะ การเรียกรถ และการเดินทางระยะสั้น',
      cover_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: 'work-4',
      slug: 'enterprise-resource-planning',
      title_en: 'Enterprise Resource Planning',
      title_th: 'การวางแผนทรัพยากรองค์กร',
      client_name_en: 'Tech Innovators Inc',
      client_name_th: 'เทค อินโนเวเตอร์ อิงค์',
      industry: 'Enterprise',
      description_en: 'A custom ERP solution optimizing supply chain and human resources for a global tech firm.',
      description_th: 'โซลูชัน ERP แบบกำหนดเองที่เพิ่มประสิทธิภาพห่วงโซ่อุปทานและทรัพยากรบุคคลสำหรับบริษัทเทคโนโลยีระดับโลก',
      cover_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2000'
    }
  ];

  const displayPortfolio = portfolioData.length > 0 ? portfolioData : fallbackPortfolio;

  const totalPages = Math.ceil(displayPortfolio.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudies = displayPortfolio.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="w-full pt-32 pb-20 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

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
            <span className="text-gradient">WORKS</span>
          </h1>
          <p className="text-xl text-cool-gray leading-relaxed">
            {t(
              'We create your digital identity.',
              'เราสร้างตัวตนดิจิทัลของคุณ'
            )}
          </p>
        </motion.div>

        {displayPortfolio.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('No projects found', 'ไม่พบผลงาน')}
            </h2>
            <p className="text-cool-gray">
              {t('Check back later for updates.', 'โปรดกลับมาตรวจสอบอีกครั้งในภายหลัง')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {currentStudies.map((study, index) => (
              <Link to={`/work/${study.slug}`} key={study.id} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="group cursor-pointer"
                >
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-6">
                  <div className="absolute inset-0 bg-corporate-blue/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={study.cover_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3'} 
                    alt={language === 'en' ? study.title_en : study.title_th || study.title_en}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-corporate-blue via-corporate-blue/20 to-transparent z-20" />
                  
                  <div className="absolute bottom-0 left-0 p-8 z-30 w-full">
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {study.industry && (
                        <span className="px-3 py-1 text-xs font-medium text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                          {study.industry}
                        </span>
                      )}
                    </div>
                    <p className="text-electric-blue font-medium mb-2">{language === 'en' ? study.client_name_en : study.client_name_th || study.client_name_en}</p>
                    <h3 className="text-2xl font-bold text-white mb-2">{language === 'en' ? study.title_en : study.title_th || study.title_en}</h3>
                  </div>
                </div>
                <p className="text-cool-gray leading-relaxed mb-6">{language === 'en' ? study.description_en : study.description_th || study.description_en}</p>
              </motion.div>
              </Link>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
}
