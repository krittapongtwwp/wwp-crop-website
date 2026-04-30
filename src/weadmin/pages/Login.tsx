import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchApi } from '@/lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      localStorage.setItem('weadmin_token', response.token);
      localStorage.setItem('weadmin_user', JSON.stringify(response.user));
      navigate('/weadmin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A15] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-blue/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-primary-deep/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="mb-8">
            <img 
              src="https://www.wewebplus.com/img/static/wewebplus.svg" 
              alt="WeWebPlus Logo" 
              className="h-12 w-auto brightness-0 invert"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-white tracking-tight"
            >
              เข้าสู่ระบบจัดการ <span className="text-primary-blue">weadmin</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-3 text-gray-400 font-medium"
            >
              Secure access for WEWEBPLUS team members
            </motion.p>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4"
      >
        <div className="bg-white/5 backdrop-blur-2xl py-10 px-6 shadow-2xl shadow-black/50 sm:rounded-[2.5rem] sm:px-12 border border-white/10 relative overflow-hidden group">
          {/* Subtle inner glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-blue/10 blur-3xl rounded-full group-hover:bg-primary-blue/20 transition-colors duration-700" />
          
          <form className="space-y-8 relative z-10" onSubmit={handleLogin}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 rounded-2xl text-center font-medium"
              >
                {error === 'Login failed' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : error}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                อีเมลผู้ใช้งาน / Work Email
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within/input:text-primary-blue transition-colors" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl leading-5 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent sm:text-sm transition-all duration-300 hover:bg-white/10"
                  placeholder="name@wewebplus.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  รหัสผ่าน / Password
                </label>
                <a href="#" className="text-[11px] font-bold text-primary-blue hover:text-white transition-colors uppercase tracking-wider">
                  ลืมรหัสผ่าน?
                </a>
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within/input:text-primary-blue transition-colors" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl leading-5 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent sm:text-sm transition-all duration-300 hover:bg-white/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-primary-blue focus:ring-primary-blue border-white/10 rounded-lg bg-white/5 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                  จดจำการเข้าใช้งาน
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="wwp-button-primary w-full py-4 px-6 rounded-2xl text-base font-bold flex items-center justify-center group/btn relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      เข้าสู่ระบบ / Sign In
                      <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-primary-blue" />
                <span>Protected by WEWEBPLUS Security</span>
              </div>
              <p className="text-[10px] text-gray-600 text-center leading-relaxed">
                การเข้าถึงระบบนี้จำกัดเฉพาะบุคลากรที่ได้รับอนุญาตเท่านั้น<br/>
                Unauthorized access is strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
