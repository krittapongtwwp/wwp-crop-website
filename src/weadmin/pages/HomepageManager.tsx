import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  GripVertical, 
  Plus, 
  Trash2, 
  Settings2,
  Image as ImageIcon,
  Wand2,
  ArrowRight,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchApi } from '@/lib/api';
import { generateAIContent, generateAIImage, ensureApiKey } from '@/services/aiService';

export default function AdminHomepage() {
  const [activeTab, setActiveTab] = useState('en');
  const [sections, setSections] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Banner specific state
  const [banners, setBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<any>(null);
  const [bannerSearchQuery, setBannerSearchQuery] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [bannerAiPrompt, setBannerAiPrompt] = useState('');
  const [showImageHistory, setShowImageHistory] = useState(false);
  const [imageHistory, setImageHistory] = useState<any[]>([]);

  useEffect(() => {
    loadSections();
    loadBanners();
  }, []);

  async function loadSections() {
    try {
      const res = await fetchApi('/content/homepage_sections');
      const data = res.data || res;
      const sorted = Array.isArray(data) ? data.sort((a: any, b: any) => a.sort_order - b.sort_order) : [];
      setSections(sorted);
      if (sorted.length > 0 && !activeSection) {
        setActiveSection(sorted[0]);
      }
    } catch (err) {
      console.error('Failed to load sections', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    if (!activeSection) return;
    setIsSaving(true);
    try {
      await fetchApi(`/content/homepage_sections/${activeSection.id}`, {
        method: 'PUT',
        body: JSON.stringify(activeSection)
      });
      await loadSections();
      // Use a more subtle notification if possible, but alert is fine for now
      console.log('Saved successfully');
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const moveSection = async (id: number, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentSection = sections[index];
    const targetSection = sections[targetIndex];

    try {
      // Swap sort orders
      const currentOrder = currentSection.sort_order;
      const targetOrder = targetSection.sort_order;

      await Promise.all([
        fetchApi(`/content/homepage_sections/${currentSection.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...currentSection, sort_order: targetOrder })
        }),
        fetchApi(`/content/homepage_sections/${targetSection.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...targetSection, sort_order: currentOrder })
        })
      ]);

      await loadSections();
    } catch (err) {
      console.error('Failed to reorder sections', err);
    }
  };

  const toggleSectionVisibility = async (section: any) => {
    try {
      await fetchApi(`/content/homepage_sections/${section.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...section, is_visible: section.is_visible ? 0 : 1 })
      });
      await loadSections();
    } catch (err) {
      console.error('Failed to toggle visibility', err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setActiveSection({ ...activeSection, [field]: value });
  };

  const generateContent = async () => {
    if (!activeSection) return;
    
    setIsGeneratingContent(true);
    try {
      const prompt = `Write a professional ${activeSection.section_key} section content for a digital agency homepage. Section Title: "${activeSection.title_en}". Additional Details: ${aiPrompt}. Please provide a compelling title, subtitle, and description. Format the output as JSON with keys "title_en", "subtitle_en", "description_en", "title_th", "subtitle_th", and "description_th" (translating the content to Thai).`;
      
      const content = await generateAIContent(prompt);
      
      if (content) {
        try {
          const generated = JSON.parse(content);
          setActiveSection({
            ...activeSection,
            title_en: generated.title_en || activeSection.title_en,
            subtitle_en: generated.subtitle_en || activeSection.subtitle_en,
            description_en: generated.description_en || activeSection.description_en,
            title_th: generated.title_th || activeSection.title_th,
            subtitle_th: generated.subtitle_th || activeSection.subtitle_th,
            description_th: generated.description_th || activeSection.description_th,
          });
        } catch (e) {
          console.error("Failed to parse AI response", e);
          alert("AI generated invalid format. Please try again.");
        }
      }
    } catch (err) {
      console.error('Failed to generate content', err);
      alert('Error generating content. Please check your Gemini API key configuration.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const loadBanners = async () => {
    try {
      setBannersLoading(true);
      const res = await fetchApi('/content/hero_banners');
      const data = res.data || res;
      setBanners(Array.isArray(data) ? data.sort((a: any, b: any) => a.sort_order - b.sort_order) : []);
    } catch (err) {
      console.error('Failed to load hero banners', err);
    } finally {
      setBannersLoading(false);
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

  // Banner Handlers
  const handleCreateBanner = () => {
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
      sort_order: banners.length,
      is_active: 1
    });
    setIsEditingBanner(true);
  };

  const handleEditBanner = (banner: any) => {
    setCurrentBanner(banner);
    setIsEditingBanner(true);
  };

  const handleDeleteBanner = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await fetchApi(`/content/hero_banners/${id}`, { method: 'DELETE' });
      await loadBanners();
    } catch (err) {
      console.error('Failed to delete banner', err);
    }
  };

  const handleSaveBanner = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
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
      setIsEditingBanner(false);
      await loadBanners();
    } catch (err) {
      console.error('Failed to save banner', err);
      alert('Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const moveBanner = async (id: number, direction: 'up' | 'down') => {
    const index = banners.findIndex(b => b.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentBanner = banners[index];
    const targetBanner = banners[targetIndex];

    try {
      const currentOrder = currentBanner.sort_order;
      const targetOrder = targetBanner.sort_order;

      await Promise.all([
        fetchApi(`/content/hero_banners/${currentBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...currentBanner, sort_order: targetOrder })
        }),
        fetchApi(`/content/hero_banners/${targetBanner.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...targetBanner, sort_order: currentOrder })
        })
      ]);

      await loadBanners();
    } catch (err) {
      console.error('Failed to reorder banners', err);
    }
  };

  const toggleBannerStatus = async (banner: any) => {
    try {
      await fetchApi(`/content/hero_banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...banner, is_active: banner.is_active ? 0 : 1 })
      });
      await loadBanners();
    } catch (err) {
      console.error('Failed to toggle banner status', err);
    }
  };

  const generateBannerImage = async () => {
    if (!currentBanner.title_en && !currentBanner.description_en) {
      alert('Please enter a title or description to generate an image.');
      return;
    }
    
    setIsGeneratingImage(true);
    try {
      await ensureApiKey();
      const prompt = `A high quality, professional hero banner background image for a digital agency. Theme: ${currentBanner.title_en}. Context: ${currentBanner.description_en}. Additional Details: ${bannerAiPrompt}. Abstract, modern, clean, corporate, tech-focused.`;
      
      const imageUrl = await generateAIImage(prompt);
      
      if (imageUrl) {
        setCurrentBanner({ ...currentBanner, media_url: imageUrl, media_type: 'image' });
        
        // Save to history
        await fetchApi('/ai/save-image-history', {
          method: 'POST',
          body: JSON.stringify({ prompt, imageUrl })
        });
        
        await loadImageHistory();
      } else {
        alert('Failed to generate image. Please try again.');
      }
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Error generating image. Please check your Gemini API key configuration.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const filteredBanners = banners.filter(b => {
    if (bannerSearchQuery && !b.title_en?.toLowerCase().includes(bannerSearchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homepage Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage modular sections and content for the main landing page.</p>
        </div>
        <div className="flex items-center space-x-3">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Site
          </a>
          <button 
            onClick={handleSave}
            disabled={isSaving || !activeSection}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Section Reordering */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Page Sections</h3>
              <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-white/10">
              {sections.map((section, idx) => (
                <li 
                  key={section.id} 
                  className={`group flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${activeSection?.id === section.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex flex-col items-center mr-3 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                      disabled={idx === 0}
                      className="p-0.5 hover:text-blue-500 disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                      disabled={idx === sections.length - 1}
                      className="p-0.5 hover:text-blue-500 disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => setActiveSection(section)}>
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{section.title_en || section.section_key}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{section.section_key}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section); }}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      section.is_visible ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {section.is_visible ? 'Live' : 'Hidden'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-2 space-y-6">
          {activeSection ? (
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit: {activeSection.section_key === 'hero' ? 'Hero Banners' : activeSection.section_key}</h3>
                </div>
                
                {/* Language Toggle */}
                <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('en')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'en' ? 'bg-white dark:bg-[#050A15] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setActiveTab('th')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'th' ? 'bg-white dark:bg-[#050A15] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    TH
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {activeSection.section_key === 'hero' ? (
                  /* Hero Banners Management Sub-view */
                  <div className="space-y-6">
                    {!isEditingBanner ? (
                      <>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 mb-6">
                          <div className="flex items-start">
                            <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                            <div>
                              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Hero Banners Management</h4>
                              <p className="text-xs text-blue-800 dark:text-blue-400 mt-1 leading-relaxed">
                                Manage multiple banners for the homepage hero carousel. Each banner can have its own title, description, and media (image or video).
                              </p>
                              <div className="flex items-center space-x-4 mt-3">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={activeSection.is_visible === 1}
                                    onChange={(e) => handleChange('is_visible', e.target.checked ? 1 : 0)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">Show Hero Section on Site</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Search banners..." 
                              value={bannerSearchQuery}
                              onChange={(e) => setBannerSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#02040A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <button 
                            onClick={handleCreateBanner}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Banner
                          </button>
                        </div>

                        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5">
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium">Banner</th>
                                <th className="px-4 py-3 font-medium">Media</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                              {bannersLoading ? (
                                <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Loading banners...
                                  </td>
                                </tr>
                              ) : filteredBanners.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No banners found.
                                  </td>
                                </tr>
                              ) : (
                                filteredBanners.map((banner, idx) => (
                                  <tr key={banner.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                      <div className="flex flex-col items-center space-y-0.5">
                                        <button 
                                          onClick={() => moveBanner(banner.id, 'up')}
                                          disabled={idx === 0}
                                          className="p-0.5 text-gray-400 hover:text-blue-500 disabled:opacity-10"
                                        >
                                          <ChevronUp className="w-3 h-3" />
                                        </button>
                                        <span className="text-[10px] font-bold text-gray-400">{banner.sort_order}</span>
                                        <button 
                                          onClick={() => moveBanner(banner.id, 'down')}
                                          disabled={idx === banners.length - 1}
                                          className="p-0.5 text-gray-400 hover:text-blue-500 disabled:opacity-10"
                                        >
                                          <ChevronDown className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{banner.title_en || 'Untitled'}</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{banner.subtitle_en}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {banner.media_url ? (
                                        <div className="w-12 h-8 rounded bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-200 dark:border-white/10">
                                          <img src={banner.media_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300">
                                          {banner.media_type}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <button 
                                        onClick={() => toggleBannerStatus(banner)}
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                          banner.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-400'
                                        }`}
                                      >
                                        {banner.is_active ? 'Active' : 'Inactive'}
                                      </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex items-center justify-end space-x-1">
                                        <button 
                                          onClick={() => handleEditBanner(banner)}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                          title="Edit"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteBanner(banner.id)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                            <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
                            {currentBanner.id ? 'Edit Hero Banner' : 'New Hero Banner'}
                          </h4>
                          <button 
                            onClick={() => setIsEditingBanner(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Content (EN)</h5>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                              <input 
                                type="text" 
                                value={currentBanner.title_en}
                                onChange={(e) => setCurrentBanner({...currentBanner, title_en: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                              <input 
                                type="text" 
                                value={currentBanner.subtitle_en}
                                onChange={(e) => setCurrentBanner({...currentBanner, subtitle_en: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                              <textarea 
                                rows={2}
                                value={currentBanner.description_en}
                                onChange={(e) => setCurrentBanner({...currentBanner, description_en: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Button Text</label>
                              <input 
                                type="text" 
                                value={currentBanner.button_text_en}
                                onChange={(e) => setCurrentBanner({...currentBanner, button_text_en: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Content (TH)</h5>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                              <input 
                                type="text" 
                                value={currentBanner.title_th}
                                onChange={(e) => setCurrentBanner({...currentBanner, title_th: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                              <input 
                                type="text" 
                                value={currentBanner.subtitle_th}
                                onChange={(e) => setCurrentBanner({...currentBanner, subtitle_th: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                              <textarea 
                                rows={2}
                                value={currentBanner.description_th}
                                onChange={(e) => setCurrentBanner({...currentBanner, description_th: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Button Text</label>
                              <input 
                                type="text" 
                                value={currentBanner.button_text_th}
                                onChange={(e) => setCurrentBanner({...currentBanner, button_text_th: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
                          <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Media & Configuration</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Media Type</label>
                              <select 
                                value={currentBanner.media_type}
                                onChange={(e) => setCurrentBanner({...currentBanner, media_type: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Button Link</label>
                              <input 
                                type="text" 
                                value={currentBanner.button_link}
                                onChange={(e) => setCurrentBanner({...currentBanner, button_link: e.target.value})}
                                placeholder="/contact"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Media URL</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={currentBanner.media_url}
                                onChange={(e) => setCurrentBanner({...currentBanner, media_url: e.target.value})}
                                placeholder="https://..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                              />
                              {currentBanner.media_type === 'image' && (
                                <button
                                  type="button"
                                  onClick={generateBannerImage}
                                  disabled={isGeneratingImage}
                                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                  <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                                  {isGeneratingImage ? '...' : 'AI'}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <label className="block text-xs font-medium text-gray-500 mr-2">Sort</label>
                                <input 
                                  type="number" 
                                  value={currentBanner.sort_order}
                                  onChange={(e) => setCurrentBanner({...currentBanner, sort_order: parseInt(e.target.value) || 0})}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-white/10 rounded bg-white dark:bg-white/5 text-gray-900 dark:text-white"
                                />
                              </div>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={currentBanner.is_active === 1}
                                  onChange={(e) => setCurrentBanner({...currentBanner, is_active: e.target.checked ? 1 : 0})}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Active</span>
                              </label>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingBanner(false)}
                                className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveBanner}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center"
                              >
                                <Save className="w-3.5 h-3.5 mr-1.5" />
                                Save Banner
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Section Editor */
                  <>
                    {/* AI Generation Details */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 mb-6">
                      <label className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                        AI Generation Details (Optional)
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Enter specific details, keywords, or instructions for the AI to generate content..."
                        className="w-full px-4 py-2 border border-purple-200 dark:border-purple-800/50 rounded-lg bg-white dark:bg-[#050A15] text-gray-900 dark:text-white mb-3 h-20 resize-none text-sm"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={generateContent}
                          disabled={isGeneratingContent}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          {isGeneratingContent ? 'Generating...' : 'AI Generate Content'}
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Main Headline
                        </label>
                        <input 
                          type="text" 
                          value={activeTab === 'en' ? (activeSection.title_en || '') : (activeSection.title_th || '')}
                          onChange={(e) => handleChange(activeTab === 'en' ? 'title_en' : 'title_th', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-2xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sub-headline
                        </label>
                        <input 
                          type="text" 
                          value={activeTab === 'en' ? (activeSection.subtitle_en || '') : (activeSection.subtitle_th || '')}
                          onChange={(e) => handleChange(activeTab === 'en' ? 'subtitle_en' : 'subtitle_th', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea 
                          rows={3}
                          value={activeTab === 'en' ? (activeSection.description_en || '') : (activeSection.description_th || '')}
                          onChange={(e) => handleChange(activeTab === 'en' ? 'description_en' : 'description_th', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="is_visible"
                          checked={activeSection.is_visible === 1}
                          onChange={(e) => handleChange('is_visible', e.target.checked ? 1 : 0)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_visible" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Visible on website
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Select a section to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
