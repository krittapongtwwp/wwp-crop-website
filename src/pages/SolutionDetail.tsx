import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Layers, Zap, Shield } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function SolutionDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [solution, setSolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSolution = async () => {
      try {
        let fetchedSolution = null;
        try {
          const res = await fetchApi(`/content/solutions/${id}`);
          const data = res.data || res;
          fetchedSolution = Array.isArray(data) ? data[0] : data;
        } catch (apiErr) {
          console.warn('API fetch failed, using fallback data if available', apiErr);
        }
        
        if (fetchedSolution) {
          setSolution(fetchedSolution);
        } else {
          // Fallback data
          const fallbacks: Record<string, any> = {
            'enterprise-web-applications': {
              title_en: 'Enterprise Web Applications',
              title_th: 'เว็บแอปพลิเคชันระดับองค์กร',
              description_en: 'Complex, secure, and robust web apps designed to streamline mission-critical operations at scale.',
              description_th: 'เว็บแอปพลิเคชันที่ซับซ้อน ปลอดภัย และแข็งแกร่ง ออกแบบมาเพื่อเพิ่มประสิทธิภาพการดำเนินงานที่สำคัญในระดับองค์กร',
              category: 'Development',
              content_en: '<p>We build enterprise-grade web applications that scale with your business.</p>',
              content_th: '<p>เราสร้างเว็บแอปพลิเคชันระดับองค์กรที่ขยายตัวไปพร้อมกับธุรกิจของคุณ</p>',
              image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80'
            },
            'ai-enhanced-business-tools': {
              title_en: 'AI-Enhanced Business Tools',
              title_th: 'เครื่องมือธุรกิจที่เสริมด้วย AI',
              description_en: 'Intelligent automation and data-driven insights to future-proof your enterprise and accelerate growth.',
              description_th: 'ระบบอัตโนมัติอัจฉริยะและข้อมูลเชิงลึกที่ขับเคลื่อนด้วยข้อมูล เพื่อเตรียมพร้อมองค์กรของคุณสำหรับอนาคตและเร่งการเติบโต',
              category: 'AI & Data',
              content_en: '<p>Leverage the power of AI to transform your business operations.</p>',
              content_th: '<p>ใช้ประโยชน์จากพลังของ AI เพื่อพลิกโฉมการดำเนินธุรกิจของคุณ</p>',
              image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80'
            },
            'digital-experience-ux-ui': {
              title_en: 'Digital Experience & UX/UI',
              title_th: 'ประสบการณ์ดิจิทัล & UX/UI',
              description_en: 'World-class, user-centric interface design that drives engagement, conversion, and brand loyalty.',
              description_th: 'การออกแบบอินเทอร์เฟซระดับโลกที่เน้นผู้ใช้เป็นศูนย์กลาง ซึ่งขับเคลื่อนการมีส่วนร่วม การแปลง และความภักดีต่อแบรนด์',
              category: 'Design',
              content_en: '<p>Create memorable digital experiences that users love.</p>',
              content_th: '<p>สร้างประสบการณ์ดิจิทัลที่น่าจดจำที่ผู้ใช้ชื่นชอบ</p>',
              image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80'
            }
          };
          setSolution(fallbacks[id as string] || null);
        }
      } catch (err: any) {
        if (err.status !== 404) {
          console.error('Failed to load solution', err);
        }
        // Fallback data on error
        const fallbacks: Record<string, any> = {
          'enterprise-web-applications': {
            title_en: 'Enterprise Web Applications',
            title_th: 'เว็บแอปพลิเคชันระดับองค์กร',
            description_en: 'Complex, secure, and robust web apps designed to streamline mission-critical operations at scale.',
            description_th: 'เว็บแอปพลิเคชันที่ซับซ้อน ปลอดภัย และแข็งแกร่ง ออกแบบมาเพื่อเพิ่มประสิทธิภาพการดำเนินงานที่สำคัญในระดับองค์กร',
            category: 'Development',
            content_en: '<p>We build enterprise-grade web applications that scale with your business.</p>',
            content_th: '<p>เราสร้างเว็บแอปพลิเคชันระดับองค์กรที่ขยายตัวไปพร้อมกับธุรกิจของคุณ</p>',
            image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80'
          },
          'ai-enhanced-business-tools': {
            title_en: 'AI-Enhanced Business Tools',
            title_th: 'เครื่องมือธุรกิจที่เสริมด้วย AI',
            description_en: 'Intelligent automation and data-driven insights to future-proof your enterprise and accelerate growth.',
            description_th: 'ระบบอัตโนมัติอัจฉริยะและข้อมูลเชิงลึกที่ขับเคลื่อนด้วยข้อมูล เพื่อเตรียมพร้อมองค์กรของคุณสำหรับอนาคตและเร่งการเติบโต',
            category: 'AI & Data',
            content_en: '<p>Leverage the power of AI to transform your business operations.</p>',
            content_th: '<p>ใช้ประโยชน์จากพลังของ AI เพื่อพลิกโฉมการดำเนินธุรกิจของคุณ</p>',
            image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80'
          },
          'digital-experience-ux-ui': {
            title_en: 'Digital Experience & UX/UI',
            title_th: 'ประสบการณ์ดิจิทัล & UX/UI',
            description_en: 'World-class, user-centric interface design that drives engagement, conversion, and brand loyalty.',
            description_th: 'การออกแบบอินเทอร์เฟซระดับโลกที่เน้นผู้ใช้เป็นศูนย์กลาง ซึ่งขับเคลื่อนการมีส่วนร่วม การแปลง และความภักดีต่อแบรนด์',
            category: 'Design',
            content_en: '<p>Create memorable digital experiences that users love.</p>',
            content_th: '<p>สร้างประสบการณ์ดิจิทัลที่น่าจดจำที่ผู้ใช้ชื่นชอบ</p>',
            image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80'
          }
        };
        setSolution(fallbacks[id as string] || null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadSolution();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full pt-32 pb-20 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="w-full pt-32 pb-20 flex flex-col justify-center items-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('Solution not found', 'ไม่พบโซลูชัน')}</h2>
        <Link to="/solutions" className="text-electric-blue hover:underline">
          {t('Back to Solutions', 'กลับไปหน้าโซลูชัน')}
        </Link>
      </div>
    );
  }

  // Mock features for now, ideally these should come from the backend if added to schema
  const features = [
    {
      icon: <Layers className="w-6 h-6 text-electric-blue" />,
      title: 'Headless Architecture',
      description: 'Decoupled frontend and backend for ultimate flexibility and omnichannel delivery.'
    },
    {
      icon: <Zap className="w-6 h-6 text-electric-blue" />,
      title: 'High Performance',
      description: 'Optimized for speed and reliability, ensuring smooth operations during peak traffic.'
    },
    {
      icon: <Shield className="w-6 h-6 text-electric-blue" />,
      title: 'Enterprise Security',
      description: 'Advanced security protocols and compliance measures to protect sensitive customer data.'
    }
  ];

  return (
    <div className="w-full pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <Link to="/solutions" className="inline-flex items-center text-cool-gray hover:text-electric-blue transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Solutions', 'กลับไปหน้าโซลูชัน')}
        </Link>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-electric-blue font-bold tracking-wider uppercase text-sm mb-4 block">
              {solution.category || 'Solution'}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              {language === 'en' ? solution.title_en : solution.title_th || solution.title_en}
            </h1>
            <p className="text-xl text-cool-gray leading-relaxed max-w-3xl mx-auto">
              {language === 'en' ? solution.description_en : solution.description_th || solution.description_en}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="aspect-[21/9] rounded-3xl overflow-hidden mb-20 shadow-2xl"
          >
            <img 
              src={solution.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80'} 
              alt={language === 'en' ? solution.title_en : solution.title_th || solution.title_en} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2 prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-electric-blue hover:prose-a:text-sky-blue"
              dangerouslySetInnerHTML={{ __html: language === 'en' ? solution.content_en : solution.content_th || solution.content_en }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 border border-gray-100 dark:border-white/5 sticky top-32">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Core Features</h3>
                <div className="space-y-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="shrink-0 mt-1 bg-white dark:bg-black p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                        <p className="text-cool-gray leading-relaxed text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-white/10">
                  <h4 className="text-sm font-bold tracking-wider text-gray-900 dark:text-white uppercase mb-4 text-center">Ready to transform your business?</h4>
                  <Link 
                    to="/contact"
                    className="flex items-center justify-center w-full bg-electric-blue hover:bg-sky-blue text-white px-6 py-4 rounded-xl font-medium transition-colors shadow-lg shadow-electric-blue/20"
                  >
                    Discuss Your Project
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
