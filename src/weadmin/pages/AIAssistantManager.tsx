import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  Database, 
  Activity,
  Save,
  PlayCircle,
  Plus,
  Trash2,
  X,
  User,
  Cpu
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { fetchApi } from '@/lib/api';

export default function AdminAIAssistant() {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState<any>({
    assistant_name: 'WEWEBPLUS AI',
    system_prompt: 'You are the official AI assistant for WEWEBPLUS...',
    greeting_en: 'Hello! I\'m the WEWEBPLUS AI Assistant.',
    greeting_th: 'สวัสดีครับ! ผมคือผู้ช่วย AI ของ WEWEBPLUS',
    quick_actions: '["Tell me about your enterprise web solutions", "Can I see your portfolio?", "I want to request a project consultation", "Are you hiring developers?"]',
    enable_lead_capture: 1,
    capture_prompt: 'I\'d love to connect you with our experts. Could you provide your email address so we can reach out?',
    out_of_scope_message: 'I specialize in answering questions about WEWEBPLUS services, projects, and careers. For other inquiries, please contact us directly.',
    human_handoff_message: 'Let me connect you with a human representative. Please leave your contact details or email hello@wewebplus.com.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', content: '', category: 'general' });
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const [settingId, setSettingId] = useState<number | null>(null);

  useEffect(() => {
    loadConfig();
    loadKnowledgeBase();
    loadLogs();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetchApi('/content/settings');
      const data = res.data || res;
      const aiConfig = Array.isArray(data) ? data.find((s: any) => s.key === 'ai_assistant_config') : null;
      if (aiConfig) {
        setSettingId(aiConfig.id);
        if (aiConfig.value) {
          setConfig(JSON.parse(aiConfig.value));
        }
      }
    } catch (err) {
      console.error('Failed to load config', err);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const res = await fetchApi('/content/ai_knowledge');
      const data = res.data || res;
      setKnowledgeBase(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load knowledge base', err);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetchApi('/content/ai_logs');
      const data = res.data || res;
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/content/ai_knowledge', {
        method: 'POST',
        body: JSON.stringify(newDoc)
      });
      setIsAddingDoc(false);
      setNewDoc({ title: '', content: '', category: 'general' });
      await loadKnowledgeBase();
    } catch (err) {
      console.error('Failed to add knowledge', err);
    }
  };

  const handleDeleteKnowledge = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await fetchApi(`/content/ai_knowledge/${id}`, { method: 'DELETE' });
      await loadKnowledgeBase();
    } catch (err) {
      console.error('Failed to delete knowledge', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (settingId) {
        await fetchApi(`/content/settings/${settingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            key: 'ai_assistant_config',
            value: JSON.stringify(config)
          })
        });
      } else {
        const res = await fetchApi('/content/settings', {
          method: 'POST',
          body: JSON.stringify({
            key: 'ai_assistant_config',
            value: JSON.stringify(config)
          })
        });
        if (res.id) setSettingId(res.id);
      }
      alert('Configuration saved successfully!');
    } catch (err) {
      console.error('Failed to save config', err);
      alert('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const getQuickActions = () => {
    try {
      return JSON.parse(config.quick_actions || '[]');
    } catch (e) {
      return [];
    }
  };

  const updateQuickAction = (index: number, value: string) => {
    const actions = getQuickActions();
    actions[index] = value;
    updateConfig('quick_actions', JSON.stringify(actions));
  };

  const removeQuickAction = (index: number) => {
    const actions = getQuickActions();
    actions.splice(index, 1);
    updateConfig('quick_actions', JSON.stringify(actions));
  };

  const addQuickAction = () => {
    const actions = getQuickActions();
    actions.push('New Action');
    updateConfig('quick_actions', JSON.stringify(actions));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure and monitor the WEWEBPLUS AI Assistant.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            <PlayCircle className="w-4 h-4 mr-2" />
            Test Assistant
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'config', name: 'Configuration', icon: Settings },
            { id: 'knowledge', name: 'Knowledge Base', icon: Database },
            { id: 'logs', name: 'Conversation Logs', icon: MessageSquare },
            { id: 'analytics', name: 'Analytics', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <tab.icon className={`
                -ml-0.5 mr-2 h-5 w-5
                ${activeTab === tab.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}
              `} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Identity & Behavior</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assistant Name
                  </label>
                  <input 
                    type="text" 
                    value={config.assistant_name || ''}
                    onChange={e => updateConfig('assistant_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    System Prompt / Persona
                  </label>
                  <textarea 
                    rows={6}
                    value={config.system_prompt || ''}
                    onChange={e => updateConfig('system_prompt', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Initial Greeting (EN)
                  </label>
                  <input 
                    type="text" 
                    value={config.greeting_en || ''}
                    onChange={e => updateConfig('greeting_en', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Initial Greeting (TH)
                  </label>
                  <input 
                    type="text" 
                    value={config.greeting_th || ''}
                    onChange={e => updateConfig('greeting_th', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Suggested prompts shown to users when they open the chat.</p>
              
              <div className="space-y-3">
                {getQuickActions().map((action: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={action}
                      onChange={e => updateQuickAction(idx, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <button onClick={() => removeQuickAction(idx)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button onClick={addQuickAction} className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Add Quick Action
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Lead Capture</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Lead Capture</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prompt for email on project inquiries</p>
                  </div>
                  <button 
                    onClick={() => updateConfig('enable_lead_capture', config.enable_lead_capture ? 0 : 1)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.enable_lead_capture ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                    role="switch" 
                    aria-checked={!!config.enable_lead_capture}
                  >
                    <span className={`${config.enable_lead_capture ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capture Prompt
                  </label>
                  <textarea 
                    rows={3}
                    value={config.capture_prompt || ''}
                    onChange={e => updateConfig('capture_prompt', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fallback & Safety</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Out of Scope Message
                  </label>
                  <textarea 
                    rows={3}
                    value={config.out_of_scope_message || ''}
                    onChange={e => updateConfig('out_of_scope_message', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Human Handoff Message
                  </label>
                  <textarea 
                    rows={3}
                    value={config.human_handoff_message || ''}
                    onChange={e => updateConfig('human_handoff_message', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          {isAddingDoc ? (
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Knowledge Document</h3>
                <button onClick={() => setIsAddingDoc(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddKnowledge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={newDoc.title}
                    onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g. Services Overview"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    value={newDoc.category}
                    onChange={e => setNewDoc({...newDoc, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="general">General</option>
                    <option value="services">Services</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="careers">Careers</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                  <textarea 
                    rows={10}
                    required
                    value={newDoc.content}
                    onChange={e => setNewDoc({...newDoc, content: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm"
                    placeholder="Paste the knowledge content here..."
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Save Document
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Knowledge Base Documents</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add text documents for the AI to learn from.</p>
                </div>
                <button onClick={() => setIsAddingDoc(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </button>
              </div>
              
              <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                  <thead className="bg-gray-50 dark:bg-white/5">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Document Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#050A15] divide-y divide-gray-200 dark:divide-white/10">
                    {knowledgeBase.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No documents in knowledge base.</td>
                      </tr>
                    ) : knowledgeBase.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{doc.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{doc.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300'}`}>
                            {doc.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleDeleteKnowledge(doc.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Conversations</h3>
            <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Message</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Captured</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#050A15] divide-y divide-gray-200 dark:divide-white/10">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No conversation logs found.</td>
                    </tr>
                  ) : logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{log.session_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{log.user_message}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.is_lead_captured ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300'}`}>
                          {log.is_lead_captured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Log Detail Modal */}
          {selectedLog && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 dark:bg-black opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-[#050A15] rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-white/10">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Conversation Details</h3>
                    <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-500">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Session ID</p>
                        <p className="font-mono text-gray-900 dark:text-white">{selectedLog.session_id}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Date & Time</p>
                        <p className="text-gray-900 dark:text-white">{new Date(selectedLog.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Lead Captured</p>
                        <p className="text-gray-900 dark:text-white">{selectedLog.is_lead_captured ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Lead Email</p>
                        <p className="text-gray-900 dark:text-white">{selectedLog.lead_email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">User</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedLog.user_message}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">AI Assistant</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedLog.ai_response}</p>
                        </div>
                      </div>
                    </div>

                    {selectedLog.metadata && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Technical Metadata</p>
                        <pre className="bg-gray-50 dark:bg-black p-3 rounded-lg text-[10px] font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                          {JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex justify-end">
                    <button 
                      onClick={() => setSelectedLog(null)}
                      className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Conversations</h4>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{logs.length}</p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                {logs.length > 0 ? '+100%' : '0%'} from last month
              </p>
            </div>
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Conversion Rate</h4>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {logs.length > 0 ? ((logs.filter(l => l.is_lead_captured).length / logs.length) * 100).toFixed(1) : 0}%
              </p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">Based on captured emails</p>
            </div>
            <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Knowledge Base Size</h4>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{knowledgeBase.length}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Active documents</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#050A15] shadow-sm rounded-xl border border-gray-200 dark:border-white/10 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Conversation Volume (Last 7 Days)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: 'Mon', count: 4 },
                    { name: 'Tue', count: 7 },
                    { name: 'Wed', count: 5 },
                    { name: 'Thu', count: 12 },
                    { name: 'Fri', count: 9 },
                    { name: 'Sat', count: 15 },
                    { name: 'Sun', count: 10 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
