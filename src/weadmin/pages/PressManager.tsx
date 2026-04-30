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
  FileText,
  Save,
  X,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { fetchApi, uploadMedia } from '@/lib/api';
import { generateAIContent, generateAIImage, ensureApiKey } from '@/services/aiService';

export default function AdminPress() {
  const [activeTab, setActiveTab] = useState('all');
  const [pressItems, setPressItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showImageHistory, setShowImageHistory] = useState(false);
  const [imageHistory, setImageHistory] = useState<any[]>([]);

  useEffect(() => {
    loadPressItems();
  }, []);

  const loadPressItems = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/content/press');
      const data = res.data || res;
      setPressItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load press items', err);
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
    setCurrentItem({
      slug: '',
      title_en: '',
      title_th: '',
      category: 'News',
      cover_image: '',
      excerpt_en: '',
      excerpt_th: '',
      content_en: '',
      content_th: '',
      is_published: 1
    });
    setIsEditing(true);
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this press item?')) return;
    try {
      await fetchApi(`/content/press/${id}`, { method: 'DELETE' });
      await loadPressItems();
    } catch (err) {
      console.error('Failed to delete press item', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadMedia(file, file.name, 'press');
      setCurrentItem({ ...currentItem, cover_image: data.url });
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const generateContent = async () => {
    if (!currentItem.title_en) {
      alert('Please enter a Title (EN) first to generate content.');
      return;
    }
    
    setIsGeneratingContent(true);
    try {
      const prompt = `Write a professional news article or press release for a digital agency. Title: "${currentItem.title_en}". Category: ${currentItem.category}. Additional Details: ${aiPrompt}. Please provide a compelling excerpt (2-3 sentences) and a full detailed article body. Format the output as JSON with keys "excerpt_en", "content_en", "title_th", "excerpt_th", and "content_th" (translating the content to Thai).`;
      
      const content = await generateAIContent(prompt);
      
      if (content) {
        try {
          const generated = JSON.parse(content);
          setCurrentItem({
            ...currentItem,
            excerpt_en: generated.excerpt_en || currentItem.excerpt_en,
            content_en: generated.content_en || currentItem.content_en,
            title_th: generated.title_th || currentItem.title_th,
            excerpt_th: generated.excerpt_th || currentItem.excerpt_th,
            content_th: generated.content_th || currentItem.content_th,
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

  const generateImage = async () => {
    if (!currentItem.title_en) {
      alert('Please enter a Title (EN) first to generate an image.');
      return;
    }
    
    setIsGeneratingImage(true);
    try {
      await ensureApiKey();
      const prompt = `A professional, high-quality editorial image for a news article titled: "${currentItem.title_en}". Category: ${currentItem.category}. Additional Details: ${aiPrompt}. Modern, corporate, tech-focused, abstract or realistic depending on the topic.`;
      
      const imageUrl = await generateAIImage(prompt);
      
      if (imageUrl) {
        setCurrentItem({ ...currentItem, cover_image: imageUrl });
        
        // Save to history
        await fetchApi('/ai/save-image-history', {
          method: 'POST',
          body: JSON.stringify({ prompt, imageUrl })
        });
        
        loadImageHistory(); // Refresh history
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem.id) {
        await fetchApi(`/content/press/${currentItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentItem)
        });
      } else {
        await fetchApi('/content/press', {
          method: 'POST',
          body: JSON.stringify(currentItem)
        });
      }
      setIsEditing(false);
      await loadPressItems();
    } catch (err) {
      console.error('Failed to save press item', err);
    }
  };

  const filteredItems = pressItems.filter(item => {
    if (activeTab === 'published' && !item.is_published) return false;
    if (activeTab === 'drafts' && item.is_published) return false;
    if (searchQuery && !item.title_en?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentItem.id ? 'Edit Press Item' : 'New Press Item'}
          </h1>
          <button 
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6 space-y-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 mb-6">
            <label className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
              AI Generation Details (Optional)
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Enter specific details, keywords, or instructions for the AI to generate content and images..."
              className="w-full px-4 py-2 border border-purple-200 dark:border-purple-800/50 rounded-lg bg-white dark:bg-[#050A15] text-gray-900 dark:text-white mb-3 h-24 resize-none"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateContent}
                disabled={isGeneratingContent}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGeneratingContent ? 'Generating Content...' : 'AI Generate Content'}
              </button>
              <button
                type="button"
                onClick={generateImage}
                disabled={isGeneratingImage}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {isGeneratingImage ? 'Generating Image...' : 'AI Generate Image'}
              </button>
              <button
                type="button"
                onClick={() => setShowImageHistory(!showImageHistory)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image History
              </button>
            </div>
          </div>

          {showImageHistory && (
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">AI Image History</h3>
              {imageHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No images generated yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                  {imageHistory.map((img) => (
                    <div key={img.id} className="relative group cursor-pointer" onClick={() => setCurrentItem({ ...currentItem, cover_image: img.image_url })}>
                      <img src={img.image_url} alt={img.prompt} className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-white/10" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium px-2 text-center">Use Image</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (EN)</label>
              <input 
                type="text" 
                required
                value={currentItem.title_en || ''}
                onChange={e => setCurrentItem({...currentItem, title_en: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (TH)</label>
              <input 
                type="text" 
                value={currentItem.title_th || ''}
                onChange={e => setCurrentItem({...currentItem, title_th: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
              <input 
                type="text" 
                required
                value={currentItem.slug || ''}
                onChange={e => setCurrentItem({...currentItem, slug: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select 
                value={currentItem.category || 'News'}
                onChange={e => setCurrentItem({...currentItem, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              >
                <option value="News">News</option>
                <option value="Press Release">Press Release</option>
                <option value="Article">Article</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image</label>
              <div className="flex items-center space-x-4">
                <div className="h-24 w-40 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10">
                  {currentItem.cover_image ? (
                    <img src={currentItem.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Image URL"
                    value={currentItem.cover_image || ''}
                    onChange={e => setCurrentItem({...currentItem, cover_image: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white mb-2"
                  />
                  <div className="flex items-center space-x-2">
                    <label className={`cursor-pointer inline-flex items-center px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Plus className="w-3 h-3 mr-1" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                    {currentItem.cover_image && (
                      <button 
                        type="button"
                        onClick={() => setCurrentItem({...currentItem, cover_image: ''})}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt (EN)</label>
              <textarea 
                rows={2}
                value={currentItem.excerpt_en || ''}
                onChange={e => setCurrentItem({...currentItem, excerpt_en: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt (TH)</label>
              <textarea 
                rows={2}
                value={currentItem.excerpt_th || ''}
                onChange={e => setCurrentItem({...currentItem, excerpt_th: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (EN)</label>
              <textarea 
                rows={6}
                value={currentItem.content_en || ''}
                onChange={e => setCurrentItem({...currentItem, content_en: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (TH)</label>
              <textarea 
                rows={6}
                value={currentItem.content_th || ''}
                onChange={e => setCurrentItem({...currentItem, content_th: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={!!currentItem.is_published}
                  onChange={e => setCurrentItem({...currentItem, is_published: e.target.checked ? 1 : 0})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/10">
            <button type="submit" className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Save Press Item
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Press & Insights</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage news, articles, and press releases.</p>
        </div>
        <button onClick={handleCreate} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Press Item
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['All', 'Published', 'Drafts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.toLowerCase()
                  ? 'bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex w-full sm:w-auto space-x-3">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg leading-5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Search press items..."
            />
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Published Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#050A15] divide-y divide-gray-200 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No press items found.</td>
                </tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
                        {item.cover_image ? (
                          <img src={item.cover_image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title_en}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">/{item.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300'
                    }`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
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
