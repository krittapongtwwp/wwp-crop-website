import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { fetchApi } from '@/lib/api';

export default function CareerApply() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    portfolio_url: '',
    cover_letter: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('job_id', job.id.toString());
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('portfolio_url', formData.portfolio_url);
      submitData.append('cover_letter', formData.cover_letter);
      
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      await fetchApi('/content/careers/apply', {
        method: 'POST',
        body: submitData,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error('Failed to submit application', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (success) {
    return (
      <div className="w-full pt-32 pb-20 flex flex-col justify-center items-center min-h-[50vh]">
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-8 rounded-2xl text-center max-w-lg">
          <h2 className="text-3xl font-bold mb-4">{t('Application Submitted!', 'ส่งใบสมัครเรียบร้อย!')}</h2>
          <p className="mb-8">{t('Thank you for applying. We will review your application and get back to you soon.', 'ขอบคุณที่สมัครงานกับเรา เราจะตรวจสอบใบสมัครของคุณและติดต่อกลับโดยเร็วที่สุด')}</p>
          <Link to="/careers">
            <Button>{t('Back to Careers', 'กลับไปหน้าตำแหน่งงาน')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <Link to={`/careers/${id}`} className="inline-flex items-center text-cool-gray hover:text-electric-blue transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Job Details', 'กลับไปหน้ารายละเอียดงาน')}
        </Link>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('Apply for ', 'สมัครตำแหน่ง ')}
              <span className="text-gradient">{language === 'en' ? job.title_en : job.title_th || job.title_en}</span>
            </h1>
            <p className="text-xl text-cool-gray">
              {t('Fill out the form below to submit your application.', 'กรอกแบบฟอร์มด้านล่างเพื่อส่งใบสมัครของคุณ')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <GlassCard className="p-8 md:p-12">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('First Name', 'ชื่อ')} *</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Last Name', 'นามสกุล')} *</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Email', 'อีเมล')} *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Phone Number', 'เบอร์โทรศัพท์')}</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Portfolio / LinkedIn URL', 'ลิงก์พอร์ตโฟลิโอ / LinkedIn')}</label>
                  <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Resume / CV', 'เรซูเม่ / CV')} *</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl cursor-pointer bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-cool-gray" />
                        <p className="mb-2 text-sm text-cool-gray">
                          {resumeFile ? (
                            <span className="font-semibold text-electric-blue">{resumeFile.name}</span>
                          ) : (
                            <>
                              <span className="font-semibold">{t('Click to upload', 'คลิกเพื่ออัปโหลด')}</span> {t('or drag and drop', 'หรือลากและวาง')}
                            </>
                          )}
                        </p>
                        <p className="text-xs text-cool-gray">PDF, DOCX (MAX. 10MB)</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Cover Letter / Message', 'จดหมายแนะนำตัว / ข้อความ')}</label>
                  <textarea name="cover_letter" value={formData.cover_letter} onChange={handleChange} rows={5} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all resize-none" />
                </div>

                <Button type="submit" size="lg" className="w-full group" disabled={submitting}>
                  {submitting ? t('Submitting...', 'กำลังส่ง...') : t('Submit Application', 'ส่งใบสมัคร')}
                  {!submitting && <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
