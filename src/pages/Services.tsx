import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Services() {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetchApi('/content/services');
        const data = res.data || res;
        setServices(Array.isArray(data) ? data.filter((s: any) => s.is_published) : []);
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Layers;
    return <IconComponent className="w-8 h-8 text-electric-blue" />;
  };

  const fallbackServices = [
    {
      id: 'srv-1',
      slug: 'custom-software-development',
      title_en: 'Custom Software Development',
      title_th: 'การพัฒนาซอฟต์แวร์แบบกำหนดเอง',
      description_en: 'Tailor-made software solutions designed to meet your specific business requirements and challenges.',
      description_th: 'โซลูชันซอฟต์แวร์ที่ปรับแต่งตามความต้องการและความท้าทายทางธุรกิจเฉพาะของคุณ',
      icon: 'Code',
    },
    {
      id: 'srv-2',
      slug: 'cloud-infrastructure',
      title_en: 'Cloud Infrastructure',
      title_th: 'โครงสร้างพื้นฐานคลาวด์',
      description_en: 'Scalable and secure cloud architectures that ensure high availability and performance.',
      description_th: 'สถาปัตยกรรมคลาวด์ที่ขยายได้และปลอดภัย เพื่อให้มั่นใจถึงความพร้อมใช้งานและประสิทธิภาพสูง',
      icon: 'Cloud',
    },
    {
      id: 'srv-3',
      slug: 'data-analytics',
      title_en: 'Data Analytics & AI',
      title_th: 'การวิเคราะห์ข้อมูลและ AI',
      description_en: 'Transform raw data into actionable insights with advanced analytics and machine learning.',
      description_th: 'เปลี่ยนข้อมูลดิบให้เป็นข้อมูลเชิงลึกที่นำไปปฏิบัติได้ด้วยการวิเคราะห์ขั้นสูงและการเรียนรู้ของเครื่อง',
      icon: 'BarChart',
    },
  ];

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <div className="w-full pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Core <span className="text-gradient">Services</span>
          </h1>
          <p className="text-xl text-cool-gray leading-relaxed">
            {t(
              'Comprehensive digital solutions designed for enterprise scale, security, and performance.',
              'โซลูชันดิจิทัลที่ครอบคลุมซึ่งออกแบบมาสำหรับขนาด ความปลอดภัย และประสิทธิภาพระดับองค์กร'
            )}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
          </div>
        ) : displayServices.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('No services found', 'ไม่พบบริการ')}
            </h2>
            <p className="text-cool-gray">
              {t('Check back later for updates.', 'โปรดกลับมาตรวจสอบอีกครั้งในภายหลัง')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayServices.map((service, index) => (
              <Link to={`/services/${service.slug}`} key={service.id} className="group block h-full">
                <GlassCard delay={index * 0.1} className="h-full flex flex-col border-transparent hover:border-electric-blue/50 transition-colors">
                  <div className="mb-6 p-4 rounded-xl bg-black/5 dark:bg-white/5 inline-block w-fit group-hover:scale-110 transition-transform duration-300">
                    {renderIcon(service.icon)}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-electric-blue transition-colors">
                    {language === 'en' ? service.title_en : service.title_th || service.title_en}
                  </h3>
                  <p className="text-cool-gray leading-relaxed flex-grow mb-6">
                    {language === 'en' ? service.description_en : service.description_th || service.description_en}
                  </p>
                  <div className="flex items-center text-electric-blue font-medium group-hover:text-sky-blue transition-colors mt-auto">
                    {t('Learn More', 'เรียนรู้เพิ่มเติม')}
                    <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
