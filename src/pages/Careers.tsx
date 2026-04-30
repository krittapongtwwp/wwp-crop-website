import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';

export default function Careers() {
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetchApi('/content/careers');
        const data = res.data || res;
        setJobs(Array.isArray(data) ? data.filter((j: any) => j.status === 'open') : []);
      } catch (err) {
        console.error('Failed to load jobs', err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const fallbackJobs = [
    {
      id: 'job-1',
      slug: 'senior-frontend-engineer',
      title_en: 'Senior Frontend Engineer',
      title_th: 'วิศวกรฟรอนต์เอนด์อาวุโส',
      employment_type: 'Full-time',
      location: 'Bangkok, Thailand (Hybrid)',
      department: 'Engineering'
    },
    {
      id: 'job-2',
      slug: 'ux-ui-designer',
      title_en: 'UX/UI Designer',
      title_th: 'นักออกแบบ UX/UI',
      employment_type: 'Full-time',
      location: 'Bangkok, Thailand (Hybrid)',
      department: 'Design'
    },
    {
      id: 'job-3',
      slug: 'project-manager',
      title_en: 'Project Manager',
      title_th: 'ผู้จัดการโครงการ',
      employment_type: 'Full-time',
      location: 'Bangkok, Thailand',
      department: 'Management'
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs : fallbackJobs;

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
            <span className="text-gradient">CAREERS</span>
          </h1>
          <p className="text-xl text-cool-gray leading-relaxed">
            {t(
              'Join our team.',
              'ร่วมงานกับเรา'
            )}
          </p>
        </motion.div>

        {/* Culture Section */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            {t('Our ', 'วัฒนธรรม')}
            <span className="text-gradient">{t('Culture', 'องค์กร')}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('Excellence in Craft', 'ความเป็นเลิศในงานฝีมือ'),
                desc: t('We care deeply about the details. From pixel-perfect UI to clean, scalable code.', 'เราใส่ใจในรายละเอียดอย่างลึกซึ้ง ตั้งแต่ UI ที่สมบูรณ์แบบไปจนถึงโค้ดที่สะอาดและปรับขนาดได้')
              },
              {
                title: t('Continuous Learning', 'การเรียนรู้อย่างต่อเนื่อง'),
                desc: t('Technology moves fast. We provide resources and time for our team to stay ahead.', 'เทคโนโลยีเคลื่อนที่เร็ว เราจัดหาทรัพยากรและเวลาให้ทีมของเราเพื่อก้าวนำเสมอ')
              },
              {
                title: t('Impactful Work', 'งานที่สร้างผลกระทบ'),
                desc: t('Build systems that serve millions of users and transform large organizations.', 'สร้างระบบที่ให้บริการผู้ใช้หลายล้านคนและพลิกโฉมองค์กรขนาดใหญ่')
              }
            ].map((item, index) => (
              <GlassCard key={index} delay={index * 0.1}>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-cool-gray leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            {t('Open ', 'ตำแหน่ง')}
            <span className="text-gradient">{t('Roles', 'ที่เปิดรับ')}</span>
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
            </div>
          ) : displayJobs.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('No open roles at the moment', 'ยังไม่มีตำแหน่งที่เปิดรับในขณะนี้')}
              </h3>
              <p className="text-cool-gray">
                {t('Please check back later.', 'โปรดกลับมาตรวจสอบอีกครั้ง')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
              {displayJobs.map((job, index) => (
                <GlassCard key={job.id} delay={index * 0.1} className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12 hover:border-electric-blue/50 transition-colors group">
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-electric-blue transition-colors">
                      {language === 'en' ? job.title_en : job.title_th || job.title_en}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-cool-gray text-sm">
                      <span className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">{job.employment_type || job.type || 'Full-time'}</span>
                      <span className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">{job.location}</span>
                      {job.department && (
                        <span className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">{job.department}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 mt-6 md:mt-0">
                    <Link to={`/careers/${job.slug}`} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto">
                        {t('View Details', 'ดูรายละเอียด')}
                      </Button>
                    </Link>
                    <Link to={`/careers/${job.slug}/apply`} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto group/btn">
                        {t('Apply Now', 'สมัครเลย')}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
