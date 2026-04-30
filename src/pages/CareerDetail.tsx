import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Clock, Briefcase, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { fetchApi } from '@/lib/api';

export default function CareerDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const res = await fetchApi(`/content/careers/${id}`);
        const data = res.data || res;
        const fetchedJob = Array.isArray(data) ? data[0] : data;
        
        if (fetchedJob) {
          setJob(fetchedJob);
        } else {
          // Fallback data
          const fallbacks: Record<string, any> = {
            'senior-frontend-engineer': {
              title_en: 'Senior Frontend Engineer',
              title_th: 'วิศวกรฟรอนต์เอนด์อาวุโส',
              department: 'Engineering',
              location: 'Bangkok, Thailand',
              type: 'Full-time',
              description_en: 'We are looking for a Senior Frontend Engineer to lead the development of our core web applications.',
              description_th: 'เรากำลังมองหาวิศวกรฟรอนต์เอนด์อาวุโสเพื่อเป็นผู้นำในการพัฒนาเว็บแอปพลิเคชันหลักของเรา',
              requirements_en: '<p>5+ years of experience with React, TypeScript, and modern CSS frameworks.</p>',
              requirements_th: '<p>มีประสบการณ์ 5+ ปีกับ React, TypeScript และ CSS frameworks สมัยใหม่</p>'
            },
            'ux-ui-designer': {
              title_en: 'UX/UI Designer',
              title_th: 'นักออกแบบ UX/UI',
              department: 'Design',
              location: 'Remote',
              type: 'Full-time',
              description_en: 'Join our design team to create intuitive and beautiful user experiences for our global clients.',
              description_th: 'เข้าร่วมทีมออกแบบของเราเพื่อสร้างประสบการณ์ผู้ใช้ที่ใช้งานง่ายและสวยงามสำหรับลูกค้าทั่วโลกของเรา',
              requirements_en: '<p>Strong portfolio demonstrating UX/UI skills and proficiency in Figma.</p>',
              requirements_th: '<p>มีพอร์ตโฟลิโอที่แข็งแกร่งซึ่งแสดงทักษะ UX/UI และความเชี่ยวชาญใน Figma</p>'
            },
            'project-manager': {
              title_en: 'Project Manager',
              title_th: 'ผู้จัดการโครงการ',
              department: 'Management',
              location: 'Bangkok, Thailand',
              type: 'Full-time',
              description_en: 'We need an experienced Project Manager to oversee complex software development projects from inception to delivery.',
              description_th: 'เราต้องการผู้จัดการโครงการที่มีประสบการณ์เพื่อดูแลโครงการพัฒนาซอฟต์แวร์ที่ซับซ้อนตั้งแต่เริ่มต้นจนถึงการส่งมอบ',
              requirements_en: '<p>Proven track record of managing agile software projects and excellent communication skills.</p>',
              requirements_th: '<p>มีประวัติที่พิสูจน์แล้วในการจัดการโครงการซอฟต์แวร์แบบ agile และมีทักษะการสื่อสารที่ยอดเยี่ยม</p>'
            }
          };
          setJob(fallbacks[id as string] || null);
        }
      } catch (err: any) {
        if (err.status !== 404) {
          console.error('Failed to load job details', err);
        }
        // Fallback data on error
        const fallbacks: Record<string, any> = {
          'senior-frontend-engineer': {
            title_en: 'Senior Frontend Engineer',
            title_th: 'วิศวกรฟรอนต์เอนด์อาวุโส',
            department: 'Engineering',
            location: 'Bangkok, Thailand',
            type: 'Full-time',
            description_en: 'We are looking for a Senior Frontend Engineer to lead the development of our core web applications.',
            description_th: 'เรากำลังมองหาวิศวกรฟรอนต์เอนด์อาวุโสเพื่อเป็นผู้นำในการพัฒนาเว็บแอปพลิเคชันหลักของเรา',
            requirements_en: '<p>5+ years of experience with React, TypeScript, and modern CSS frameworks.</p>',
            requirements_th: '<p>มีประสบการณ์ 5+ ปีกับ React, TypeScript และ CSS frameworks สมัยใหม่</p>'
          },
          'ux-ui-designer': {
            title_en: 'UX/UI Designer',
            title_th: 'นักออกแบบ UX/UI',
            department: 'Design',
            location: 'Remote',
            type: 'Full-time',
            description_en: 'Join our design team to create intuitive and beautiful user experiences for our global clients.',
            description_th: 'เข้าร่วมทีมออกแบบของเราเพื่อสร้างประสบการณ์ผู้ใช้ที่ใช้งานง่ายและสวยงามสำหรับลูกค้าทั่วโลกของเรา',
            requirements_en: '<p>Strong portfolio demonstrating UX/UI skills and proficiency in Figma.</p>',
            requirements_th: '<p>มีพอร์ตโฟลิโอที่แข็งแกร่งซึ่งแสดงทักษะ UX/UI และความเชี่ยวชาญใน Figma</p>'
          },
          'project-manager': {
            title_en: 'Project Manager',
            title_th: 'ผู้จัดการโครงการ',
            department: 'Management',
            location: 'Bangkok, Thailand',
            type: 'Full-time',
            description_en: 'We need an experienced Project Manager to oversee complex software development projects from inception to delivery.',
            description_th: 'เราต้องการผู้จัดการโครงการที่มีประสบการณ์เพื่อดูแลโครงการพัฒนาซอฟต์แวร์ที่ซับซ้อนตั้งแต่เริ่มต้นจนถึงการส่งมอบ',
            requirements_en: '<p>Proven track record of managing agile software projects and excellent communication skills.</p>',
            requirements_th: '<p>มีประวัติที่พิสูจน์แล้วในการจัดการโครงการซอฟต์แวร์แบบ agile และมีทักษะการสื่อสารที่ยอดเยี่ยม</p>'
          }
        };
        setJob(fallbacks[id as string] || null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadJob();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full pt-32 pb-20 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full pt-32 pb-20 flex flex-col justify-center items-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('Job not found', 'ไม่พบตำแหน่งงาน')}</h2>
        <Link to="/careers" className="text-electric-blue hover:underline">
          {t('Back to Careers', 'กลับไปหน้าตำแหน่งงาน')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <Link to="/careers" className="inline-flex items-center text-cool-gray hover:text-electric-blue transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Careers', 'กลับไปหน้าตำแหน่งงาน')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                {language === 'en' ? job.title_en : job.title_th || job.title_en}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-cool-gray mb-8">
                {job.department && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-electric-blue" />
                    <span>{job.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-electric-blue" />
                  <span>{job.employment_type || job.type || 'Full-time'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-electric-blue" />
                  <span>{job.location}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-electric-blue hover:prose-a:text-sky-blue"
              dangerouslySetInnerHTML={{ __html: language === 'en' ? job.description_en : job.description_th || job.description_en }}
            />
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-32"
            >
              <GlassCard className="p-8 border-electric-blue/20 bg-gradient-to-br from-electric-blue/5 to-transparent">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('Ready to join us?', 'พร้อมที่จะร่วมงานกับเราหรือยัง?')}</h3>
                <p className="text-cool-gray mb-8">
                  {t('Take the next step in your career and help us build world-class digital experiences.', 'ก้าวไปอีกขั้นในอาชีพของคุณและช่วยเราสร้างประสบการณ์ดิจิทัลระดับโลก')}
                </p>
                <Link to={`/careers/${job.slug}/apply`} className="block">
                  <Button size="lg" className="w-full group">
                    {t('Apply Now', 'สมัครเลย')}
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
