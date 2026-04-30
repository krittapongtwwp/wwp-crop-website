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
  Layers,
  Save,
  X,
  Wand2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { generateAIContent } from '@/services/aiService';

export default function AdminSolutions() {
  const [activeTab, setActiveTab] = useState('all');
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/content/solutions');
      const data = res.data || res;
      setSolutions(Array.isArray(data) ? data.sort((a: any, b: any) => a.sort_order - b.sort_order) : []);
    } catch (err) {
      console.error('Failed to load solutions', err);
    } finally {
      setLoading(false);
    }
  };

  const moveSolution = async (id: number, direction: 'up' | 'down') => {
    const index = solutions.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === solutions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentSolution = solutions[index];
    const targetSolution = solutions[targetIndex];

    try {
      const currentOrder = currentSolution.sort_order;
      const targetOrder = targetSolution.sort_order;

      await Promise.all([
        fetchApi(`/content/solutions/${currentSolution.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...currentSolution, sort_order: targetOrder })
        }),
        fetchApi(`/content/solutions/${targetSolution.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...targetSolution, sort_order: currentOrder })
        })
      ]);

      await loadSolutions();
    } catch (err) {
      console.error('Failed to reorder solutions', err);
    }
  };

  const toggleSolutionStatus = async (solution: any) => {
    try {
      await fetchApi(`/content/solutions/${solution.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...solution, is_published: solution.is_published ? 0 : 1 })
      });
      await loadSolutions();
    } catch (err) {
      console.error('Failed to toggle solution status', err);
    }
  };

  const handleCreate = () => {
    setCurrentSolution({
      slug: '',
      title_en: '',
      title_th: '',
      description_en: '',
      description_th: '',
      category: '',
      icon: 'Layers',
      is_published: 0,
      is_featured: 0,
      sort_order: 0
    });
    setIsEditing(true);
  };

  const handleEdit = (solution: any) => {
    setCurrentSolution(solution);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this solution?')) return;
    try {
      await fetchApi(`/content/solutions/${id}`, { method: 'DELETE' });
      await loadSolutions();
    } catch (err) {
      console.error('Failed to delete solution', err);
    }
  };

  const generateContent = async () => {
    if (!currentSolution.title_en) {
      alert('Please enter a Title (EN) first to generate content.');
      return;
    }
    
    setIsGeneratingContent(true);
    try {
      const prompt = `Write a professional solution description for a digital agency. Solution Name: "${currentSolution.title_en}". Additional Details: ${aiPrompt}. Please provide a compelling description. Format the output as JSON with keys "description_en", "title_th", and "description_th" (translating the content to Thai).`;
      
      const content = await generateAIContent(prompt);
      
      if (content) {
        try {
          const generated = JSON.parse(content);
          setCurrentSolution({
            ...currentSolution,
            description_en: generated.description_en || currentSolution.description_en,
            title_th: generated.title_th || currentSolution.title_th,
            description_th: generated.description_th || currentSolution.description_th,
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (currentSolution.id) {
        await fetchApi(`/content/solutions/${currentSolution.id}`, {
          method: 'PUT',
          body: JSON.stringify(currentSolution)
        });
      } else {
        await fetchApi('/content/solutions', {
          method: 'POST',
          body: JSON.stringify(currentSolution)
        });
      }
      setIsEditing(false);
      await loadSolutions();
    } catch (err) {
      console.error('Failed to save solution', err);
      alert('Failed to save solution');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSolutions = solutions.filter(s => {
    if (activeTab === 'published' && !s.is_published) return false;
    if (activeTab === 'drafts' && s.is_published) return false;
    if (activeTab === 'featured' && !s.is_featured) return false;
    if (searchQuery && !s.title_en?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentSolution.id ? 'Edit Solution' : 'New Solution'}
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
              placeholder="Enter specific details, keywords, or instructions for the AI to generate content..."
              className="w-full px-4 py-2 border border-purple-200 dark:border-purple-800/50 rounded-lg bg-white dark:bg-[#050A15] text-gray-900 dark:text-white mb-3 h-24 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={generateContent}
                disabled={isGeneratingContent}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGeneratingContent ? 'Generating Content...' : 'AI Generate Content'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (EN)</label>
              <input 
                type="text" 
                required
                value={currentSolution.title_en || ''}
                onChange={e => setCurrentSolution({...currentSolution, title_en: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (TH)</label>
              <input 
                type="text" 
                value={currentSolution.title_th || ''}
                onChange={e => setCurrentSolution({...currentSolution, title_th: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
              <input 
                type="text" 
                required
                value={currentSolution.slug || ''}
                onChange={e => setCurrentSolution({...currentSolution, slug: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <input 
                type="text" 
                value={currentSolution.category || ''}
                onChange={e => setCurrentSolution({...currentSolution, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
                placeholder="e.g. Enterprise Web, Digital Transformation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon Name (Lucide)</label>
              <input 
                type="text" 
                value={currentSolution.icon || ''}
                onChange={e => setCurrentSolution({...currentSolution, icon: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (EN)</label>
              <textarea 
                rows={3}
                value={currentSolution.description_en || ''}
                onChange={e => setCurrentSolution({...currentSolution, description_en: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (TH)</label>
              <textarea 
                rows={3}
                value={currentSolution.description_th || ''}
                onChange={e => setCurrentSolution({...currentSolution, description_th: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={!!currentSolution.is_published}
                  onChange={e => setCurrentSolution({...currentSolution, is_published: e.target.checked ? 1 : 0})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={!!currentSolution.is_featured}
                  onChange={e => setCurrentSolution({...currentSolution, is_featured: e.target.checked ? 1 : 0})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/10">
            <button type="submit" className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Save Solution
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Strategic Solutions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage core business solutions and service offerings.</p>
        </div>
        <button onClick={handleCreate} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Solution
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['All', 'Published', 'Drafts', 'Featured'].map((tab) => (
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
              placeholder="Search solutions..."
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
                  Solution Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Featured
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#050A15] divide-y divide-gray-200 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredSolutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No solutions found.</td>
                </tr>
              ) : filteredSolutions.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex flex-col items-center mr-4 space-y-0.5">
                        <button 
                          onClick={() => moveSolution(item.id, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-blue-500 disabled:opacity-10"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-400">{item.sort_order}</span>
                        <button 
                          onClick={() => moveSolution(item.id, 'down')}
                          disabled={idx === solutions.length - 1}
                          className="p-0.5 text-gray-400 hover:text-blue-500 disabled:opacity-10"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title_en}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">/{item.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{item.category || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => toggleSolutionStatus(item)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        item.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300'
                      }`}
                    >
                      {item.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.is_featured ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    -
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
