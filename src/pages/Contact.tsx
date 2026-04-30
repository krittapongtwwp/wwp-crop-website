import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion } from 'motion/react';
import { Mail, MapPin, Phone, Send, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Contact() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'sales',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetchApi('/content/settings');
        const data = res.data || res;
        const siteConfig = Array.isArray(data) ? data.find((s: any) => s.key === 'site_config') : null;
        if (siteConfig && siteConfig.value) {
          setConfig(JSON.parse(siteConfig.value));
        }
      } catch (err) {
        console.error('Failed to load config', err);
      }
    }
    loadConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await fetchApi('/content/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Subject: ${formData.subject}\n\n${formData.message}`
        }),
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: 'sales', message: '' });
    } catch (err: any) {
      console.error('Failed to send message', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pt-32 pb-20 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-electric-blue/10 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-blue/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white uppercase">
            <span className="text-gradient">CONTACT</span>
          </h1>
          <p className="text-xl text-cool-gray leading-relaxed">
            {t(
              'Get in touch with us.',
              'ติดต่อเรา'
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                {t('Let\'s start a ', 'มาเริ่ม ')}
                <span className="text-gradient">{t('conversation', 'พูดคุยกัน')}</span>
              </h2>
              <p className="text-cool-gray mb-12">
                {t('Whether you have a project in mind or just want to explore possibilities, our team is ready to help you transform your digital presence.', 'ไม่ว่าคุณจะมีโปรเจกต์ในใจหรือแค่ต้องการสำรวจความเป็นไปได้ ทีมงานของเราพร้อมที่จะช่วยคุณพลิกโฉมตัวตนบนโลกดิจิทัลของคุณ')}
              </p>
            </div>

            <div className="space-y-8">
              <GlassCard className="p-6 flex items-start gap-6 group hover:border-electric-blue/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{t('Visit Us', 'เยี่ยมชมเรา')}</h3>
                  <p className="text-cool-gray leading-relaxed whitespace-pre-line">
                    {language === 'en' 
                      ? (config.contact_address_en || '172 Soi Prasertmanukit 14\nPrasert Manukit Road, Chorakhe Bua,\nLat Phrao District, Bangkok 10230')
                      : (config.contact_address_th || '172 ซอยประเสริฐมนูกิจ 14\nถนนประเสริฐมนูกิจ แขวงจรเข้บัว\nเขตลาดพร้าว กรุงเทพมหานคร 10230')}
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="p-6 flex items-start gap-6 group hover:border-electric-blue/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{t('Email Us', 'อีเมลหาเรา')}</h3>
                  <div className="space-y-1">
                    <a href={`mailto:${config.contact_email_general || 'contact@wewebplus.com'}`} className="block text-cool-gray hover:text-electric-blue transition-colors">{config.contact_email_general || 'contact@wewebplus.com'}</a>
                    <a href={`mailto:${config.contact_email_sales || 'sales@wewebplus.com'}`} className="block text-cool-gray hover:text-electric-blue transition-colors">{config.contact_email_sales || 'sales@wewebplus.com'}</a>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 flex items-start gap-6 group hover:border-electric-blue/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{t('Call Us', 'โทรหาเรา')}</h3>
                  <div className="space-y-1">
                    <p className="text-cool-gray"><span className="font-medium text-gray-900 dark:text-white">Sale:</span> <a href={`tel:${(config.contact_phone_sales || '0869207736').replace(/\s/g, '')}`} className="hover:text-electric-blue transition-colors">{config.contact_phone_sales || '086 920 7736'}</a></p>
                    <p className="text-cool-gray"><span className="font-medium text-gray-900 dark:text-white">Support:</span> <a href={`tel:${(config.contact_phone_support || '0805909842').replace(/\s/g, '')}`} className="hover:text-electric-blue transition-colors">{config.contact_phone_support || '080 590 9842'}</a></p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlassCard className="p-8 md:p-12 relative overflow-hidden h-full flex flex-col justify-center">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-blue/20 to-transparent rounded-bl-full opacity-50" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-sky-blue/20 to-transparent rounded-tr-full opacity-50" />
              
              <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white relative z-10">{t('Send us a message', 'ส่งข้อความหาเรา')}</h3>
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 z-10" role="alert">
                  <span className="block sm:inline">{t('Message sent successfully!', 'ส่งข้อความเรียบร้อย!')}</span>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 z-10" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Name', 'ชื่อ')} *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Email', 'อีเมล')} *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" placeholder="john@example.com" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Phone', 'เบอร์โทรศัพท์')} *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" placeholder="08X XXX XXXX" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Subject', 'หัวข้อ')} *</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all" required>
                      <option value="sales" className="text-gray-900 dark:text-white dark:bg-gray-900">{t('Contact Sales', 'ติดต่อฝ่ายขาย')}</option>
                      <option value="support" className="text-gray-900 dark:text-white dark:bg-gray-900">{t('Customer Service', 'ติดต่อฝ่ายบริการลูกค้า')}</option>
                      <option value="partnership" className="text-gray-900 dark:text-white dark:bg-gray-900">{t('Partnership', 'ติดต่อร่วมธุรกิจ')}</option>
                      <option value="other" className="text-gray-900 dark:text-white dark:bg-gray-900">{t('Other', 'อื่นๆ')}</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">{t('Message', 'ข้อความ')} *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all resize-none" placeholder="Tell us about your project..." required />
                </div>
                <Button className="w-full group" size="lg" disabled={submitting}>
                  {submitting ? t('Sending...', 'กำลังส่ง...') : t('Send Message', 'ส่งข้อความ')}
                  {!submitting && <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20"
        >
          <div className="glass-card rounded-2xl overflow-hidden h-[400px] md:h-[500px] relative w-full">
            <iframe 
              src="https://maps.google.com/maps?q=172%20Soi%20Prasertmanukit%2014,%20Bangkok&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            ></iframe>
            
            <div className="absolute bottom-6 left-6 z-20">
              <a href="https://maps.app.goo.gl/search/172+Soi+Prasertmanukit+14,+Bangkok" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-black">
                  {t('Get Directions', 'ขอเส้นทาง')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
