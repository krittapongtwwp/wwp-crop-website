import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Solutions() {
  const { t, language } = useLanguage();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSolutions = async () => {
      try {
        const res = await fetchApi('/content/solutions');
        const data = res.data || res;
        setSolutions(Array.isArray(data) ? data.filter((s: any) => s.is_published) : []);
      } catch (err) {
        console.error('Failed to load solutions', err);
      } finally {
        setLoading(false);
      }
    };
    loadSolutions();
  }, []);

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Layers;
    return <IconComponent className="w-8 h-8 text-electric-blue" />;
  };

  const fallbackSolutions = [
    {
      id: 'sol-1',
      slug: 'enterprise-web-applications',
      title_en: 'Enterprise Web Applications',
      title_th: 'เว็บแอปพลิเคชันระดับองค์กร',
      description_en: 'Complex, secure, and robust web apps designed to streamline mission-critical operations at scale.',
      description_th: 'เว็บแอปพลิเคชันที่ซับซ้อน ปลอดภัย และแข็งแกร่ง ออกแบบมาเพื่อเพิ่มประสิทธิภาพการดำเนินงานที่สำคัญในระดับองค์กร',
      icon: 'Monitor',
    },
    {
      id: 'sol-2',
      slug: 'ai-enhanced-business-tools',
      title_en: 'AI-Enhanced Business Tools',
      title_th: 'เครื่องมือธุรกิจที่เสริมด้วย AI',
      description_en: 'Intelligent automation and data-driven insights to future-proof your enterprise and accelerate growth.',
      description_th: 'ระบบอัตโนมัติอัจฉริยะและข้อมูลเชิงลึกที่ขับเคลื่อนด้วยข้อมูล เพื่อเตรียมพร้อมองค์กรของคุณสำหรับอนาคตและเร่งการเติบโต',
      icon: 'Cpu',
    },
    {
      id: 'sol-3',
      slug: 'digital-experience-ux-ui',
      title_en: 'Digital Experience & UX/UI',
      title_th: 'ประสบการณ์ดิจิทัล & UX/UI',
      description_en: 'World-class, user-centric interface design that drives engagement, conversion, and brand loyalty.',
      description_th: 'การออกแบบอินเทอร์เฟซระดับโลกที่เน้นผู้ใช้เป็นศูนย์กลาง ซึ่งขับเคลื่อนการมีส่วนร่วม การแปลง และความภักดีต่อแบรนด์',
      icon: 'Layout',
    },
  ];

  const displaySolutions = solutions.length > 0 ? solutions : fallbackSolutions;

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
            Our <span className="text-gradient">Solutions</span>
          </h1>
          <p className="text-xl text-cool-gray leading-relaxed">
            {t(
              'What solutions are you interested in? We provide comprehensive digital solutions across various industries.',
              'คุณสนใจโซลูชันใด? เราให้บริการโซลูชันดิจิทัลที่ครอบคลุมในหลากหลายอุตสาหกรรม'
            )}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displaySolutions.map((solution, index) => (
              <Link to={`/solutions/${solution.slug}`} key={solution.id} className="group block h-full">
                <GlassCard delay={index * 0.1} className="flex flex-col items-start h-full border-transparent hover:border-electric-blue/50 transition-colors">
                  <div className="shrink-0 p-4 rounded-xl bg-black/5 dark:bg-white/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {renderIcon(solution.icon)}
                  </div>
                  <div className="flex flex-col flex-grow w-full">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-electric-blue transition-colors">
                      {language === 'en' ? solution.title_en : solution.title_th || solution.title_en}
                    </h3>
                    <p className="text-cool-gray leading-relaxed mb-6 flex-grow">
                      {language === 'en' ? solution.description_en : solution.description_th || solution.description_en}
                    </p>
                    <div className="flex items-center text-electric-blue font-medium group-hover:text-sky-blue transition-colors mt-auto">
                      {t('Explore Solution', 'ดูรายละเอียด')}
                      <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
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
