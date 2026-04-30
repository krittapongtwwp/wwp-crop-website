import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Briefcase, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Bot,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    leads: 0,
    portfolio: 0,
    clients: 0,
    careers: 0,
    changelog: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [changelogs, setChangelogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [leadsRes, portfolioRes, clientsRes, careersRes, applicantsRes, changelogRes] = await Promise.all([
          fetchApi('/content/leads'),
          fetchApi('/content/portfolio'),
          fetchApi('/content/clients'),
          fetchApi('/content/careers'),
          fetchApi('/content/applicants'),
          fetchApi('/content/changelog')
        ]);
        
        const leads = Array.isArray(leadsRes.data || leadsRes) ? (leadsRes.data || leadsRes) : [];
        const portfolio = Array.isArray(portfolioRes.data || portfolioRes) ? (portfolioRes.data || portfolioRes) : [];
        const clients = Array.isArray(clientsRes.data || clientsRes) ? (clientsRes.data || clientsRes) : [];
        const careers = Array.isArray(careersRes.data || careersRes) ? (careersRes.data || careersRes) : [];
        const applicants = Array.isArray(applicantsRes.data || applicantsRes) ? (applicantsRes.data || applicantsRes) : [];
        const changelogsData = Array.isArray(changelogRes.data || changelogRes) ? (changelogRes.data || changelogRes) : [];
        
        setChangelogs(changelogsData);
        setCounts({
          leads: leads.length,
          portfolio: portfolio.length,
          clients: clients.length,
          careers: careers.length,
          changelog: changelogsData.length
        });

        // Combine and sort activity
        const activities: any[] = [
          ...leads.map((l: any) => ({ 
            id: `lead-${l.id}`, 
            type: 'lead', 
            title: `New lead: ${l.name} (${l.company || 'Individual'})`, 
            time: l.created_at, 
            status: l.status === 'new' ? 'New' : 'Processed' 
          })),
          ...applicants.map((a: any) => ({ 
            id: `app-${a.id}`, 
            type: 'applicant', 
            title: `New application: ${a.name}`, 
            time: a.created_at, 
            status: a.status === 'new' ? 'New' : 'Review' 
          })),
          ...portfolio.map((p: any) => ({ 
            id: `port-${p.id}`, 
            type: 'content', 
            title: `Project updated: ${p.title_en}`, 
            time: p.created_at, 
            status: p.is_published ? 'Published' : 'Draft' 
          })),
          ...changelogsData.map((c: any) => ({ 
            id: `change-${c.id}`, 
            type: 'changelog', 
            title: `Update released: v${c.version}`, 
            time: c.published_at, 
            status: c.is_published ? 'Published' : 'Draft' 
          }))
        ];

        activities.sort((a, b) => {
          const timeA = a.time ? new Date(a.time).getTime() : 0;
          const timeB = b.time ? new Date(b.time).getTime() : 0;
          return timeB - timeA;
        });
        setRecentActivity(activities.slice(0, 8));

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Unknown';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins} mins ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const stats = [
    { name: 'Total Leads', stat: counts.leads.toString(), icon: Users, change: '12%', changeType: 'increase', link: '/weadmin/leads' },
    { name: 'Active Projects', stat: counts.portfolio.toString(), icon: Briefcase, change: '2', changeType: 'increase', link: '/weadmin/portfolio' },
    { name: 'Total Clients', stat: counts.clients.toString(), icon: Users, change: '8%', changeType: 'increase', link: '/weadmin/clients' },
    { name: 'System Updates', stat: counts.changelog.toString(), icon: History, change: 'v' + (changelogs[0]?.version || '0.0.0'), changeType: 'increase', link: '/weadmin/changelog' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">ภาพรวมระบบ / Dashboard Overview</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">ยินดีต้อนรับกลับมา, นี่คือสรุปข้อมูลล่าสุดของเว็บไซต์คุณ</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="wwp-button-secondary flex items-center shadow-sm">
            <FileText className="w-4 h-4 mr-2 text-text-muted" />
            ส่งออกรายงาน / Export Report
          </button>
          <button className="wwp-button-primary shadow-lg shadow-primary-blue/20">
            <Activity className="w-4 h-4 mr-2" />
            ความเคลื่อนไหวล่าสุด / Activity
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="wwp-card wwp-card-hover p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <item.icon className="w-20 h-20 text-primary-blue" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-primary-blue/10 text-primary-blue">
                <item.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
                item.changeType === 'increase' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
              }`}>
                {item.changeType === 'increase' ? '+' : '-'}{item.change}
                {item.changeType === 'increase' ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{item.name}</p>
              <h3 className="text-3xl font-bold text-text-main dark:text-white mt-1">{item.stat}</h3>
            </div>
            <Link 
              to={item.link} 
              className="mt-4 flex items-center text-xs font-bold text-primary-blue hover:text-primary-deep transition-colors group/link"
            >
              ดูรายละเอียดทั้งหมด / View Details
              <ArrowUpRight className="ml-1 w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="wwp-card flex flex-col">
            <div className="px-8 py-6 border-b border-border-subtle dark:border-white/5 flex items-center justify-between bg-gray-50/30 dark:bg-white/2">
              <div>
                <h3 className="text-lg font-bold text-text-main dark:text-white">กิจกรรมล่าสุด / Recent Activity</h3>
                <p className="text-xs text-text-muted mt-0.5">รายการอัปเดตล่าสุดจากทุกส่วนของระบบ</p>
              </div>
              <div className="p-2 bg-white dark:bg-white/5 rounded-lg shadow-sm">
                <Activity className="h-5 w-5 text-primary-blue" />
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ul className="divide-y divide-border-subtle dark:divide-white/5">
                {loading ? (
                  <li className="px-8 py-12 text-center text-text-muted flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mb-3" />
                    กำลังโหลดข้อมูล... / Loading...
                  </li>
                ) : recentActivity.length === 0 ? (
                  <li className="px-8 py-12 text-center text-text-muted">ไม่พบกิจกรรมล่าสุด / No recent activity</li>
                ) : (
                  recentActivity.map((activity) => (
                    <li key={activity.id} className="px-8 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <div className={`flex-shrink-0 h-2.5 w-2.5 rounded-full shadow-sm ${
                            activity.status === 'New' ? 'bg-primary-blue shadow-primary-blue/40' :
                            activity.status === 'Published' ? 'bg-emerald-500 shadow-emerald-500/40' :
                            activity.status === 'Action Needed' ? 'bg-rose-500 shadow-rose-500/40' : 'bg-amber-500 shadow-amber-500/40'
                          }`} />
                          <div className="ml-4 truncate">
                            <p className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary-blue transition-colors truncate">
                              {activity.title}
                            </p>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-1">
                              {activity.type} • {activity.status}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-text-secondary dark:text-gray-300 uppercase tracking-widest">
                            {formatTime(activity.time)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="px-8 py-5 border-t border-border-subtle dark:border-white/5 bg-gray-50/30 dark:bg-white/2">
              <Link to="#" className="text-sm font-bold text-primary-blue hover:text-primary-deep transition-colors flex items-center justify-center group">
                ดูประวัติกิจกรรมทั้งหมด / View all activity
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* What's New Section */}
          {changelogs.filter(c => c.is_published).length > 0 && (
            <div className="wwp-card overflow-hidden">
              <div className="px-8 py-6 border-b border-border-subtle dark:border-white/5 flex items-center justify-between bg-primary-blue/5 dark:bg-primary-blue/10">
                <div>
                  <h3 className="text-lg font-bold text-primary-deep dark:text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary-blue" />
                    มีอะไรใหม่ในระบบ? / What's New?
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">อัปเดตล่าสุดและฟีเจอร์ใหม่ๆ สำหรับคุณ</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary-blue text-white text-[10px] font-bold uppercase tracking-widest">
                  v{changelogs.filter(c => c.is_published)[0]?.version}
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-text-main dark:text-white mb-4">
                      {changelogs.filter(c => c.is_published)[0]?.title}
                    </h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary dark:text-gray-400 line-clamp-4">
                      {changelogs.filter(c => c.is_published)[0]?.content}
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      <Link 
                        to="/weadmin/changelog" 
                        className="wwp-button-primary text-xs py-2 px-6"
                      >
                        ดูรายละเอียดทั้งหมด / View Full Changelog
                      </Link>
                    </div>
                  </div>
                  <div className="w-full md:w-48 h-48 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-dashed border-border-subtle dark:border-white/10">
                    <div className="text-center p-4">
                      <History className="w-12 h-12 text-primary-blue/40 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">System Update</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links / System Status */}
        <div className="space-y-8">
          <div className="wwp-card p-8">
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-6 flex items-center">
              <div className="w-1.5 h-6 wwp-gradient rounded-full mr-3" />
              สถานะระบบ / System Status
            </h3>
            <div className="space-y-8">
              {[
                { label: 'Website Uptime', value: '99.99%', color: 'bg-emerald-500', percent: 100 },
                { label: 'AI Assistant Quota', value: '85%', color: 'bg-amber-500', percent: 85 },
                { label: 'Storage Used', value: '42%', color: 'bg-primary-blue', percent: 42 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-bold text-text-main dark:text-white">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`${item.color} h-full rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-5 rounded-2xl bg-blue-50 dark:bg-primary-blue/5 border border-blue-100 dark:border-primary-blue/10 shadow-sm">
              <div className="flex items-start">
                <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                  <Bot className="w-5 h-5 text-primary-blue" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-bold text-primary-deep dark:text-white">AI Assistant Tips</h4>
                  <p className="text-xs text-text-secondary dark:text-gray-400 mt-1.5 leading-relaxed font-medium">
                    คุณสามารถใช้ AI ช่วยเขียนเนื้อหาหรือสร้างรูปภาพได้ที่เมนู AI Assistant เพื่อความรวดเร็วในการทำงาน
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="wwp-card p-8 wwp-gradient text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <Briefcase className="w-24 h-24 rotate-12" />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">ต้องการความช่วยเหลือ?</h3>
            <p className="text-sm text-white/90 mb-8 relative z-10 leading-relaxed font-medium">
              หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือในการใช้งานระบบ สามารถติดต่อทีมงาน WeWebPlus ได้ทันที
            </p>
            <button className="w-full py-4 bg-white text-primary-deep font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 relative z-10">
              ติดต่อฝ่ายสนับสนุน / Contact Support
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
