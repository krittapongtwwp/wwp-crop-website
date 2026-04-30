import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        let fetchedService = null;
        try {
          const res = await fetchApi(`/content/services/${id}`);
          const data = res.data || res;
          fetchedService = Array.isArray(data) ? data[0] : data;
        } catch (apiErr) {
          console.warn('API fetch failed, using fallback data if available', apiErr);
        }
        
        if (fetchedService) {
          setService(fetchedService);
        } else {
          // Fallback data
          const fallbacks: Record<string, any> = {
            'custom-software-development': {
              title_en: 'Custom Software Development',
              title_th: 'การพัฒนาซอฟต์แวร์แบบกำหนดเอง',
              description_en: 'Tailor-made software solutions designed to meet your specific business requirements and challenges.',
              description_th: 'โซลูชันซอฟต์แวร์ที่ปรับแต่งตามความต้องการและความท้าทายทางธุรกิจเฉพาะของคุณ',
              category: 'Engineering',
              content_en: '<p>We build custom software that solves complex business problems.</p>',
              content_th: '<p>เราสร้างซอฟต์แวร์แบบกำหนดเองที่แก้ปัญหาทางธุรกิจที่ซับซ้อน</p>',
              image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80'
            },
            'cloud-infrastructure': {
              title_en: 'Cloud Infrastructure',
              title_th: 'โครงสร้างพื้นฐานคลาวด์',
              description_en: 'Scalable and secure cloud architectures that ensure high availability and performance.',
              description_th: 'สถาปัตยกรรมคลาวด์ที่ขยายได้และปลอดภัย เพื่อให้มั่นใจถึงความพร้อมใช้งานและประสิทธิภาพสูง',
              category: 'Infrastructure',
              content_en: '<p>Modernize your infrastructure with scalable cloud solutions.</p>',
              content_th: '<p>ปรับปรุงโครงสร้างพื้นฐานของคุณให้ทันสมัยด้วยโซลูชันคลาวด์ที่ขยายได้</p>',
              image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80'
            },
            'data-analytics': {
              title_en: 'Data Analytics & AI',
              title_th: 'การวิเคราะห์ข้อมูลและ AI',
              description_en: 'Transform raw data into actionable insights with advanced analytics and machine learning.',
              description_th: 'เปลี่ยนข้อมูลดิบให้เป็นข้อมูลเชิงลึกที่นำไปปฏิบัติได้ด้วยการวิเคราะห์ขั้นสูงและการเรียนรู้ของเครื่อง',
              category: 'Data',
              content_en: '<p>Unlock the value of your data with advanced analytics.</p>',
              content_th: '<p>ปลดล็อกมูลค่าข้อมูลของคุณด้วยการวิเคราะห์ขั้นสูง</p>',
              image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'
            }
          };
          setService(fallbacks[id as string] || null);
        }
      } catch (err: any) {
        if (err.status !== 404) {
          console.error('Failed to load service', err);
        }
        // Fallback data on error
        const fallbacks: Record<string, any> = {
          'custom-software-development': {
            title_en: 'Custom Software Development',
            title_th: 'การพัฒนาซอฟต์แวร์แบบกำหนดเอง',
            description_en: 'Tailor-made software solutions designed to meet your specific business requirements and challenges.',
            description_th: 'โซลูชันซอฟต์แวร์ที่ปรับแต่งตามความต้องการและความท้าทายทางธุรกิจเฉพาะของคุณ',
            category: 'Engineering',
            content_en: '<p>We build custom software that solves complex business problems.</p>',
            content_th: '<p>เราสร้างซอฟต์แวร์แบบกำหนดเองที่แก้ปัญหาทางธุรกิจที่ซับซ้อน</p>',
            image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80'
          },
          'cloud-infrastructure': {
            title_en: 'Cloud Infrastructure',
            title_th: 'โครงสร้างพื้นฐานคลาวด์',
            description_en: 'Scalable and secure cloud architectures that ensure high availability and performance.',
            description_th: 'สถาปัตยกรรมคลาวด์ที่ขยายได้และปลอดภัย เพื่อให้มั่นใจถึงความพร้อมใช้งานและประสิทธิภาพสูง',
            category: 'Infrastructure',
            content_en: '<p>Modernize your infrastructure with scalable cloud solutions.</p>',
            content_th: '<p>ปรับปรุงโครงสร้างพื้นฐานของคุณให้ทันสมัยด้วยโซลูชันคลาวด์ที่ขยายได้</p>',
            image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80'
          },
          'data-analytics': {
            title_en: 'Data Analytics & AI',
            title_th: 'การวิเคราะห์ข้อมูลและ AI',
            description_en: 'Transform raw data into actionable insights with advanced analytics and machine learning.',
            description_th: 'เปลี่ยนข้อมูลดิบให้เป็นข้อมูลเชิงลึกที่นำไปปฏิบัติได้ด้วยการวิเคราะห์ขั้นสูงและการเรียนรู้ของเครื่อง',
            category: 'Data',
            content_en: '<p>Unlock the value of your data with advanced analytics.</p>',
            content_th: '<p>ปลดล็อกมูลค่าข้อมูลของคุณด้วยการวิเคราะห์ขั้นสูง</p>',
            image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'
          }
        };
        const fallbackService = fallbacks[id as string] || null;
        setService(fallbackService);
        if (!fallbackService) {
          setError('Failed to load service details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadService();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full pt-32 pb-20 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="w-full pt-32 pb-20 flex flex-col justify-center items-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('Service Not Found', 'ไม่พบบริการ')}
        </h2>
        <p className="text-cool-gray mb-8">
          {t('The service you are looking for does not exist or has been removed.', 'บริการที่คุณกำลังมองหาไม่มีอยู่หรือถูกลบไปแล้ว')}
        </p>
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-2 text-electric-blue hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('Back to Services', 'กลับไปหน้าบริการ')}
        </button>
      </div>
    );
  }

  const title = language === 'en' ? service.title_en : service.title_th || service.title_en;
  const description = language === 'en' ? service.description_en : service.description_th || service.description_en;
  const content = language === 'en' ? service.content_en : service.content_th || service.content_en;

  // Mock benefits for now, ideally these should come from the backend if added to schema
  const benefits = [
    'Increased Operational Efficiency',
    'Enhanced User Engagement',
    'Scalable Architecture',
    'Data-Driven Insights'
  ];

  return (
    <div className="w-full pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <Link to="/services" className="inline-flex items-center text-cool-gray hover:text-electric-blue transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Services', 'กลับไปหน้าบริการ')}
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
            <p className="text-xl text-cool-gray leading-relaxed mb-8">
              {description}
            </p>
            {service.image_url && (
              <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-12">
                <img 
                  src={service.image_url} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-2 prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-electric-blue hover:prose-a:text-sky-blue"
              dangerouslySetInnerHTML={{ __html: content || '' }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:col-span-1"
            >
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 border border-gray-100 dark:border-white/5 sticky top-32">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Benefits</h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-electric-blue shrink-0 mt-0.5" />
                      <span className="text-cool-gray">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
                  <h4 className="text-sm font-bold tracking-wider text-gray-900 dark:text-white uppercase mb-4">Ready to start?</h4>
                  <Link 
                    to="/contact"
                    className="block w-full text-center bg-electric-blue hover:bg-sky-blue text-white px-6 py-3 rounded-full font-medium transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
