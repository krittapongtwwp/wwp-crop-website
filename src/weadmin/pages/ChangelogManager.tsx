import React, { useState, useEffect } from 'react';
import { 
  History, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Edit2,
  CheckCircle2,
  AlertCircle,
  Info,
  Eye,
  Type,
  Copy,
  Check
} from 'lucide-react';
import Markdown from 'react-markdown';
import { fetchApi } from '@/lib/api';

export default function ChangelogManager() {
  const [changelogs, setChangelogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLog, setCurrentLog] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  
  // New states for filtering, sorting, and bulk actions
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadChangelogs();
  }, []);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadChangelogs = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/content/changelog');
      const data = res.data || res;
      setChangelogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load changelogs', err);
    } finally {
      setLoading(false);
    }
  };

  // Derived state for filtered and sorted changelogs
  const filteredChangelogs = changelogs
    .filter(log => {
      const matchesSearch = 
        log.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.title_th.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'published' && log.is_published === 1) ||
        (filterStatus === 'draft' && log.is_published === 0);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleEdit = (log: any = null) => {
    setCurrentLog(log || {
      version: '',
      title_en: '',
      title_th: '',
      content_en: '',
      content_th: '',
      type: 'improvement',
      is_published: 1,
      published_at: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setPreviewMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const method = currentLog.id ? 'PUT' : 'POST';
      const url = currentLog.id ? `/content/changelog/${currentLog.id}` : '/content/changelog';
      
      await fetchApi(url, {
        method,
        body: JSON.stringify(currentLog)
      });
      
      setIsEditing(false);
      setCurrentLog(null);
      await loadChangelogs();
    } catch (err) {
      console.error('Failed to save changelog', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('ยืนยันการลบรายการนี้? / Are you sure you want to delete this?')) return;
    try {
      await fetchApi(`/content/changelog/${id}`, { method: 'DELETE' });
      await loadChangelogs();
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (err) {
      console.error('Failed to delete changelog', err);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    const confirmMsg = action === 'delete' 
      ? `ยืนยันการลบ ${selectedIds.length} รายการ? / Delete ${selectedIds.length} items?`
      : `ยืนยันการเปลี่ยนสถานะ ${selectedIds.length} รายการ? / Change status for ${selectedIds.length} items?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsBulkActionLoading(true);
      for (const id of selectedIds) {
        if (action === 'delete') {
          await fetchApi(`/content/changelog/${id}`, { method: 'DELETE' });
        } else {
          const log = changelogs.find(l => l.id === id);
          if (log) {
            await fetchApi(`/content/changelog/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                ...log,
                is_published: action === 'publish' ? 1 : 0
              })
            });
          }
        }
      }
      await loadChangelogs();
      setSelectedIds([]);
    } catch (err) {
      console.error('Bulk action failed', err);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredChangelogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredChangelogs.map(l => l.id));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Plus className="w-4 h-4 text-emerald-500" />;
      case 'fix': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return <Info className="w-4 h-4 text-primary-blue" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature': return { en: 'New Feature', th: 'ฟีเจอร์ใหม่', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' };
      case 'fix': return { en: 'Bug Fix', th: 'แก้ไขข้อผิดพลาด', color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' };
      default: return { en: 'Improvement', th: 'การปรับปรุง', color: 'bg-blue-50 text-primary-blue dark:bg-primary-blue/10' };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">ระบบบันทึกการปรับปรุง / Changelog System</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">จัดการข้อมูลการอัปเดตและปรับปรุงระบบ</p>
        </div>
        <button 
          onClick={() => handleEdit()}
          className="wwp-button-primary shadow-lg shadow-primary-blue/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มรายการใหม่ / Add New Update
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="wwp-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-blue/10 flex items-center justify-center">
            <History className="w-6 h-6 text-primary-blue" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Total Updates</p>
            <p className="text-2xl font-black text-text-main dark:text-white">{changelogs.length}</p>
          </div>
        </div>
        <div className="wwp-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Published</p>
            <p className="text-2xl font-black text-text-main dark:text-white">
              {changelogs.filter(l => l.is_published === 1).length}
            </p>
          </div>
        </div>
        <div className="wwp-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Edit2 className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Drafts</p>
            <p className="text-2xl font-black text-text-main dark:text-white">
              {changelogs.filter(l => l.is_published === 0).length}
            </p>
          </div>
        </div>
      </div>

      {!isEditing && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#050A15] p-4 rounded-xl border border-gray-200 dark:border-white/10">
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <input 
                type="text"
                placeholder="ค้นหาเวอร์ชันหรือหัวข้อ... / Search version or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="wwp-input pl-10"
              />
              <Eye className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="wwp-input max-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="wwp-button-secondary whitespace-nowrap"
            >
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <span className="text-sm font-bold text-primary-blue mr-2">{selectedIds.length} selected</span>
              <button 
                onClick={() => handleBulkAction('publish')}
                disabled={isBulkActionLoading}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
              >
                Publish
              </button>
              <button 
                onClick={() => handleBulkAction('unpublish')}
                disabled={isBulkActionLoading}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 dark:bg-white/10 rounded-lg text-xs font-bold hover:bg-gray-600 hover:text-white transition-all disabled:opacity-50"
              >
                Unpublish
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                disabled={isBulkActionLoading}
                className="px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 rounded-lg text-xs font-bold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {isEditing ? (
        <div className="wwp-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-text-main dark:text-white flex items-center">
                <div className="w-1.5 h-6 wwp-gradient rounded-full mr-3" />
                {currentLog.id ? 'แก้ไขรายการ / Edit Update' : 'เพิ่มรายการใหม่ / Add New Update'}
              </h2>
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg ml-4">
                <button 
                  type="button"
                  onClick={() => setPreviewMode('edit')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${previewMode === 'edit' ? 'bg-white dark:bg-primary-blue text-primary-blue dark:text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                >
                  <Type className="w-3.5 h-3.5" />
                  Editor
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewMode('preview')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${previewMode === 'preview' ? 'bg-white dark:bg-primary-blue text-primary-blue dark:text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
            </div>
            <button onClick={() => setIsEditing(false)} className="p-2 text-text-muted hover:text-text-main transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="wwp-label">เวอร์ชัน / Version</label>
                <input 
                  type="text" 
                  required
                  value={currentLog.version}
                  onChange={e => setCurrentLog({...currentLog, version: e.target.value})}
                  className="wwp-input"
                  placeholder="e.g. v1.0.2"
                />
              </div>
              <div>
                <label className="wwp-label">ประเภท / Type</label>
                <select 
                  value={currentLog.type}
                  onChange={e => setCurrentLog({...currentLog, type: e.target.value})}
                  className="wwp-input"
                >
                  <option value="feature">New Feature / ฟีเจอร์ใหม่</option>
                  <option value="improvement">Improvement / การปรับปรุง</option>
                  <option value="fix">Bug Fix / แก้ไขข้อผิดพลาด</option>
                </select>
              </div>
              <div>
                <label className="wwp-label">วันที่เผยแพร่ / Published Date</label>
                <input 
                  type="date" 
                  required
                  value={currentLog.published_at}
                  onChange={e => setCurrentLog({...currentLog, published_at: e.target.value})}
                  className="wwp-input"
                />
              </div>
              <div className="flex items-center space-x-3 pt-8">
                <input 
                  type="checkbox"
                  id="is_published"
                  checked={currentLog.is_published === 1}
                  onChange={e => setCurrentLog({...currentLog, is_published: e.target.checked ? 1 : 0})}
                  className="w-5 h-5 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                />
                <label htmlFor="is_published" className="text-sm font-bold text-text-main dark:text-white cursor-pointer">
                  เผยแพร่ทันที / Publish Immediately
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary-blue uppercase tracking-widest border-b border-blue-100 dark:border-blue-900/20 pb-2">English Content</h3>
                <div>
                  <label className="wwp-label">Title (EN)</label>
                  <input 
                    type="text" 
                    required
                    value={currentLog.title_en}
                    onChange={e => setCurrentLog({...currentLog, title_en: e.target.value})}
                    className="wwp-input"
                  />
                </div>
                <div>
                  <label className="wwp-label">Content (EN) - Markdown Supported</label>
                  {previewMode === 'edit' ? (
                    <textarea 
                      rows={10}
                      required
                      value={currentLog.content_en}
                      onChange={e => setCurrentLog({...currentLog, content_en: e.target.value})}
                      className="wwp-input font-mono text-sm resize-none"
                      placeholder="Use Markdown for lists, bold text, etc."
                    />
                  ) : (
                    <div className="wwp-input min-h-[260px] prose prose-sm dark:prose-invert max-w-none overflow-y-auto bg-gray-50 dark:bg-white/5 markdown-body">
                      <Markdown>{currentLog.content_en}</Markdown>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-primary-blue uppercase tracking-widest border-b border-blue-100 dark:border-blue-900/20 pb-2">Thai Content</h3>
                <div>
                  <label className="wwp-label">ชื่อหัวข้อ (TH)</label>
                  <input 
                    type="text" 
                    required
                    value={currentLog.title_th}
                    onChange={e => setCurrentLog({...currentLog, title_th: e.target.value})}
                    className="wwp-input"
                  />
                </div>
                <div>
                  <label className="wwp-label">เนื้อหา (TH) - รองรับ Markdown</label>
                  {previewMode === 'edit' ? (
                    <textarea 
                      rows={10}
                      required
                      value={currentLog.content_th}
                      onChange={e => setCurrentLog({...currentLog, content_th: e.target.value})}
                      className="wwp-input font-mono text-sm resize-none"
                      placeholder="ใช้ Markdown สำหรับรายการ, ตัวหนา, ฯลฯ"
                    />
                  ) : (
                    <div className="wwp-input min-h-[260px] prose prose-sm dark:prose-invert max-w-none overflow-y-auto bg-gray-50 dark:bg-white/5 markdown-body">
                      <Markdown>{currentLog.content_th}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border-subtle dark:border-white/5">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="wwp-button-secondary"
              >
                ยกเลิก / Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="wwp-button-primary px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล / Save Update'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="wwp-card p-20 text-center flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-secondary">กำลังโหลดข้อมูล... / Loading...</p>
            </div>
          ) : filteredChangelogs.length === 0 ? (
            <div className="wwp-card p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-text-main dark:text-white">ไม่พบข้อมูลที่ค้นหา</h3>
              <p className="text-text-secondary mt-2">ลองเปลี่ยนคำค้นหาหรือตัวกรองของคุณ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center gap-2 mb-2 px-4">
                <input 
                  type="checkbox"
                  checked={selectedIds.length === filteredChangelogs.length && filteredChangelogs.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                />
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Select All / เลือกทั้งหมด</span>
              </div>
              {filteredChangelogs.slice(0, visibleCount).map((log) => {
                const typeInfo = getTypeLabel(log.type);
                const isSelected = selectedIds.includes(log.id);
                const isCopied = copiedId === log.id;
                return (
                  <div 
                    key={log.id} 
                    className={`wwp-card p-8 group transition-all border-l-4 ${isSelected ? 'border-primary-blue bg-blue-50/30 dark:bg-primary-blue/5' : 'border-transparent hover:border-primary-blue/30'}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="pt-1.5">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(log.id)}
                            className="w-5 h-5 rounded border-gray-300 text-primary-blue focus:ring-primary-blue cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <div className="flex items-center gap-1 group/copy">
                              <span className="text-2xl font-black text-primary-blue tracking-tighter">{log.version}</span>
                              <button 
                                onClick={() => handleCopy(log.id, log.version)}
                                className="p-1 text-text-muted hover:text-primary-blue opacity-0 group-hover/copy:opacity-100 transition-all"
                                title="Copy Version"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${typeInfo.color}`}>
                              {typeInfo.th} / {typeInfo.en}
                            </span>
                            {log.is_published === 0 && (
                              <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 dark:bg-white/5">
                                Draft / แบบร่าง
                              </span>
                            )}
                            <span className="text-xs font-bold text-text-muted bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                              {new Date(log.published_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">{log.title_th}</h3>
                              <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary dark:text-gray-400 markdown-body">
                                <Markdown>{log.content_th}</Markdown>
                              </div>
                            </div>
                            <div className="border-l border-border-subtle dark:border-white/5 pl-8 hidden md:block">
                              <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">{log.title_en}</h3>
                              <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary dark:text-gray-400 markdown-body">
                                <Markdown>{log.content_en}</Markdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(log)}
                          className="p-3 bg-blue-50 dark:bg-primary-blue/10 text-primary-blue rounded-xl hover:bg-primary-blue hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(log.id)}
                          className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {visibleCount < filteredChangelogs.length && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="wwp-button-secondary px-12"
                  >
                    Load More / โหลดเพิ่มเติม
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
