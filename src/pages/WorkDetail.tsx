import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Globe } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWork = async () => {
      try {
        setLoading(true);
        let fetchedWork = null;
        try {
          const res = await fetchApi(`/content/portfolio/${id}`);
          const data = res.data || res;
          fetchedWork = Array.isArray(data) ? data[0] : data;
        } catch (apiErr: any) {
          console.warn('API fetch failed, using fallback data if available', apiErr);
        }
        
        if (fetchedWork) {
          setWork(fetchedWork);
        } else {
          // Fallback data
          const fallbacks: Record<string, any> = {
            'national-public-service-portal': {
              title_en: 'National Public Service Portal',
              title_th: 'พอร์ทัลบริการสาธารณะแห่งชาติ',
              client_name: 'Ministry of Digital Economy',
              industry: 'Government',
              description_en: 'A unified portal for citizens to access over 100+ government services seamlessly.',
              description_th: 'พอร์ทัลแบบครบวงจรสำหรับประชาชนในการเข้าถึงบริการของรัฐมากกว่า 100+ บริการอย่างราบรื่น',
              content_en: '<p>We redesigned and rebuilt the national portal to be more accessible and user-friendly.</p>',
              content_th: '<p>เราได้ออกแบบและสร้างพอร์ทัลแห่งชาติใหม่เพื่อให้เข้าถึงได้ง่ายและเป็นมิตรกับผู้ใช้มากขึ้น</p>',
              cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'
            },
            'global-banking-dashboard': {
              title_en: 'Global Banking Dashboard',
              title_th: 'แดชบอร์ดการธนาคารระดับโลก',
              client_name: 'Global Bank Corp',
              industry: 'Finance',
              description_en: 'Real-time financial analytics and reporting dashboard for institutional clients.',
              description_th: 'แดชบอร์ดการวิเคราะห์และการรายงานทางการเงินแบบเรียลไทม์สำหรับลูกค้าสถาบัน',
              content_en: '<p>A high-performance dashboard handling millions of transactions per second.</p>',
              content_th: '<p>แดชบอร์ดประสิทธิภาพสูงที่จัดการธุรกรรมนับล้านรายการต่อวินาที</p>',
              cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'
            },
            'smart-city-mobility-app': {
              title_en: 'Smart City Mobility App',
              title_th: 'แอปพลิเคชันการสัญจรเมืองอัจฉริยะ',
              client_name: 'Metropolitan Transit',
              industry: 'Transportation',
              description_en: 'Integrated mobility solution combining public transit, ride-sharing, and micro-mobility.',
              description_th: 'โซลูชันการสัญจรแบบบูรณาการที่รวมระบบขนส่งสาธารณะ การแชร์รถ และการสัญจรขนาดเล็ก',
              content_en: '<p>Connecting millions of commuters with efficient routing and real-time updates.</p>',
              content_th: '<p>เชื่อมต่อผู้สัญจรนับล้านด้วยเส้นทางที่มีประสิทธิภาพและการอัปเดตแบบเรียลไทม์</p>',
              cover_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80'
            },
            'enterprise-resource-planning': {
              title_en: 'Enterprise Resource Planning',
              title_th: 'การวางแผนทรัพยากรองค์กร',
              client_name: 'Manufacturing Giant',
              industry: 'Manufacturing',
              description_en: 'Custom ERP solution streamlining supply chain, inventory, and production processes.',
              description_th: 'โซลูชัน ERP แบบกำหนดเองที่เพิ่มประสิทธิภาพห่วงโซ่อุปทาน สินค้าคงคลัง และกระบวนการผลิต',
              content_en: '<p>A comprehensive system that reduced operational costs by 30%.</p>',
              content_th: '<p>ระบบที่ครอบคลุมซึ่งลดต้นทุนการดำเนินงานได้ถึง 30%</p>',
              cover_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80'
            }
          };
          setWork(fallbacks[id as string] || null);
        }
      } catch (err: any) {
        if (err.status !== 404) {
          console.error('Failed to load portfolio item', err);
        }
        // Fallback data on error
        const fallbacks: Record<string, any> = {
          'national-public-service-portal': {
            title_en: 'National Public Service Portal',
            title_th: 'พอร์ทัลบริการสาธารณะแห่งชาติ',
            client_name: 'Ministry of Digital Economy',
            industry: 'Government',
            description_en: 'A unified portal for citizens to access over 100+ government services seamlessly.',
            description_th: 'พอร์ทัลแบบครบวงจรสำหรับประชาชนในการเข้าถึงบริการของรัฐมากกว่า 100+ บริการอย่างราบรื่น',
            content_en: '<p>We redesigned and rebuilt the national portal to be more accessible and user-friendly.</p>',
            content_th: '<p>เราได้ออกแบบและสร้างพอร์ทัลแห่งชาติใหม่เพื่อให้เข้าถึงได้ง่ายและเป็นมิตรกับผู้ใช้มากขึ้น</p>',
            cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'
          },
          'global-banking-dashboard': {
            title_en: 'Global Banking Dashboard',
            title_th: 'แดชบอร์ดการธนาคารระดับโลก',
            client_name: 'Global Bank Corp',
            industry: 'Finance',
            description_en: 'Real-time financial analytics and reporting dashboard for institutional clients.',
            description_th: 'แดชบอร์ดการวิเคราะห์และการรายงานทางการเงินแบบเรียลไทม์สำหรับลูกค้าสถาบัน',
            content_en: '<p>A high-performance dashboard handling millions of transactions per second.</p>',
            content_th: '<p>แดชบอร์ดประสิทธิภาพสูงที่จัดการธุรกรรมนับล้านรายการต่อวินาที</p>',
            cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'
          },
          'smart-city-mobility-app': {
            title_en: 'Smart City Mobility App',
            title_th: 'แอปพลิเคชันการสัญจรเมืองอัจฉริยะ',
            client_name: 'Metropolitan Transit',
            industry: 'Transportation',
            description_en: 'Integrated mobility solution combining public transit, ride-sharing, and micro-mobility.',
            description_th: 'โซลูชันการสัญจรแบบบูรณาการที่รวมระบบขนส่งสาธารณะ การแชร์รถ และการสัญจรขนาดเล็ก',
            content_en: '<p>Connecting millions of commuters with efficient routing and real-time updates.</p>',
            content_th: '<p>เชื่อมต่อผู้สัญจรนับล้านด้วยเส้นทางที่มีประสิทธิภาพและการอัปเดตแบบเรียลไทม์</p>',
            cover_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80'
          },
          'enterprise-resource-planning': {
            title_en: 'Enterprise Resource Planning',
            title_th: 'การวางแผนทรัพยากรองค์กร',
            client_name: 'Manufacturing Giant',
            industry: 'Manufacturing',
            description_en: 'Custom ERP solution streamlining supply chain, inventory, and production processes.',
            description_th: 'โซลูชัน ERP แบบกำหนดเองที่เพิ่มประสิทธิภาพห่วงโซ่อุปทาน สินค้าคงคลัง และกระบวนการผลิต',
            content_en: '<p>A comprehensive system that reduced operational costs by 30%.</p>',
            content_th: '<p>ระบบที่ครอบคลุมซึ่งลดต้นทุนการดำเนินงานได้ถึง 30%</p>',
            cover_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80'
          }
        };
        const fallbackWork = fallbacks[id as string] || null;
        setWork(fallbackWork);
        if (!fallbackWork) {
          setError('Failed to load project details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadWork();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full pt-32 pb-20 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="w-full pt-32 pb-20 flex flex-col justify-center items-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('Project Not Found', 'ไม่พบโครงการ')}
        </h2>
        <p className="text-cool-gray mb-8">
          {t('The project you are looking for does not exist or has been removed.', 'โครงการที่คุณกำลังมองหาไม่มีอยู่หรือถูกลบไปแล้ว')}
        </p>
        <button
          onClick={() => navigate('/work')}
          className="flex items-center gap-2 text-electric-blue hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('Back to Works', 'กลับไปที่ผลงาน')}
        </button>
      </div>
    );
  }

  const title = language === 'en' ? work.title_en : work.title_th || work.title_en;
  const description = language === 'en' ? work.description_en : work.description_th || work.description_en;
  const content = language === 'en' ? work.content_en : work.content_th || work.content_en;
  const clientName = language === 'en' ? work.client_name_en : work.client_name_th || work.client_name_en;

  return (
    <div className="w-full pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <Link to="/work" className="inline-flex items-center text-cool-gray hover:text-electric-blue transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Works', 'กลับไปหน้าผลงาน')}
        </Link>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              {title}
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 py-8 border-y border-gray-200 dark:border-white/10">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('Client', 'ลูกค้า')}</h4>
                <p className="text-gray-900 dark:text-white font-medium">{clientName || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('Industry', 'อุตสาหกรรม')}</h4>
                <p className="text-gray-900 dark:text-white font-medium">{work.industry || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('Date', 'วันที่')}</h4>
                <p className="text-gray-900 dark:text-white font-medium">
                  {work.completion_date 
                    ? new Date(work.completion_date).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '-'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('Link', 'ลิงก์')}</h4>
                {work.website_url ? (
                  <a href={work.website_url} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:text-sky-blue font-medium">
                    {t('Visit Site', 'เข้าชมเว็บไซต์')}
                  </a>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">-</p>
                )}
              </div>
            </div>

            {work.cover_image && (
              <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-16">
                <img 
                  src={work.cover_image} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-2 prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-electric-blue hover:prose-a:text-sky-blue"
            >
              {description && (
                <div className="text-xl text-cool-gray leading-relaxed mb-8">
                  {description}
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: content || '' }} />
            </motion.div>
            
            {/* If there are additional images, we could render them here. For now, we'll leave it empty or render a placeholder if needed. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:col-span-1 space-y-8"
            >
              {/* Additional images could go here */}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
