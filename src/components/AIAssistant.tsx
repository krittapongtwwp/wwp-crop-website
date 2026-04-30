import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from './ui/Button';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const quickActions = [
    t('Tell me about WEWEBPLUS', 'บอกฉันเกี่ยวกับ WEWEBPLUS'),
    t('What services do you provide?', 'คุณให้บริการอะไรบ้าง?'),
    t('How can you help with enterprise software?', 'คุณช่วยเรื่องซอฟต์แวร์องค์กรได้อย่างไร?'),
    t('Start a project consultation', 'เริ่มให้คำปรึกษาโครงการ'),
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'ai',
          text: t(
            "Hello, I'm WEWEBPLUS AI. I can help you explore our services, software capabilities, website solutions, and digital transformation expertise.",
            "สวัสดี ฉันคือ WEWEBPLUS AI ฉันสามารถช่วยคุณสำรวจบริการ ความสามารถด้านซอฟต์แวร์ โซลูชันเว็บไซต์ และความเชี่ยวชาญด้านการทรานส์ฟอร์มดิจิทัลของเรา"
          ),
        },
      ]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const prompt = `You are WEWEBPLUS AI, an expert digital assistant for WEWEBPLUS, a premium digital agency specializing in Enterprise Software, Web Platforms, UX/UI Design, and System Architecture. 
      Answer the following user query professionally, concisely, and in the language they used. 
      Do not hallucinate services. Emphasize our 15+ years of experience, 500+ projects, 200+ clients, and ISO 29110 certification.
      
      User Query: ${text}`;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: response.text || t("I'm sorry, I couldn't process that request.", "ขออภัย ฉันไม่สามารถประมวลผลคำขอนั้นได้"),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: t("I'm currently experiencing technical difficulties. Please try again later.", "ขณะนี้ฉันกำลังประสบปัญหาทางเทคนิค โปรดลองอีกครั้งในภายหลัง"),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 20 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-electric-blue text-white shadow-[0_0_20px_rgba(0,122,255,0.4)] flex items-center justify-center hover:scale-110 transition-transform ${
          isOpen ? 'hidden' : 'flex'
        }`}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] max-w-[calc(100vw-3rem)] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#161616]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-blue to-blue-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">WEWEBPLUS AI</h3>
                  <p className="text-xs text-electric-blue font-medium">{t('Online', 'ออนไลน์')}</p>
                </div>
              </div>
                 <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-electric-blue text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-800 flex gap-1.5">
                    <motion.div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && !isTyping && (
              <div className="p-4 pt-0 flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(action)}
                    className="text-xs px-3 py-1.5 rounded-full border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/10 transition-colors text-left"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#161616]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('Ask anything...', 'ถามอะไรก็ได้...')}
                  className="w-full bg-white dark:bg-[#222222] border border-gray-200 dark:border-gray-700 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 p-1.5 rounded-full bg-electric-blue text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
