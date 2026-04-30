import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye,
  Users,
  Briefcase,
  Save,
  X,
  Download,
  Loader2,
  MapPin,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  FileText
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminCareers() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [viewApplicant, setViewApplicant] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, applicantsRes] = await Promise.all([
        fetchApi('/content/careers'),
        fetchApi('/content/applicants')
      ]);
      const jobsData = jobsRes.data || jobsRes;
      const applicantsData = applicantsRes.data || applicantsRes;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplicants(Array.isArray(applicantsData) ? applicantsData : []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentJob({
      title_en: '',
      title_th: '',
      slug: '',
      department: '',
      location: '',
      employment_type: '',
      description_en: '',
      description_th: '',
      requirements_en: '',
      requirements_th: '',
      status: 'open'
    });
    setIsEditing(true);
  };

  const handleEdit = (job: any) => {
    setCurrentJob(job);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประกาศรับสมัครงานนี้?')) return;
    try {
      await fetchApi(`/content/careers/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      console.error('Failed to delete job', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentJob.id) {
        await fetchApi(`/content/careers/${currentJob.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentJob)
        });
      } else {
        await fetchApi('/content/careers', {
          method: 'POST',
          body: JSON.stringify(currentJob)
        });
      }
      setIsEditing(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save job', err);
    }
  };

  const handleUpdateApplicantStatus = async (id: number, status: string) => {
    try {
      await fetchApi(`/content/applicants/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setViewApplicant({ ...viewApplicant, status });
      await loadData();
    } catch (err) {
      console.error('Failed to update applicant status', err);
    }
  };

  const filteredJobs = jobs.filter(j => {
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      j.title_en?.toLowerCase().includes(searchLower) || 
      j.title_th?.toLowerCase().includes(searchLower) ||
      j.department?.toLowerCase().includes(searchLower)
    )) return false;
    return true;
  });

  const filteredApplicants = applicants.filter(a => {
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      a.name?.toLowerCase().includes(searchLower) || 
      a.email?.toLowerCase().includes(searchLower)
    )) return false;
    return true;
  });

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentJob.id ? 'แก้ไขประกาศรับสมัครงาน' : 'เพิ่มประกาศรับสมัครงานใหม่'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {currentJob.id ? 'แก้ไขข้อมูลตำแหน่งงาน' : 'สร้างประกาศรับสมัครงานใหม่เพื่อแสดงบนเว็บไซต์'}
            </p>
          </div>
          <button 
            onClick={() => setIsEditing(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="wwp-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                ข้อมูลตำแหน่งงาน (Job Information)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อตำแหน่ง (EN)</label>
                  <input 
                    type="text" 
                    required
                    value={currentJob.title_en || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setCurrentJob({
                        ...currentJob, 
                        title_en: val, 
                        slug: currentJob.id ? currentJob.slug : val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      });
                    }}
                    placeholder="e.g. Senior Full Stack Developer"
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อตำแหน่ง (TH)</label>
                  <input 
                    type="text" 
                    value={currentJob.title_th || ''}
                    onChange={e => setCurrentJob({...currentJob, title_th: e.target.value})}
                    placeholder="เช่น นักพัฒนาเว็บไซต์อาวุโส"
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Slug (URL)</label>
                  <input 
                    type="text" 
                    required
                    value={currentJob.slug || ''}
                    onChange={e => setCurrentJob({...currentJob, slug: e.target.value})}
                    placeholder="senior-developer"
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">แผนก (Department)</label>
                  <input 
                    type="text" 
                    value={currentJob.department || ''}
                    onChange={e => setCurrentJob({...currentJob, department: e.target.value})}
                    placeholder="e.g. Engineering, Design, Marketing"
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">สถานที่ทำงาน (Location)</label>
                  <input 
                    type="text" 
                    value={currentJob.location || ''}
                    onChange={e => setCurrentJob({...currentJob, location: e.target.value})}
                    placeholder="e.g. Bangkok (Hybrid), Remote"
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ประเภทการจ้างงาน (Type)</label>
                  <input 
                    type="text" 
                    value={currentJob.employment_type || ''}
                    onChange={e => setCurrentJob({...currentJob, employment_type: e.target.value})}
                    placeholder="e.g. Full-time, Contract"
                    className="wwp-input"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">รายละเอียดงาน (EN)</label>
                  <textarea 
                    rows={6}
                    value={currentJob.description_en || ''}
                    onChange={e => setCurrentJob({...currentJob, description_en: e.target.value})}
                    placeholder="Job description in English..."
                    className="wwp-input min-h-[150px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">รายละเอียดงาน (TH)</label>
                  <textarea 
                    rows={6}
                    value={currentJob.description_th || ''}
                    onChange={e => setCurrentJob({...currentJob, description_th: e.target.value})}
                    placeholder="รายละเอียดงานภาษาไทย..."
                    className="wwp-input min-h-[150px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Settings */}
            <div className="wwp-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">การตั้งค่า</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">สถานะการรับสมัคร</span>
                    <span className="text-xs text-slate-500">เปิด/ปิด รับสมัครงาน</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={currentJob.status === 'open'}
                      onChange={e => setCurrentJob({...currentJob, status: e.target.checked ? 'open' : 'closed'})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="wwp-button-primary w-full flex items-center justify-center py-3"
                >
                  <Save className="w-5 h-5 mr-2" />
                  บันทึกประกาศรับสมัคร
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ร่วมงานกับเรา (Careers)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">จัดการประกาศรับสมัครงานและตรวจสอบผู้สมัคร</p>
        </div>
        <button onClick={handleCreate} className="wwp-button-primary">
          <Plus className="w-4 h-4 mr-2" />
          ประกาศรับสมัครงานใหม่
        </button>
      </div>

      {/* Tabs */}
      <div className="wwp-card p-1 flex space-x-1">
        {[
          { id: 'jobs', name: 'ประกาศรับสมัครงาน', icon: Briefcase },
          { id: 'applicants', name: 'รายชื่อผู้สมัคร', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-medium text-sm transition-all
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
              }
            `}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="wwp-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
          {(activeTab === 'jobs' ? ['ทั้งหมด', 'เปิดรับสมัคร', 'ปิดรับสมัคร', 'ฉบับร่าง'] : ['ทั้งหมด', 'ใหม่', 'ตรวจสอบแล้ว', 'สัมภาษณ์', 'รับเข้าทำงาน']).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                tab === 'ทั้งหมด'
                  ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex w-full sm:w-auto space-x-3">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="wwp-input pl-10 py-2 text-sm"
              placeholder={activeTab === 'jobs' ? "ค้นหาตำแหน่งงาน..." : "ค้นหาชื่อผู้สมัคร..."}
            />
          </div>
          <button className="wwp-button-secondary px-3">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="wwp-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          {activeTab === 'jobs' ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ตำแหน่งงาน
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    แผนก
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ผู้สมัคร
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    วันที่ประกาศ
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">จัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">ไม่พบประกาศรับสมัครงาน</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title_th || item.title_en}</div>
                      <div className="flex items-center mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.location}
                        <span className="mx-1.5">•</span>
                        <Clock className="w-3 h-3 mr-1" />
                        {item.employment_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-300">{item.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        item.status === 'open' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                          : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.status === 'open' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {item.status === 'open' ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <Users className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="text-sm font-medium">
                          {applicants.filter(a => a.career_id === item.id).length}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" title="แก้ไข">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20" title="ลบ">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
              <thead className="bg-slate-50 dark:bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ผู้สมัคร
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ตำแหน่งที่สมัคร
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    วันที่สมัคร
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">จัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">ไม่พบรายชื่อผู้สมัคร</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredApplicants.map((item) => {
                  const job = jobs.find(j => j.id === item.career_id);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white font-medium">{job?.title_th || job?.title_en || `Job ID: ${item.career_id}`}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{job?.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          item.status === 'new' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30' :
                          item.status === 'reviewed' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' :
                          item.status === 'interviewing' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30' :
                          item.status === 'hired' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' :
                          'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                        }`}>
                          {item.status === 'new' ? 'ใหม่' : 
                           item.status === 'reviewed' ? 'ตรวจสอบแล้ว' :
                           item.status === 'interviewing' ? 'สัมภาษณ์' :
                           item.status === 'hired' ? 'รับเข้าทำงาน' :
                           item.status === 'rejected' ? 'ปฏิเสธ' : item.status || 'ใหม่'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewApplicant(item)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" title="ดูรายละเอียด">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Applicant View Modal */}
      {viewApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#050A15] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">รายละเอียดผู้สมัคร</h2>
                <p className="text-sm text-slate-500">ตรวจสอบข้อมูลและจัดการสถานะการสมัครงาน</p>
              </div>
              <button onClick={() => setViewApplicant(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Personal Info */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      ข้อมูลส่วนตัว
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/5">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">ชื่อ-นามสกุล</span>
                        <span className="text-base font-semibold text-slate-900 dark:text-white">{viewApplicant.name}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">อีเมล</span>
                        <a href={`mailto:${viewApplicant.email}`} className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                          <Mail className="w-4 h-4 mr-1.5" />
                          {viewApplicant.email}
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">เบอร์โทรศัพท์</span>
                        <a href={`tel:${viewApplicant.phone}`} className="text-base font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition-colors flex items-center">
                          <Phone className="w-4 h-4 mr-1.5" />
                          {viewApplicant.phone || '-'}
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">วันที่สมัคร</span>
                        <span className="text-base font-semibold text-slate-900 dark:text-white">{new Date(viewApplicant.created_at).toLocaleString('th-TH')}</span>
                      </div>
                    </div>
                  </section>

                  {/* Application Details */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                      รายละเอียดการสมัคร
                    </h3>
                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/5 space-y-6">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">ตำแหน่งที่สมัคร</span>
                        <span className="text-base font-semibold text-slate-900 dark:text-white">
                          {jobs.find(j => j.id === viewApplicant.career_id)?.title_th || `Job ID: ${viewApplicant.career_id}`}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">พอร์ตโฟลิโอ / LinkedIn</span>
                        {viewApplicant.portfolio_url ? (
                          <a href={viewApplicant.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all">
                            <ExternalLink className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            {viewApplicant.portfolio_url}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </div>
                      {viewApplicant.cover_letter && (
                        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
                          <span className="text-xs text-slate-500 block">ข้อความแนะนำตัว</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {viewApplicant.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  {/* Status Management */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">จัดการสถานะ</h3>
                    <div className="wwp-card p-6 space-y-4">
                      <select 
                        value={viewApplicant.status || 'new'}
                        onChange={(e) => handleUpdateApplicantStatus(viewApplicant.id, e.target.value)}
                        className="wwp-input"
                      >
                        <option value="new">ใหม่ (New)</option>
                        <option value="reviewed">ตรวจสอบแล้ว (Reviewed)</option>
                        <option value="interviewing">สัมภาษณ์ (Interviewing)</option>
                        <option value="hired">รับเข้าทำงาน (Hired)</option>
                        <option value="rejected">ปฏิเสธ (Rejected)</option>
                      </select>
                      <p className="text-[10px] text-slate-500 text-center">การเปลี่ยนสถานะจะถูกบันทึกโดยอัตโนมัติ</p>
                    </div>
                  </section>

                  {/* Resume */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">เอกสารประกอบ</h3>
                    <div className="wwp-card p-6 flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white block">Resume / CV</span>
                        <span className="text-xs text-slate-500">ไฟล์ประวัติการทำงาน</span>
                      </div>
                      {viewApplicant.resume_url ? (
                        <a 
                          href={viewApplicant.resume_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="wwp-button-secondary w-full flex items-center justify-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          ดาวน์โหลดไฟล์
                        </a>
                      ) : (
                        <div className="w-full py-2 px-4 bg-slate-50 dark:bg-white/5 rounded-xl text-xs text-slate-400">
                          ไม่ได้แนบไฟล์
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-end">
              <button 
                onClick={() => setViewApplicant(null)}
                className="wwp-button-secondary px-8"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
