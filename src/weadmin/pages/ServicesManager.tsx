import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle2,
  XCircle,
  Layers,
  Save,
  X,
  Wand2,
  Loader2,
  LayoutGrid
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { generateAIContent } from '@/services/aiService';

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState('all');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/content/services');
      const data = res.data || res;
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentService({
      slug: '',
      title_en: '',
      title_th: '',
      description_en: '',
      description_th: '',
      icon: 'Layers',
      is_published: 1,
      is_featured: 0,
      sort_order: 0
    });
    setIsEditing(true);
  };

  const handleEdit = (service: any) => {
    setCurrentService(service);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบริการนี้?')) return;
    try {
      await fetchApi(`/content/services/${id}`, { method: 'DELETE' });
      await loadServices();
    } catch (err) {
      console.error('Failed to delete service', err);
    }
  };

  const generateContent = async () => {
    if (!currentService.title_en) {
      alert('กรุณากรอกชื่อบริการ (EN) ก่อนเพื่อสร้างเนื้อหา');
      return;
    }
    
    setIsGeneratingContent(true);
    try {
      const prompt = `Write a professional service description for a digital agency. Service Name: "${currentService.title_en}". Additional Details: ${aiPrompt}. Please provide a compelling description. Format the output as JSON with keys "description_en", "title_th", and "description_th" (translating the content to Thai).`;
      
      const content = await generateAIContent(prompt);
      
      if (content) {
        try {
          const generated = JSON.parse(content);
          setCurrentService({
            ...currentService,
            description_en: generated.description_en || currentService.description_en,
            title_th: generated.title_th || currentService.title_th,
            description_th: generated.description_th || currentService.description_th,
          });
        } catch (e) {
          console.error("Failed to parse AI response", e);
          alert("AI สร้างรูปแบบข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        }
      }
    } catch (err) {
      console.error('Failed to generate content', err);
      alert('เกิดข้อผิดพลาดในการสร้างเนื้อหา กรุณาตรวจสอบการตั้งค่า Gemini API key');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentService.id) {
        await fetchApi(`/content/services/${currentService.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentService)
        });
      } else {
        await fetchApi('/content/services', {
          method: 'POST',
          body: JSON.stringify(currentService)
        });
      }
      setIsEditing(false);
      await loadServices();
    } catch (err) {
      console.error('Failed to save service', err);
    }
  };

  const filteredServices = services.filter(s => {
    if (activeTab === 'published' && !s.is_published) return false;
    if (activeTab === 'drafts' && s.is_published) return false;
    if (activeTab === 'featured' && !s.is_featured) return false;
    
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      s.title_en?.toLowerCase().includes(searchLower) || 
      s.title_th?.toLowerCase().includes(searchLower) ||
      s.slug?.toLowerCase().includes(searchLower)
    )) return false;
    
    return true;
  });

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentService.id ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {currentService.id ? 'แก้ไขข้อมูลบริการของคุณ' : 'สร้างบริการใหม่เพื่อแสดงบนเว็บไซต์'}
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
                <LayoutGrid className="w-5 h-5 mr-2 text-blue-600" />
                ข้อมูลพื้นฐาน (Basic Information)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อบริการ (EN)</label>
                  <input 
                    type="text" 
                    required
                    value={currentService.title_en || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setCurrentService({
                        ...currentService, 
                        title_en: val, 
                        slug: currentService.id ? currentService.slug : val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      });
                    }}
                    placeholder="e.g. Web Development"
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อบริการ (TH)</label>
                  <input 
                    type="text" 
                    value={currentService.title_th || ''}
                    onChange={e => setCurrentService({...currentService, title_th: e.target.value})}
                    placeholder="เช่น บริการพัฒนาเว็บไซต์"
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Slug (URL)</label>
                  <input 
                    type="text" 
                    required
                    value={currentService.slug || ''}
                    onChange={e => setCurrentService({...currentService, slug: e.target.value})}
                    placeholder="web-development"
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ไอคอน (Lucide Icon Name)</label>
                  <input 
                    type="text" 
                    value={currentService.icon || ''}
                    onChange={e => setCurrentService({...currentService, icon: e.target.value})}
                    placeholder="Layers, Code, Smartphone..."
                    className="wwp-input"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">คำอธิบาย (EN)</label>
                  <textarea 
                    rows={4}
                    value={currentService.description_en || ''}
                    onChange={e => setCurrentService({...currentService, description_en: e.target.value})}
                    placeholder="Describe the service in English..."
                    className="wwp-input min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">คำอธิบาย (TH)</label>
                  <textarea 
                    rows={4}
                    value={currentService.description_th || ''}
                    onChange={e => setCurrentService({...currentService, description_th: e.target.value})}
                    placeholder="อธิบายรายละเอียดบริการเป็นภาษาไทย..."
                    className="wwp-input min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* AI Assistant */}
            <div className="wwp-card p-6 border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center mb-4">
                <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
                AI ช่วยเขียนเนื้อหา
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                ระบุรายละเอียดเพิ่มเติมเพื่อให้ AI ช่วยสร้างคำอธิบายบริการทั้งภาษาไทยและอังกฤษ
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="เช่น เน้นเรื่องความเร็ว, ความปลอดภัย, หรือกลุ่มลูกค้า SME..."
                className="wwp-input h-24 mb-4 text-sm"
              />
              <button
                type="button"
                onClick={generateContent}
                disabled={isGeneratingContent}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-md shadow-purple-200 dark:shadow-none"
              >
                {isGeneratingContent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังสร้างเนื้อหา...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    สร้างเนื้อหาด้วย AI
                  </>
                )}
              </button>
            </div>

            {/* Settings */}
            <div className="wwp-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">การตั้งค่า</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">สถานะการเผยแพร่</span>
                    <span className="text-xs text-slate-500">แสดงบนหน้าเว็บไซต์</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!!currentService.is_published}
                      onChange={e => setCurrentService({...currentService, is_published: e.target.checked ? 1 : 0})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">บริการแนะนำ</span>
                    <span className="text-xs text-slate-500">แสดงในส่วน Featured</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!!currentService.is_featured}
                      onChange={e => setCurrentService({...currentService, is_featured: e.target.checked ? 1 : 0})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ลำดับการแสดงผล</label>
                  <input 
                    type="number" 
                    value={currentService.sort_order || 0}
                    onChange={e => setCurrentService({...currentService, sort_order: parseInt(e.target.value)})}
                    className="wwp-input"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="wwp-button-primary w-full flex items-center justify-center py-3"
                >
                  <Save className="w-5 h-5 mr-2" />
                  บันทึกข้อมูลบริการ
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการบริการ (Services)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">จัดการข้อมูลบริการหลักของธุรกิจคุณ</p>
        </div>
        <button onClick={handleCreate} className="wwp-button-primary">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มบริการใหม่
        </button>
      </div>

      {/* Filters and Search */}
      <div className="wwp-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'published', label: 'เผยแพร่แล้ว' },
            { id: 'drafts', label: 'ฉบับร่าง' },
            { id: 'featured', label: 'แนะนำ' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
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
              placeholder="ค้นหาบริการ..."
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
          <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
            <thead className="bg-slate-50 dark:bg-white/5">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  บริการ
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  แนะนำ
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ลำดับ
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
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">ไม่พบข้อมูลบริการ</p>
                    </div>
                  </td>
                </tr>
              ) : filteredServices.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.title_th || item.title_en}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          /{item.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      item.is_published 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                        : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.is_published ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {item.is_published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.is_featured ? (
                      <div className="flex items-center text-amber-500">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="ml-1.5 text-xs font-medium">แนะนำ</span>
                      </div>
                    ) : (
                      <XCircle className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {item.sort_order || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                        title="แก้ไข"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20" 
                        title="ลบ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
