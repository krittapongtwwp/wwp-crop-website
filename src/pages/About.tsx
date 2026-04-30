import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'motion/react';

export default function About() {
  const { t } = useLanguage();

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
            About <span className="text-gradient">WEWEBPLUS</span>
          </h1>
          <p className="text-xl text-cool-gray leading-relaxed">
            {t(
              'Wewebplus the Digital Innovation one-stop service provider with 15+ years of experience, high-quality work management systems, and sustainability-building processes for organizations, is highly trusted by its business partners including 200+ leading government and private organizations.',
              'Wewebplus ผู้ให้บริการ Digital Innovation แบบครบวงจรด้วยประสบการณ์กว่า 15 ปี ระบบการจัดการงานคุณภาพสูง และกระบวนการสร้างความยั่งยืนสำหรับองค์กร ได้รับความไว้วางใจอย่างสูงจากพันธมิตรทางธุรกิจ รวมถึงองค์กรภาครัฐและเอกชนชั้นนำกว่า 200 แห่ง'
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
          <GlassCard>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('Our Mission', 'พันธกิจของเรา')}</h3>
            <p className="text-cool-gray leading-relaxed">
              {t(
                'To empower government agencies and enterprise organizations with world-class digital systems that drive efficiency, security, and growth in the AI era.',
                'เพื่อเพิ่มศักยภาพให้กับหน่วยงานรัฐบาลและองค์กรด้วยระบบดิจิทัลระดับโลกที่ขับเคลื่อนประสิทธิภาพ ความปลอดภัย และการเติบโตในยุค AI'
              )}
            </p>
          </GlassCard>
          <GlassCard delay={0.2}>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('Our Vision', 'วิสัยทัศน์ของเรา')}</h3>
            <p className="text-cool-gray leading-relaxed">
              {t(
                'To be the most trusted digital transformation partner in Southeast Asia, known for Apple-grade design and enterprise-grade engineering.',
                'เพื่อเป็นพันธมิตรด้านการทรานส์ฟอร์มดิจิทัลที่ได้รับความไว้วางใจมากที่สุดในเอเชียตะวันออกเฉียงใต้ ซึ่งเป็นที่รู้จักในด้านการออกแบบระดับ Apple และวิศวกรรมระดับองค์กร'
              )}
            </p>
          </GlassCard>
        </div>

        {/* Executive Team */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            {t('Executive ', 'ทีม')}
            <span className="text-gradient">{t('Team', 'ผู้บริหาร')}</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { name: 'John Doe', role: 'Chief Executive Officer', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Jane Smith', role: 'Chief Technology Officer', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Michael Chen', role: 'Head of Design', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Sarah Johnson', role: 'Head of Strategy', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-4">
                  <img src={member.image} alt={member.name} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h4>
                <p className="text-electric-blue text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            {t('Our ', 'ทีมงาน')}
            <span className="text-gradient">{t('Team', 'ของเรา')}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {[
              { name: 'David Lee', role: 'Chief Operations Officer', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Emily Davis', role: 'VP of Engineering', image: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Robert Wilson', role: 'Head of Product', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Amanda Taylor', role: 'Creative Director', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'James Anderson', role: 'Lead Architect', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Laura Martinez', role: 'Head of Marketing', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'William Brown', role: 'Senior Developer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Sophia Garcia', role: 'UX Researcher', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Oliver Miller', role: 'Data Scientist', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' },
              { name: 'Isabella Rodriguez', role: 'Project Manager', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800&ixlib=rb-4.0.3' }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-4">
                  <img src={member.image} alt={member.name} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h4>
                <p className="text-electric-blue text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            {t('Our ', 'เทคโนโลยี')}
            <span className="text-gradient">{t('Tech Stack', 'ของเรา')}</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Go',
              'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'PostgreSQL',
              'MongoDB', 'Redis', 'GraphQL', 'Tailwind CSS', 'Figma', 'OpenAI'
            ].map((tech, index) => (
              <GlassCard key={index} delay={index * 0.05} className="text-center p-4 flex items-center justify-center min-h-[100px]">
                <span className="text-cool-gray font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{tech}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
