import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Save,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { fetchApi, uploadMedia } from '@/lib/api';

export default function AdminPortfolio() {
  const [activeTab, setActiveTab] = useState('all');
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/content/portfolio');
      const data = res.data || res;
      setPortfolioItems(Array.isArray(data) ? data.sort((a: any, b: any) => a.sort_order - b.sort_order) : []);
    } catch (err) {
      console.error('Failed to load portfolio', err);
    } finally {
      setLoading(false);
    }
  };

  const movePortfolio = async (id: number, direction: 'up' | 'down') => {
    const index = portfolioItems.findIndex(p => p.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === portfolioItems.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = portfolioItems[index];
    const targetItem = portfolioItems[targetIndex];

    try {
      const currentOrder = currentItem.sort_order;
      const targetOrder = targetItem.sort_order;

      await Promise.all([
        fetchApi(`/content/portfolio/${currentItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...currentItem, sort_order: targetOrder })
        }),
        fetchApi(`/content/portfolio/${targetItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...targetItem, sort_order: currentOrder })
        })
      ]);

      await loadPortfolio();
    } catch (err) {
      console.error('Failed to reorder portfolio', err);
    }
  };

  const togglePortfolioStatus = async (item: any) => {
    try {
      await fetchApi(`/content/portfolio/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, is_published: item.is_published ? 0 : 1 })
      });
      await loadPortfolio();
    } catch (err) {
      console.error('Failed to toggle portfolio status', err);
    }
  };

  const handleCreate = () => {
    setCurrentItem({
      slug: '',
      title_en: '',
      title_th: '',
      client_name: '',
      industry: '',
      challenge_en: '',
      challenge_th: '',
      solution_en: '',
      solution_th: '',
      result_en: '',
      result_th: '',
      cover_image: '',
      is_published: 0,
      is_featured: 0,
      sort_order: 0
    });
    setIsEditing(true);
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์นี้? / Are you sure you want to delete this project?')) return;
    try {
      await fetchApi(`/content/portfolio/${id}`, { method: 'DELETE' });
      await loadPortfolio();
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadMedia(file, file.name, 'portfolio');
      setCurrentItem({ ...currentItem, cover_image: data.url });
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (currentItem.id) {
        await fetchApi(`/content/portfolio/${currentItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentItem)
        });
      } else {
        await fetchApi('/content/portfolio', {
          method: 'POST',
          body: JSON.stringify(currentItem)
        });
      }
      setIsEditing(false);
      await loadPortfolio();
    } catch (err) {
      console.error('Failed to save project', err);
      alert('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = portfolioItems.filter(p => {
    if (activeTab === 'published' && !p.is_published) return false;
    if (activeTab === 'drafts' && p.is_published) return false;
    if (activeTab === 'featured' && !p.is_featured) return false;
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      p.title_en?.toLowerCase().includes(searchLower) || 
      p.title_th?.toLowerCase().includes(searchLower) ||
      p.client_name?.toLowerCase().includes(searchLower)
    )) return false;
    return true;
  });

  if (isEditing) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-main dark:text-white">
              {currentItem.id ? 'แก้ไขโปรเจกต์ / Edit Project' : 'เพิ่มโปรเจกต์ใหม่ / New Project'}
            </h1>
            <p className="text-sm text-text-muted mt-1">จัดการข้อมูลผลงานและรายละเอียดเคสศึกษา</p>
          </div>
          <button 
            onClick={() => setIsEditing(false)}
            className="p-3 bg-white dark:bg-white/5 text-text-muted hover:text-text-main dark:hover:text-white rounded-2xl shadow-sm border border-border-subtle dark:border-white/10 transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="wwp-card p-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Basic Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">ชื่อโปรเจกต์ (EN) / Title (EN)</label>
                  <input 
                    type="text" 
                    required
                    value={currentItem.title_en || ''}
                    onChange={e => setCurrentItem({...currentItem, title_en: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="wwp-input"
                    placeholder="Project Title in English"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">ชื่อโปรเจกต์ (TH) / Title (TH)</label>
                  <input 
                    type="text" 
                    value={currentItem.title_th || ''}
                    onChange={e => setCurrentItem({...currentItem, title_th: e.target.value})}
                    className="wwp-input"
                    placeholder="ชื่อโปรเจกต์ภาษาไทย"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">สลัก / Slug (URL)</label>
                  <input 
                    type="text" 
                    required
                    value={currentItem.slug || ''}
                    onChange={e => setCurrentItem({...currentItem, slug: e.target.value})}
                    className="wwp-input"
                    placeholder="project-url-slug"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">ชื่อลูกค้า / Client Name</label>
                  <input 
                    type="text" 
                    value={currentItem.client_name || ''}
                    onChange={e => setCurrentItem({...currentItem, client_name: e.target.value})}
                    className="wwp-input"
                    placeholder="Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">อุตสาหกรรม / Industry</label>
                  <input 
                    type="text" 
                    value={currentItem.industry || ''}
                    onChange={e => setCurrentItem({...currentItem, industry: e.target.value})}
                    className="wwp-input"
                    placeholder="e.g. Technology, Retail"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">ลำดับการแสดงผล / Sort Order</label>
                  <input 
                    type="number" 
                    value={currentItem.sort_order || 0}
                    onChange={e => setCurrentItem({...currentItem, sort_order: parseInt(e.target.value)})}
                    className="wwp-input"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-border-subtle dark:border-white/5">
                <h3 className="text-xs font-bold text-primary-blue uppercase tracking-widest flex items-center">
                  <Edit2 className="w-4 h-4 mr-2" />
                  รายละเอียดเคสศึกษา / Case Study Details
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">ความท้าทาย / Challenge (TH)</label>
                    <textarea 
                      value={currentItem.challenge_th || ''}
                      onChange={e => setCurrentItem({...currentItem, challenge_th: e.target.value})}
                      className="wwp-input min-h-[100px] py-3"
                      placeholder="อธิบายความท้าทายของโปรเจกต์..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">แนวทางแก้ไข / Solution (TH)</label>
                    <textarea 
                      value={currentItem.solution_th || ''}
                      onChange={e => setCurrentItem({...currentItem, solution_th: e.target.value})}
                      className="wwp-input min-h-[100px] py-3"
                      placeholder="อธิบายแนวทางการแก้ไขปัญหา..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">ผลลัพธ์ / Result (TH)</label>
                    <textarea 
                      value={currentItem.result_th || ''}
                      onChange={e => setCurrentItem({...currentItem, result_th: e.target.value})}
                      className="wwp-input min-h-[100px] py-3"
                      placeholder="อธิบายผลลัพธ์ที่ได้..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media & Status */}
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">รูปภาพหน้าปก / Cover Image</label>
                <div className="relative group">
                  <div className="aspect-video rounded-[2rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border-2 border-dashed border-border-subtle dark:border-white/10 group-hover:border-primary-blue transition-all duration-300">
                    {currentItem.cover_image ? (
                      <img src={currentItem.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <ImageIcon className="h-12 w-12 text-text-muted mx-auto mb-3" />
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">No Image Selected</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <input 
                      type="text" 
                      placeholder="Image URL"
                      value={currentItem.cover_image || ''}
                      onChange={e => setCurrentItem({...currentItem, cover_image: e.target.value})}
                      className="wwp-input text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <label className={`flex-1 cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-white dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-xl text-xs font-bold text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Plus className="w-4 h-4 mr-2 text-primary-blue" />
                        {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ / Upload'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                      {currentItem.cover_image && (
                        <button 
                          type="button"
                          onClick={() => setCurrentItem({...currentItem, cover_image: ''})}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all active:scale-95"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-white/2 rounded-[2rem] border border-border-subtle dark:border-white/5 space-y-6">
                <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">การตั้งค่าการแสดงผล / Settings</h4>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-border-subtle dark:border-white/10 cursor-pointer group hover:border-primary-blue transition-all">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${currentItem.is_published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-100 dark:bg-white/10 text-text-muted'}`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white">เผยแพร่ / Published</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Visible on website</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={!!currentItem.is_published}
                      onChange={e => setCurrentItem({...currentItem, is_published: e.target.checked ? 1 : 0})}
                      className="h-6 w-6 text-primary-blue focus:ring-primary-blue border-border-subtle rounded-lg bg-white/5 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-border-subtle dark:border-white/10 cursor-pointer group hover:border-primary-blue transition-all">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${currentItem.is_featured ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-100 dark:bg-white/10 text-text-muted'}`}>
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white">แนะนำ / Featured</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Show in featured section</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={!!currentItem.is_featured}
                      onChange={e => setCurrentItem({...currentItem, is_featured: e.target.checked ? 1 : 0})}
                      className="h-6 w-6 text-primary-blue focus:ring-primary-blue border-border-subtle rounded-lg bg-white/5 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-8 border-t border-border-subtle dark:border-white/5 gap-4">
            <button 
              type="button"
              onClick={() => setIsEditing(false)}
              className="wwp-button-secondary px-8 py-3 rounded-2xl font-bold"
            >
              ยกเลิก / Cancel
            </button>
            <button 
              type="submit" 
              className="wwp-button-primary px-10 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-primary-blue/20"
            >
              <Save className="w-5 h-5 mr-2" />
              บันทึกข้อมูล / Save Project
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">
            จัดการผลงาน / Portfolio Manager
          </h1>
          <p className="text-text-muted mt-2 font-medium">จัดการข้อมูลเคสศึกษา โปรเจกต์ และผลงานที่โดดเด่นของบริษัท</p>
        </div>
        <button 
          onClick={handleCreate} 
          className="wwp-button-primary px-8 py-4 rounded-[1.5rem] font-bold flex items-center justify-center shadow-xl shadow-primary-blue/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มโปรเจกต์ใหม่ / New Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="wwp-card p-6 flex flex-col lg:flex-row gap-6 justify-between items-center">
        <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
          {['All', 'Published', 'Drafts', 'Featured'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.toLowerCase()
                  ? 'bg-white dark:bg-white/10 text-primary-blue shadow-sm'
                  : 'text-text-muted hover:text-text-secondary dark:hover:text-gray-300'
              }`}
            >
              {tab === 'All' ? 'ทั้งหมด' : 
               tab === 'Published' ? 'เผยแพร่แล้ว' : 
               tab === 'Drafts' ? 'ฉบับร่าง' : 'แนะนำ'}
              <span className="ml-2 opacity-50 font-medium">{tab}</span>
            </button>
          ))}
        </div>
        
        <div className="flex w-full lg:w-auto space-x-4">
          <div className="relative flex-1 lg:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted group-focus-within:text-primary-blue transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="wwp-input pl-12"
              placeholder="ค้นหาชื่อโปรเจกต์ หรือลูกค้า..."
            />
          </div>
          <button className="p-2.5 border border-border-subtle dark:border-white/10 rounded-xl text-text-muted hover:text-primary-blue bg-white dark:bg-white/5 transition-all shadow-sm active:scale-95">
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
                  โปรเจกต์ / Project
                </th>
                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  ลูกค้าและอุตสาหกรรม / Client & Industry
                </th>
                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  สถานะ / Status
                </th>
                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  แนะนำ / Featured
                </th>
                <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  วันที่สร้าง / Date
                </th>
                <th scope="col" className="relative px-8 py-5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin mb-4"></div>
                      <p className="text-text-muted font-bold uppercase tracking-widest text-xs">กำลังโหลดข้อมูล...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-50">
                      <ImageIcon className="w-16 h-16 text-text-muted mb-4" />
                      <p className="text-text-muted font-bold uppercase tracking-widest text-xs">ไม่พบข้อมูลโปรเจกต์</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex flex-col items-center mr-4 space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => movePortfolio(item.id, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-blue-500 disabled:opacity-10"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-400">{item.sort_order}</span>
                        <button 
                          onClick={() => movePortfolio(item.id, 'down')}
                          disabled={idx === portfolioItems.length - 1}
                          className="p-0.5 text-gray-400 hover:text-blue-500 disabled:opacity-10"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="h-14 w-20 flex-shrink-0 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-border-subtle dark:border-white/10 shadow-sm group-hover:shadow-md transition-all">
                        {item.cover_image ? (
                          <img src={item.cover_image} alt={item.title_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-text-muted" />
                        )}
                      </div>
                      <div className="ml-5">
                        <div className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary-blue transition-colors">{item.title_th || item.title_en}</div>
                        <div className="text-[11px] text-text-muted font-medium mt-1 uppercase tracking-wider">/{item.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-text-main dark:text-white">{item.client_name || '-'}</div>
                    <div className="text-[11px] text-text-muted font-medium mt-1 uppercase tracking-wider">{item.industry || '-'}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <button 
                      onClick={() => togglePortfolioStatus(item)}
                      className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        item.is_published 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-gray-100 dark:bg-white/5 text-text-muted border border-border-subtle dark:border-white/10'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      {item.is_published ? 'เผยแพร่แล้ว / Published' : 'ฉบับร่าง / Draft'}
                    </button>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    {item.is_featured ? (
                      <div className="flex items-center text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Featured
                      </div>
                    ) : (
                      <div className="flex items-center text-text-muted opacity-30 font-bold text-[10px] uppercase tracking-widest">
                        <XCircle className="h-5 w-5 mr-2" />
                        Regular
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-text-muted">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="p-2.5 text-text-muted hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-primary-blue/10 rounded-xl transition-all active:scale-95" 
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="p-2.5 text-text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all active:scale-95" 
                        title="Delete"
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
        
        {/* Pagination Info */}
        <div className="bg-gray-50/50 dark:bg-white/2 px-8 py-5 border-t border-border-subtle dark:border-white/5 flex items-center justify-between">
          <div className="flex-1 flex items-center justify-between">
            <p className="text-sm text-text-muted font-medium">
              แสดงผล <span className="text-text-main dark:text-white font-bold">{filteredItems.length}</span> รายการ
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-xl text-xs font-bold text-text-muted hover:text-primary-blue transition-all disabled:opacity-50">
                ก่อนหน้า
              </button>
              <button className="px-4 py-2 bg-white dark:bg-white/5 border border-border-subtle dark:border-white/10 rounded-xl text-xs font-bold text-text-muted hover:text-primary-blue transition-all disabled:opacity-50">
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
