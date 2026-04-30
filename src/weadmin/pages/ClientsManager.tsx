import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Building2,
  Save,
  X,
  Loader2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { fetchApi, uploadMedia } from '@/lib/api';

export default function AdminClients() {
  const [activeTab, setActiveTab] = useState('all');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/content/clients');
      const data = res.data || res;
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load clients', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentClient({
      name: '',
      logo_url: '',
      category: '',
      is_published: 1,
      is_featured: 0,
      sort_order: 0
    });
    setIsEditing(true);
  };

  const handleEdit = (client: any) => {
    setCurrentClient(client);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้ารายนี้?')) return;
    try {
      await fetchApi(`/content/clients/${id}`, { method: 'DELETE' });
      await loadClients();
    } catch (err) {
      console.error('Failed to delete client', err);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadMedia(file, file.name, 'clients');
      setCurrentClient({ ...currentClient, logo_url: data.url });
    } catch (err) {
      console.error('Failed to upload logo', err);
      alert('ไม่สามารถอัปโหลดโลโก้ได้');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentClient.id) {
        await fetchApi(`/content/clients/${currentClient.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentClient)
        });
      } else {
        await fetchApi('/content/clients', {
          method: 'POST',
          body: JSON.stringify(currentClient)
        });
      }
      setIsEditing(false);
      await loadClients();
    } catch (err) {
      console.error('Failed to save client', err);
    }
  };

  const filteredClients = clients.filter(c => {
    if (activeTab === 'active' && !c.is_published) return false;
    if (activeTab === 'inactive' && c.is_published) return false;
    
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      c.name?.toLowerCase().includes(searchLower) || 
      c.category?.toLowerCase().includes(searchLower)
    )) return false;
    
    return true;
  });

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentClient.id ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {currentClient.id ? 'แก้ไขข้อมูลและโลโก้ของลูกค้า' : 'เพิ่มลูกค้าใหม่เพื่อแสดงในส่วนพาร์ทเนอร์'}
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
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                ข้อมูลลูกค้า (Client Information)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อลูกค้า / บริษัท</label>
                  <input 
                    type="text" 
                    required
                    value={currentClient.name || ''}
                    onChange={e => setCurrentClient({...currentClient, name: e.target.value})}
                    placeholder="เช่น WeWebPlus Co., Ltd."
                    className="wwp-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">หมวดหมู่ / อุตสาหกรรม</label>
                  <input 
                    type="text" 
                    value={currentClient.category || ''}
                    onChange={e => setCurrentClient({...currentClient, category: e.target.value})}
                    placeholder="เช่น Technology, Real Estate, E-commerce"
                    className="wwp-input"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">โลโก้ลูกค้า (Logo)</label>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative group">
                    <div className="h-32 w-32 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                      {currentClient.logo_url ? (
                        <img src={currentClient.logo_url} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <span className="text-[10px] text-slate-400">No Logo</span>
                        </div>
                      )}
                    </div>
                    {currentClient.logo_url && (
                      <button 
                        type="button"
                        onClick={() => setCurrentClient({...currentClient, logo_url: ''})}
                        className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-3">
                      <label className={`flex-1 cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดโลโก้'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                      </label>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="หรือวาง URL ของโลโก้ที่นี่..."
                        value={currentClient.logo_url || ''}
                        onChange={e => setCurrentClient({...currentClient, logo_url: e.target.value})}
                        className="wwp-input pl-10 text-xs"
                      />
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">แนะนำขนาด 400x400px ไฟล์ PNG หรือ SVG พื้นหลังโปร่งใส</p>
                  </div>
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
                    <span className="text-sm font-medium text-slate-900 dark:text-white">สถานะการแสดงผล</span>
                    <span className="text-xs text-slate-500">แสดงในส่วนพาร์ทเนอร์</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!!currentClient.is_published}
                      onChange={e => setCurrentClient({...currentClient, is_published: e.target.checked ? 1 : 0})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">ลูกค้าแนะนำ</span>
                    <span className="text-xs text-slate-500">แสดงเป็นลำดับแรกๆ</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!!currentClient.is_featured}
                      onChange={e => setCurrentClient({...currentClient, is_featured: e.target.checked ? 1 : 0})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ลำดับการแสดงผล</label>
                  <input 
                    type="number" 
                    value={currentClient.sort_order || 0}
                    onChange={e => setCurrentClient({...currentClient, sort_order: parseInt(e.target.value)})}
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
                  บันทึกข้อมูลลูกค้า
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการลูกค้า (Clients)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">จัดการโลโก้และข้อมูลลูกค้าที่ไว้วางใจเรา</p>
        </div>
        <button onClick={handleCreate} className="wwp-button-primary">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มลูกค้าใหม่
        </button>
      </div>

      {/* Filters and Search */}
      <div className="wwp-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'active', label: 'ใช้งานอยู่' },
            { id: 'inactive', label: 'ปิดใช้งาน' }
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
              placeholder="ค้นหาลูกค้า..."
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
                  ลูกค้า
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  อุตสาหกรรม
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  สถานะ
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
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">ไม่พบข้อมูลลูกค้า</p>
                    </div>
                  </td>
                </tr>
              ) : filteredClients.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden border border-slate-100 dark:border-white/10 p-1.5">
                        {item.logo_url ? (
                          <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="h-6 w-6" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        {item.is_featured && (
                          <span className="inline-flex items-center text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md mt-0.5 border border-amber-100 dark:border-amber-900/30">
                            ลูกค้าแนะนำ
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 dark:text-slate-300">{item.category || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      item.is_published 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                        : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.is_published ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {item.is_published ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                    </span>
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
