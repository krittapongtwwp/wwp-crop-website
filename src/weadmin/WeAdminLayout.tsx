import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { 
  LayoutDashboard, 
  Home, 
  Briefcase, 
  Users, 
  Layers, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Bot,
  History,
  Image as ImageIcon
} from 'lucide-react';
import { ChangelogNotification } from '../components/ChangelogNotification';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-login for dev
    if (import.meta.env.DEV) {
      localStorage.setItem('weadmin_token', 'dev-token');
      localStorage.setItem('weadmin_user', JSON.stringify({ id: 1, name: 'Admin User', email: 'admin@wewebplus.com' }));
    }

    const token = localStorage.getItem('weadmin_token');
    if (!token) {
      navigate('/weadmin/login');
      return;
    }

    fetchApi('/auth/me')
      .then(data => setUser(data))
      .catch(() => {
        if (!import.meta.env.DEV) {
          localStorage.removeItem('weadmin_token');
          navigate('/weadmin/login');
        } else {
          setUser({ id: 1, name: 'Admin User', email: 'admin@wewebplus.com' });
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('weadmin_token');
    localStorage.removeItem('weadmin_user');
    navigate('/weadmin/login');
  };

  if (!user) return null; // or a loading spinner

  const navigation = [
    { name: 'Dashboard', href: '/weadmin', icon: LayoutDashboard },
    { name: 'Homepage', href: '/weadmin/homepage', icon: Home },
    { name: 'Solutions', href: '/weadmin/solutions', icon: Layers },
    { name: 'Portfolio', href: '/weadmin/portfolio', icon: Briefcase },
    { name: 'Clients', href: '/weadmin/clients', icon: Users },
    { name: 'Services', href: '/weadmin/services', icon: Layers },
    { name: 'Insights', href: '/weadmin/press', icon: FileText },
    { name: 'Careers', href: '/weadmin/careers', icon: Briefcase },
    { name: 'Leads', href: '/weadmin/leads', icon: MessageSquare },
    { name: 'AI Assistant', href: '/weadmin/ai-assistant', icon: Bot },
    { name: 'Media Library', href: '/weadmin/media', icon: ImageIcon },
    { name: 'Changelog', href: '/weadmin/changelog', icon: History },
    { name: 'Settings', href: '/weadmin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-page dark:bg-[#020617] text-text-main dark:text-white font-sans flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0F172A] border-r border-border-subtle dark:border-white/5 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 shadow-xl lg:shadow-none`}
      >
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center px-8 border-b border-border-subtle dark:border-white/5">
            <Link to="/weadmin" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 wwp-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary-blue/20 group-hover:scale-105 transition-transform">
                <img 
                  src="https://www.wewebplus.com/img/static/wewebplus.svg" 
                  alt="WeWebPlus" 
                  className="w-6 h-6 invert brightness-0"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-primary-deep dark:text-white leading-none">WeAdmin</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-blue mt-1 opacity-80">Enterprise</span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden p-2 text-text-muted hover:text-text-main dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-primary-blue dark:bg-primary-blue/10 dark:text-blue-400 shadow-sm' 
                      : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3.5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-primary-blue dark:text-blue-400' : 'text-text-muted group-hover:text-text-secondary'
                  }`} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-blue shadow-[0_0_8px_rgba(43,113,237,0.6)]" />}
                </Link>
              );
            })}
          </div>

          <div className="p-6 border-t border-border-subtle dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
            <div className="flex items-center p-2 rounded-2xl bg-white dark:bg-white/5 border border-border-subtle dark:border-white/5 shadow-sm">
              <img
                className="w-10 h-10 rounded-xl bg-gray-200 object-cover shadow-inner"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2b71ed&color=fff&bold=true&rounded=true`}
                alt={user.name}
              />
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-bold text-text-main dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-text-muted truncate uppercase tracking-wider font-medium">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full mt-4 flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ / Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-border-subtle dark:border-white/5 flex items-center justify-between px-8 z-40 sticky top-0">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-text-muted hover:text-text-main dark:hover:text-white mr-4 bg-gray-100 dark:bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Search Bar */}
            <div className="max-w-md w-full hidden md:block relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-muted group-focus-within:text-primary-blue transition-colors" />
              </div>
              <input
                type="text"
                className="wwp-input pl-11 pr-4 py-2.5 bg-gray-50/50 dark:bg-white/5 border-transparent hover:border-border-subtle focus:bg-white dark:focus:bg-white/10 transition-all text-sm"
                placeholder="ค้นหาข้อมูล หรือตั้งค่า... (Cmd+K)"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 border border-border-subtle dark:border-white/10 rounded-md text-[10px] font-medium text-text-muted bg-white dark:bg-white/5">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2.5 text-text-muted hover:text-primary-blue dark:hover:text-blue-400 transition-all bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-border-subtle dark:hover:border-white/10">
              <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0F172A] animate-pulse" />
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-border-subtle dark:bg-white/10 mx-2 hidden sm:block" />
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hidden sm:inline-flex items-center px-5 py-2.5 wwp-button-secondary text-sm shadow-sm hover:shadow-md active:scale-95"
            >
              <Home className="w-4 h-4 mr-2" />
              ดูหน้าเว็บไซต์
            </a>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto bg-bg-page dark:bg-[#020617] p-6 sm:p-8 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <ChangelogNotification />
    </div>
  );
}
