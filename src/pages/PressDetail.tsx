import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function PressDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        let fetchedArticle = null;
        try {
          const res = await fetchApi(`/content/press/${id}`);
          const data = res.data || res;
          fetchedArticle = Array.isArray(data) ? data[0] : data;
        } catch (apiErr) {
          console.warn('API fetch failed, using fallback data if available', apiErr);
        }
        
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          // Fallback data
          const fallbacks: Record<string, any> = {
            'award-winning-agency': {
              title_en: 'Named Top Digital Agency 2024',
              title_th: 'ได้รับเลือกเป็นสุดยอดดิจิทัลเอเจนซี่ปี 2024',
              category: 'Awards',
              date: '2024-03-15',
              content_en: '<p>We are thrilled to announce that we have been recognized as the top digital agency of the year.</p>',
              content_th: '<p>เรารู้สึกตื่นเต้นที่จะประกาศว่าเราได้รับการยอมรับให้เป็นสุดยอดดิจิทัลเอเจนซี่แห่งปี</p>',
              cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'
            },
            'ai-solution-launch': {
              title_en: 'Launch of Next-Gen AI Platform',
              title_th: 'เปิดตัวแพลตฟอร์ม AI เจเนอเรชันใหม่',
              category: 'Product',
              date: '2024-02-28',
              content_en: '<p>Our new AI platform is set to revolutionize how businesses operate.</p>',
              content_th: '<p>แพลตฟอร์ม AI ใหม่ของเราพร้อมที่จะปฏิวัติวิธีการดำเนินธุรกิจ</p>',
              cover_image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80'
            },
            'strategic-partnership': {
              title_en: 'Strategic Partnership with Tech Giant',
              title_th: 'ความร่วมมือเชิงกลยุทธ์กับบริษัทยักษ์ใหญ่ด้านเทคโนโลยี',
              category: 'Partnership',
              date: '2024-01-10',
              content_en: '<p>We have partnered with a leading tech giant to bring innovative solutions to our clients.</p>',
              content_th: '<p>เราได้ร่วมมือกับบริษัทยักษ์ใหญ่ด้านเทคโนโลยีชั้นนำเพื่อนำเสนอโซลูชันที่เป็นนวัตกรรมให้กับลูกค้าของเรา</p>',
              cover_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80'
            }
          };
          setArticle(fallbacks[id as string] || null);
        }
      } catch (err: any) {
        if (err.status !== 404) {
          console.error('Failed to load press article', err);
        }
        // Fallback data on error
        const fallbacks: Record<string, any> = {
          'award-winning-agency': {
            title_en: 'Named Top Digital Agency 2024',
            title_th: 'ได้รับเลือกเป็นสุดยอดดิจิทัลเอเจนซี่ปี 2024',
            category: 'Awards',
            date: '2024-03-15',
            content_en: '<p>We are thrilled to announce that we have been recognized as the top digital agency of the year.</p>',
            content_th: '<p>เรารู้สึกตื่นเต้นที่จะประกาศว่าเราได้รับการยอมรับให้เป็นสุดยอดดิจิทัลเอเจนซี่แห่งปี</p>',
            cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'
          },
          'ai-solution-launch': {
            title_en: 'Launch of Next-Gen AI Platform',
            title_th: 'เปิดตัวแพลตฟอร์ม AI เจเนอเรชันใหม่',
            category: 'Product',
            date: '2024-02-28',
            content_en: '<p>Our new AI platform is set to revolutionize how businesses operate.</p>',
            content_th: '<p>แพลตฟอร์ม AI ใหม่ของเราพร้อมที่จะปฏิวัติวิธีการดำเนินธุรกิจ</p>',
            cover_image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80'
          },
          'strategic-partnership': {
            title_en: 'Strategic Partnership with Tech Giant',
            title_th: 'ความร่วมมือเชิงกลยุทธ์กับบริษัทยักษ์ใหญ่ด้านเทคโนโลยี',
            category: 'Partnership',
            date: '2024-01-10',
            content_en: '<p>We have partnered with a leading tech giant to bring innovative solutions to our clients.</p>',
            content_th: '<p>เราได้ร่วมมือกับบริษัทยักษ์ใหญ่ด้านเทคโนโลยีชั้นนำเพื่อนำเสนอโซลูชันที่เป็นนวัตกรรมให้กับลูกค้าของเรา</p>',
            cover_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80'
          }
        };
        setArticle(fallbacks[id as string] || null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full pt-32 pb-20 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="w-full pt-32 pb-20 flex flex-col justify-center items-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('Article not found', 'ไม่พบบทความ')}</h2>
        <Link to="/press" className="text-electric-blue hover:underline">
          {t('Back to Press', 'กลับไปหน้าข่าวสาร')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pt-32 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        <Link to="/press" className="inline-flex items-center text-cool-gray hover:text-electric-blue transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Press', 'กลับไปหน้าข่าวสาร')}
        </Link>

        <article className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 text-sm text-cool-gray mb-6">
              <span className="flex items-center gap-1.5 bg-electric-blue/10 text-electric-blue px-3 py-1 rounded-full">
                <Tag className="w-3.5 h-3.5" />
                {article.category || 'News'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {article.published_at ? new Date(article.published_at).toLocaleDateString() : new Date(article.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {article.author || 'Corporate Communications'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-8">
              {language === 'en' ? article.title_en : article.title_th || article.title_en}
            </h1>
            <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-12">
              <img 
                src={article.image_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80'} 
                alt={language === 'en' ? article.title_en : article.title_th || article.title_en} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-electric-blue hover:prose-a:text-sky-blue prose-blockquote:border-l-electric-blue prose-blockquote:bg-electric-blue/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-900 dark:prose-blockquote:text-white"
            dangerouslySetInnerHTML={{ __html: language === 'en' ? article.content_en : article.content_th || article.content_en }}
          />
        </article>
      </div>
    </div>
  );
}
