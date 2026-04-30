import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  CheckCircle2,
  XCircle,
  ImageIcon,
  Save,
  X,
  Wand2
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function AdminHeroBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showImageHistory, setShowImageHistory] = useState(false);
  const [imageHistory, setImageHistory] = useState<any[]>([]);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/content/hero_banners');
      const data = res.data || res;
      setBanners(Array.isArray(data) ? data.sort((a: any, b: any) => a.sort_order - b.sort_order) : []);
    } catch (err) {
      console.error('Failed to load hero banners', err);
    } finally {
      setLoading(false);
    }
  };

  const loadImageHistory = async () => {
    try {
      const res = await fetchApi('/content/ai_image_history');
      const data = res.data || res;
      setImageHistory(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error('Failed to load image history', err);
    }
  };

  useEffect(() => {
    if (showImageHistory) {
      loadImageHistory();
    }
  }, [showImageHistory]);

  const handleCreate = () => {
    setCurrentBanner({
      title_en: '',
      title_th: '',
      subtitle_en: '',
      subtitle_th: '',
      description_en: '',
      description_th: '',
      media_type: 'image',
      media_url: '',
      button_text_en: '',
      button_text_th: '',
      button_link: '',
      sort_order: 0,
      is_active: 1
    });
    setIsEditing(true);
  };

  const handleEdit = (banner: any) => {
    setCurrentBanner(banner);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await fetchApi(`/content/hero_banners/${id}`, { method: 'DELETE' });
      await loadBanners();
    } catch (err) {
      console.error('Failed to delete banner', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentBanner.id) {
        await fetchApi(`/content/hero_banners/${currentBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentBanner)
        });
      } else {
        await fetchApi('/content/hero_banners', {
          method: 'POST',
          body: JSON.stringify(currentBanner)
        });
      }
      setIsEditing(false);
      await loadBanners();
    } catch (err) {
      console.error('Failed to save banner', err);
    }
  };

  const generateImage = async () => {
    if (!currentBanner.title_en && !currentBanner.description_en) {
      alert('Please enter a title or description to generate an image.');
      return;
    }
    
    setIsGeneratingImage(true);
    try {
      const prompt = `A high quality, professional hero banner background image for a digital agency. Theme: ${currentBanner.title_en}. Context: ${currentBanner.description_en}. Additional Details: ${aiPrompt}. Abstract, modern, clean, corporate, tech-focused.`;
      
      const res = await fetchApi('/ai/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });
      
      if (res.imageUrl) {
        setCurrentBanner({ ...currentBanner, media_url: res.imageUrl, media_type: 'image' });
        await loadImageHistory();
      } else {
        alert('Failed to generate image. Please try again.');
      }
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Error generating image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const filteredBanners = banners.filter(b => {
    if (searchQuery && !b.title_en?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Banners</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage multiple hero banners for the homepage.</p>
            </div>
            <button 
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </button>
          </div>

          <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-white/5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search banners..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#02040A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Banner</th>
                    <th className="px-6 py-4 font-medium">Media</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Loading banners...
                      </td>
                    </tr>
                  ) : filteredBanners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No banners found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredBanners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {banner.sort_order}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{banner.title_en || 'Untitled'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{banner.subtitle_en}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300">
                            {banner.media_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {banner.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-400">
                              <XCircle className="w-3 h-3 mr-1" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleEdit(banner)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(banner.id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {currentBanner.id ? 'Edit Banner' : 'Create New Banner'}
            </h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="p-6 space-y-8">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 mb-6">
              <label className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                AI Generation Details (Optional)
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter specific details, keywords, or instructions for the AI to generate content..."
                className="w-full px-4 py-2 border border-purple-200 dark:border-purple-800/50 rounded-lg bg-white dark:bg-[#050A15] text-gray-900 dark:text-white mb-3 h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">English Content</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (EN)</label>
                  <input 
                    type="text" 
                    required
                    value={currentBanner.title_en}
                    onChange={(e) => setCurrentBanner({...currentBanner, title_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle (EN)</label>
                  <input 
                    type="text" 
                    value={currentBanner.subtitle_en}
                    onChange={(e) => setCurrentBanner({...currentBanner, subtitle_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (EN)</label>
                  <textarea 
                    rows={3}
                    value={currentBanner.description_en}
                    onChange={(e) => setCurrentBanner({...currentBanner, description_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text (EN)</label>
                  <input 
                    type="text" 
                    value={currentBanner.button_text_en}
                    onChange={(e) => setCurrentBanner({...currentBanner, button_text_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Thai Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Thai Content</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (TH)</label>
                  <input 
                    type="text" 
                    value={currentBanner.title_th}
                    onChange={(e) => setCurrentBanner({...currentBanner, title_th: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle (TH)</label>
                  <input 
                    type="text" 
                    value={currentBanner.subtitle_th}
                    onChange={(e) => setCurrentBanner({...currentBanner, subtitle_th: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (TH)</label>
                  <textarea 
                    rows={3}
                    value={currentBanner.description_th}
                    onChange={(e) => setCurrentBanner({...currentBanner, description_th: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text (TH)</label>
                  <input 
                    type="text" 
                    value={currentBanner.button_text_th}
                    onChange={(e) => setCurrentBanner({...currentBanner, button_text_th: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Media & Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
              <h4 className="font-medium text-gray-900 dark:text-white">Media & Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Media Type</label>
                  <select 
                    value={currentBanner.media_type}
                    onChange={(e) => setCurrentBanner({...currentBanner, media_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Media URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={currentBanner.media_url}
                      onChange={(e) => setCurrentBanner({...currentBanner, media_url: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {currentBanner.media_type === 'image' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowImageHistory(!showImageHistory)}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          History
                        </button>
                        <button
                          type="button"
                          onClick={generateImage}
                          disabled={isGeneratingImage}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          {isGeneratingImage ? 'Generating...' : 'AI Generate'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {showImageHistory && (
                  <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-4">AI Image Generation History</h5>
                    {imageHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No images generated yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imageHistory.map((item, index) => (
                          <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 aspect-video bg-gray-100 dark:bg-[#02040A]">
                            <img src={item.image_url} alt={item.prompt} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                              <p className="text-xs text-white line-clamp-2 mb-2">{item.prompt}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentBanner({...currentBanner, media_url: item.image_url, media_type: 'image'});
                                  setShowImageHistory(false);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                              >
                                Use Image
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Link</label>
                  <input 
                    type="text" 
                    value={currentBanner.button_link}
                    onChange={(e) => setCurrentBanner({...currentBanner, button_link: e.target.value})}
                    placeholder="/contact"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
                    <input 
                      type="number" 
                      value={currentBanner.sort_order}
                      onChange={(e) => setCurrentBanner({...currentBanner, sort_order: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-end pb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentBanner.is_active === 1}
                        onChange={(e) => setCurrentBanner({...currentBanner, is_active: e.target.checked ? 1 : 0})}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Media */}
            {currentBanner.media_url && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Media Preview</p>
                <div className="relative w-full h-48 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                  {currentBanner.media_type === 'video' ? (
                    <video src={currentBanner.media_url} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={currentBanner.media_url} alt="Preview" className="w-full h-full object-contain" />
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Banner
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
