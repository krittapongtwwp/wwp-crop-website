import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Download,
  Mail,
  Phone,
  Calendar,
  User,
  Building,
  Trash2,
  X,
  Eye,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminLeads() {
  const [activeTab, setActiveTab] = useState('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLead, setViewLead] = useState<any>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/content/leads');
      const data = res.data || res;
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await fetchApi(`/content/leads/${id}`, { method: 'DELETE' });
      await loadLeads();
    } catch (err) {
      console.error('Failed to delete lead', err);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await fetchApi(`/content/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setViewLead({ ...viewLead, status });
      await loadLeads();
    } catch (err) {
      console.error('Failed to update lead status', err);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (activeTab !== 'all' && l.status?.toLowerCase() !== activeTab) return false;
    if (searchQuery && !l.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !l.company?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">รายการผู้ติดต่อ / Leads & Inquiries</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">จัดการข้อมูลผู้ติดต่อและคำขอใช้บริการจากหน้าเว็บไซต์</p>
        </div>
        <button className="wwp-button-secondary shadow-sm flex items-center">
          <Download className="w-4 h-4 mr-2" />
          ส่งออกข้อมูล / Export CSV
        </button>
      </div>

      {/* Filters and Search */}
      <div className="wwp-card p-6 flex flex-col lg:flex-row gap-6 justify-between items-center">
        <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
          {['All', 'New', 'Contacted', 'Qualified', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.toLowerCase()
                  ? 'bg-white dark:bg-white/10 text-primary-blue shadow-sm'
                  : 'text-text-muted hover:text-text-secondary dark:hover:text-gray-300'
              }`}
            >
              {tab === 'All' ? 'ทั้งหมด' : tab}
            </button>
          ))}
        </div>
        
        <div className="flex w-full lg:w-auto space-x-3">
          <div className="relative flex-1 lg:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted group-focus-within:text-primary-blue transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="wwp-input pl-11 pr-4 py-2.5 bg-gray-50/50 dark:bg-white/5 border-transparent hover:border-border-subtle focus:bg-white dark:focus:bg-white/10 transition-all text-sm"
              placeholder="ค้นหาชื่อ, บริษัท หรืออีเมล..."
            />
          </div>
          <button className="p-2.5 border border-border-subtle dark:border-white/10 rounded-xl text-text-muted hover:text-primary-blue bg-white dark:bg-white/5 transition-all shadow-sm">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="wwp-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-border-subtle dark:divide-white/5">
            <thead className="bg-gray-50/50 dark:bg-white/2">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  ข้อมูลผู้ติดต่อ / Contact
                </th>
                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  บริการที่สนใจ / Interest
                </th>
                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  สถานะ / Status
                </th>
                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  วันที่ติดต่อ / Date
                </th>
                <th scope="col" className="relative px-8 py-5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-text-muted">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mb-3" />
                      กำลังโหลดข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-text-muted">ไม่พบข้อมูลผู้ติดต่อ</td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors cursor-pointer group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 rounded-2xl wwp-gradient flex items-center justify-center text-white font-bold shadow-lg shadow-primary-blue/20">
                        {lead.name ? lead.name.charAt(0) : '?'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary-blue transition-colors">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-text-muted flex items-center mt-1 font-medium uppercase tracking-wider">
                          <Building className="w-3 h-3 mr-1" /> {lead.company || 'Individual'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-semibold text-text-main dark:text-white">{lead.service_interest || 'General Inquiry'}</div>
                    <div className="text-[11px] text-text-muted flex items-center mt-1 font-medium">
                      <Mail className="w-3 h-3 mr-1" /> {lead.email}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                      lead.status === 'New' ? 'bg-blue-50 text-primary-blue dark:bg-primary-blue/10 dark:text-blue-400' :
                      lead.status === 'Contacted' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                      lead.status === 'Qualified' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                      lead.status === 'Closed Won' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      'bg-gray-50 text-text-muted dark:bg-white/5 dark:text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        lead.status === 'New' ? 'bg-primary-blue' :
                        lead.status === 'Contacted' ? 'bg-amber-500' :
                        lead.status === 'Qualified' ? 'bg-indigo-500' :
                        lead.status === 'Closed Won' ? 'bg-emerald-500' :
                        'bg-text-muted'
                      }`} />
                      {lead.status || 'New'}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-text-secondary dark:text-gray-400">
                    <div className="flex items-center font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-text-muted" />
                      {new Date(lead.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewLead(lead); }} 
                        className="p-2 text-text-muted hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-primary-blue/10 rounded-xl transition-all"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }} 
                        className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50/50 dark:bg-white/2 px-8 py-5 border-t border-border-subtle dark:border-white/5 flex items-center justify-between">
          <p className="text-sm font-medium text-text-muted">
            แสดงผล <span className="text-text-main dark:text-white font-bold">{filteredLeads.length}</span> รายการ
          </p>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 text-sm font-bold text-primary-blue hover:text-primary-deep transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* View Lead Modal */}
      {viewLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-text-main/40 backdrop-blur-md" onClick={() => setViewLead(null)} />
          <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-border-subtle dark:border-white/10 relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-10 py-8 border-b border-border-subtle dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
              <div>
                <h2 className="text-2xl font-bold text-text-main dark:text-white">รายละเอียดผู้ติดต่อ</h2>
                <p className="text-sm text-text-muted mt-1">ข้อมูลเชิงลึกและคำขอใช้บริการจากลูกค้า</p>
              </div>
              <button 
                onClick={() => setViewLead(null)}
                className="p-3 bg-white dark:bg-white/5 text-text-muted hover:text-text-main dark:hover:text-white rounded-2xl shadow-sm border border-border-subtle dark:border-white/10 transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-10">
                  {/* Contact Info */}
                  <section>
                    <h3 className="text-xs font-bold text-primary-blue uppercase tracking-widest mb-6 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      ข้อมูลส่วนตัว / Contact Info
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">ชื่อ-นามสกุล</label>
                        <div className="text-base font-bold text-text-main dark:text-white">{viewLead.name}</div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">บริษัท / องค์กร</label>
                        <div className="text-base font-bold text-text-main dark:text-white">{viewLead.company || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">อีเมลติดต่อ</label>
                        <div className="text-base font-bold text-primary-blue">
                          <a href={`mailto:${viewLead.email}`} className="hover:underline flex items-center">
                            {viewLead.email}
                            <ArrowUpRight className="ml-1 w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">เบอร์โทรศัพท์</label>
                        <div className="text-base font-bold text-text-main dark:text-white">
                          {viewLead.phone ? (
                            <a href={`tel:${viewLead.phone}`} className="hover:text-primary-blue transition-colors">{viewLead.phone}</a>
                          ) : '-'}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Inquiry Details */}
                  <section className="pt-10 border-t border-border-subtle dark:border-white/5">
                    <h3 className="text-xs font-bold text-primary-blue uppercase tracking-widest mb-6 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      รายละเอียดคำขอ / Inquiry Details
                    </h3>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">บริการที่สนใจ</label>
                          <div className="px-4 py-2 bg-blue-50 dark:bg-primary-blue/10 rounded-xl text-sm font-bold text-primary-blue inline-block">
                            {viewLead.service_interest || 'General Inquiry'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">งบประมาณ</label>
                          <div className="text-base font-bold text-text-main dark:text-white">{viewLead.budget_range || '-'}</div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">ข้อความเพิ่มเติม</label>
                        <div className="mt-2 text-sm text-text-secondary dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-white/5 p-6 rounded-[1.5rem] border border-border-subtle dark:border-white/5 leading-relaxed italic">
                          "{viewLead.message || 'ไม่มีข้อความเพิ่มเติม'}"
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-8">
                  <section className="p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-border-subtle dark:border-white/5">
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-6">จัดการสถานะ / Status</h3>
                    <div className="space-y-3">
                      {['New', 'Contacted', 'Qualified', 'Closed Won', 'Closed Lost'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(viewLead.id, status)}
                          className={`w-full px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between group ${
                            viewLead.status === status
                              ? 'bg-primary-blue text-white shadow-lg shadow-primary-blue/20'
                              : 'bg-white dark:bg-white/5 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-border-subtle dark:border-white/5'
                          }`}
                        >
                          {status}
                          {viewLead.status === status && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="p-6 bg-rose-50 dark:bg-rose-500/5 rounded-[2rem] border border-rose-100 dark:border-rose-500/10">
                    <h3 className="text-[11px] font-bold text-rose-500 uppercase tracking-widest mb-4">อันตราย / Danger Zone</h3>
                    <button 
                      onClick={() => { handleDelete(viewLead.id); setViewLead(null); }}
                      className="w-full px-4 py-3 text-sm font-bold text-white bg-rose-500 rounded-xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      ลบข้อมูลนี้
                    </button>
                  </section>
                </div>
              </div>
            </div>
            
            <div className="px-10 py-8 border-t border-border-subtle dark:border-white/5 flex justify-end bg-gray-50/50 dark:bg-white/2">
              <button
                onClick={() => setViewLead(null)}
                className="wwp-button-secondary px-10"
              >
                ปิดหน้าต่าง / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
