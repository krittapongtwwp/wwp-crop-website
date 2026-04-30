import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Trash2, 
  Image as ImageIcon,
  File,
  Folder,
  MoreVertical,
  X
} from 'lucide-react';
import { fetchApi, uploadMedia } from '@/lib/api';

export default function AdminMediaLibrary() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/media');
      const data = res.data || res;
      setMedia(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load media', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      await uploadMedia(file, file.name, 'general');
      await loadMedia();
    } catch (err) {
      console.error('Failed to upload media', err);
      alert('Failed to upload media.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await fetchApi(`/media/${id}`, { method: 'DELETE' });
      await loadMedia();
    } catch (err) {
      console.error('Failed to delete media', err);
    }
  };

  const filteredMedia = media.filter(item => {
    if (searchQuery && !item.filename?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage images, documents, and other files.</p>
        </div>
        <div>
          <input
            type="file"
            id="media-upload"
            className="hidden"
            onChange={handleUpload}
            accept="image/*,application/pdf"
          />
          <label 
            htmlFor="media-upload"
            className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </label>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button className="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white">
            All Files
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5">
            Images
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5">
            Documents
          </button>
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
              placeholder="Search files..."
            />
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading media...</div>
        ) : filteredMedia.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No media files found.</div>
        ) : filteredMedia.map((item) => (
          <div key={item.id} className="group relative bg-white dark:bg-[#050A15] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
              {item.url && item.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || item.url?.startsWith('blob:') ? (
                <img src={item.url} alt={item.alt_text} className="w-full h-full object-cover" />
              ) : (
                <File className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.filename}>
                {item.filename}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            
            {/* Actions overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
