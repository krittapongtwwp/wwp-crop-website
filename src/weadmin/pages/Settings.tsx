import React, { useState, useEffect } from 'react'
import {
  Globe,
  Search,
  Share2,
  Code,
  Save,
  Image as ImageIcon,
  Users as UsersIcon,
  Plus,
  Pencil,
  Trash2,
  X
} from 'lucide-react'

type UserRole = 'admin' | 'editor' | 'viewer'

interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive'
  lastLogin: string
}

const MOCK_USERS: AdminUser[] = [
  {
    id: 1,
    name: 'Krittapong T.',
    email: 'krittapong@wewebplus.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-05-14 09:21'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@wewebplus.com',
    role: 'editor',
    status: 'active',
    lastLogin: '2026-05-13 17:02'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael@wewebplus.com',
    role: 'editor',
    status: 'active',
    lastLogin: '2026-05-12 11:48'
  },
  {
    id: 4,
    name: 'Sarah Johnson',
    email: 'sarah@wewebplus.com',
    role: 'viewer',
    status: 'inactive',
    lastLogin: '2026-04-29 08:15'
  }
]

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  editor: 'bg-blue-50 text-primary-blue dark:bg-primary-blue/10 dark:text-blue-400',
  viewer: 'bg-gray-100 text-text-secondary dark:bg-white/5 dark:text-gray-400'
}
import { fetchApi, uploadMedia } from '@/lib/api'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [config, setConfig] = useState<any>({
    site_name: 'WEWEBPLUS',
    tagline_en: 'Digital Business Partner',
    tagline_th: 'พันธมิตรธุรกิจดิจิทัลของคุณ',
    meta_title_pattern: '%page_title% | WEWEBPLUS',
    meta_description_en:
      'WEWEBPLUS is a premium software development, enterprise web, UX/UI, and digital transformation company.',
    meta_description_th: 'WEWEBPLUS ผู้เชี่ยวชาญด้านการพัฒนาซอฟต์แวร์ เว็บไซต์องค์กร UX/UI และดิจิทัลทรานส์ฟอร์เมชัน',
    contact_email_general: 'contact@wewebplus.com',
    contact_email_sales: 'sales@wewebplus.com',
    contact_phone_sales: '086 920 7736',
    contact_phone_support: '080 590 9842',
    contact_address_en:
      '172 Soi Prasertmanukit 14\nPrasert Manukit Road, Chorakhe Bua,\nLat Phrao District, Bangkok 10230',
    contact_address_th: '172 ซอยประเสริฐมนูกิจ 14\nถนนประเสริฐมนูกิจ แขวงจรเข้บัว\nเขตลาดพร้าว กรุงเทพมหานคร 10230',
    social_linkedin: '#',
    social_facebook: '#',
    social_twitter: '#'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS)
  const [userSearch, setUserSearch] = useState('')

  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [userForm, setUserForm] = useState<{
    name: string
    email: string
    role: UserRole
    status: 'active' | 'inactive'
  }>({
    name: '',
    email: '',
    role: 'viewer',
    status: 'active'
  })

  const updateUserRole = (id: number, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    // TODO: integrate backend API: PUT /users/:id { role }
  }

  const openCreateUser = () => {
    setEditingUser(null)
    setUserForm({ name: '', email: '', role: 'viewer', status: 'active' })
    setUserModalOpen(true)
  }

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status })
    setUserModalOpen(true)
  }

  const closeUserModal = () => {
    setUserModalOpen(false)
    setEditingUser(null)
  }

  const submitUserForm = () => {
    const name = userForm.name.trim()
    const email = userForm.email.trim()
    if (!name || !email) {
      alert('กรุณากรอกชื่อและอีเมล / Name and email are required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('รูปแบบอีเมลไม่ถูกต้อง / Invalid email format')
      return
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, name, email, role: userForm.role, status: userForm.status } : u
        )
      )
      // TODO: integrate backend API: PUT /users/:id
    } else {
      const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
      const newUser: AdminUser = {
        id: nextId,
        name,
        email,
        role: userForm.role,
        status: userForm.status,
        lastLogin: '-'
      }
      setUsers((prev) => [...prev, newUser])
      // TODO: integrate backend API: POST /users
    }
    closeUserModal()
  }

  const deleteUser = (user: AdminUser) => {
    if (!confirm(`ต้องการลบผู้ใช้ "${user.name}" ใช่หรือไม่? / Delete this user?`)) return
    setUsers((prev) => prev.filter((u) => u.id !== user.id))
    // TODO: integrate backend API: DELETE /users/:id
  }

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return true
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const [settingId, setSettingId] = useState<number | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const res = await fetchApi('/content/settings')
      const data = res.data || res
      const siteConfig = Array.isArray(data) ? data.find((s: any) => s.key === 'site_config') : null
      if (siteConfig) {
        setSettingId(siteConfig.id)
        if (siteConfig.value) {
          setConfig(JSON.parse(siteConfig.value))
        }
      }
    } catch (err) {
      console.error('Failed to load config', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (settingId) {
        await fetchApi(`/content/settings/${settingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            key: 'site_config',
            value: JSON.stringify(config)
          })
        })
      } else {
        const res = await fetchApi('/content/settings', {
          method: 'POST',
          body: JSON.stringify({
            key: 'site_config',
            value: JSON.stringify(config)
          })
        })
        if (res.id) setSettingId(res.id)
      }
      alert('Settings saved successfully!')
    } catch (err) {
      console.error('Failed to save config', err)
      alert('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (key: string, value: any) => {
    setConfig({ ...config, [key]: value })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const file = files[0]
      const data = await uploadMedia(file, `${key} logo`, 'branding')
      updateConfig(key, data.url)
    } catch (err) {
      console.error('Failed to upload logo', err)
      alert('Failed to upload logo.')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">
            ตั้งค่าระบบ / Site Settings
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-1">
            จัดการข้อมูลพื้นฐาน, SEO และการเชื่อมต่อต่างๆ ของเว็บไซต์
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="wwp-button-primary shadow-lg shadow-primary-blue/20">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'กำลังบันทึก... / Saving...' : 'บันทึกการเปลี่ยนแปลง / Save Changes'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="wwp-card overflow-hidden">
            <nav className="p-2 space-y-1">
              {[
                { id: 'general', name: 'ข้อมูลทั่วไป / General', icon: Globe },
                { id: 'contact', name: 'ข้อมูลติดต่อ / Contact Info', icon: Globe },
                { id: 'seo', name: 'SEO & Meta Data', icon: Search },
                { id: 'social', name: 'โซเชียลมีเดีย / Social Media', icon: Share2 },
                { id: 'scripts', name: 'สคริปต์เพิ่มเติม / Custom Scripts', icon: Code },
                { id: 'users', name: 'สิทธิ์ผู้ใช้งาน / User Permission', icon: UsersIcon }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-primary-blue dark:bg-primary-blue/10 dark:text-blue-400 shadow-sm'
                      : 'text-text-secondary hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 hover:text-text-main dark:hover:text-white'
                  }`}>
                  <item.icon
                    className={`flex-shrink-0 mr-3.5 h-5 w-5 ${
                      activeTab === item.id ? 'text-primary-blue dark:text-blue-400' : 'text-text-muted'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-blue shadow-[0_0_8px_rgba(43,113,237,0.6)]" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div className="wwp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
                  <h3 className="text-lg font-bold text-text-main dark:text-white">ข้อมูลพื้นฐาน / Site Identity</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="wwp-input-group">
                    <label className="wwp-label">ชื่อเว็บไซต์ / Site Name</label>
                    <input
                      type="text"
                      value={config.site_name || ''}
                      onChange={(e) => updateConfig('site_name', e.target.value)}
                      className="wwp-input"
                      placeholder="เช่น WeWebPlus"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="wwp-input-group">
                      <label className="wwp-label">สโลแกน (EN) / Tagline (EN)</label>
                      <input
                        type="text"
                        value={config.tagline_en || ''}
                        onChange={(e) => updateConfig('tagline_en', e.target.value)}
                        className="wwp-input"
                        placeholder="Digital Business Partner"
                      />
                    </div>

                    <div className="wwp-input-group">
                      <label className="wwp-label">สโลแกน (TH) / Tagline (TH)</label>
                      <input
                        type="text"
                        value={config.tagline_th || ''}
                        onChange={(e) => updateConfig('tagline_th', e.target.value)}
                        className="wwp-input"
                        placeholder="พันธมิตรธุรกิจดิจิทัลของคุณ"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="wwp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
                  <h3 className="text-lg font-bold text-text-main dark:text-white">
                    โลโก้และแบรนด์ / Logos & Branding
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="wwp-input-group">
                    <label className="wwp-label mb-3">โลโก้หลัก (โหมดสว่าง) / Primary Logo (Light Mode)</label>
                    <div className="relative group aspect-[3/1] rounded-2xl border-2 border-dashed border-border-subtle dark:border-white/10 bg-gray-50/50 dark:bg-white/2 hover:border-primary-blue/50 transition-all overflow-hidden flex flex-col items-center justify-center p-6">
                      {config.primary_logo ? (
                        <>
                          <img
                            src={config.primary_logo}
                            alt="Primary Logo"
                            className="max-h-full max-w-full object-contain relative z-10"
                          />
                          <div className="absolute inset-0 bg-primary-deep/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                            <span className="text-white text-xs font-bold uppercase tracking-widest">
                              เปลี่ยนรูปภาพ / Change
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 shadow-sm flex items-center justify-center mx-auto">
                            <ImageIcon className="h-6 w-6 text-text-muted" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary-blue uppercase tracking-widest">
                              อัปโหลดไฟล์ / Upload
                            </p>
                            <p className="text-[10px] text-text-muted mt-1">PNG, SVG (Max 2MB)</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'primary_logo')}
                      />
                    </div>
                  </div>

                  <div className="wwp-input-group">
                    <label className="wwp-label mb-3">โลโก้รอง (โหมดมืด) / Secondary Logo (Dark Mode)</label>
                    <div className="relative group aspect-[3/1] rounded-2xl border-2 border-dashed border-border-subtle dark:border-white/10 bg-[#020617] hover:border-primary-blue/50 transition-all overflow-hidden flex flex-col items-center justify-center p-6">
                      {config.secondary_logo ? (
                        <>
                          <img
                            src={config.secondary_logo}
                            alt="Secondary Logo"
                            className="max-h-full max-w-full object-contain relative z-10"
                          />
                          <div className="absolute inset-0 bg-primary-deep/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                            <span className="text-white text-xs font-bold uppercase tracking-widest">
                              เปลี่ยนรูปภาพ / Change
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-white/5 shadow-sm flex items-center justify-center mx-auto">
                            <ImageIcon className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary-blue uppercase tracking-widest">
                              อัปโหลดไฟล์ / Upload
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">PNG, SVG (Max 2MB)</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'secondary_logo')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-8">
              <div className="wwp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
                  <h3 className="text-lg font-bold text-text-main dark:text-white">
                    ข้อมูลติดต่อ / Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="wwp-input-group">
                      <label className="wwp-label">อีเมลทั่วไป / General Email</label>
                      <input
                        type="email"
                        value={config.contact_email_general || ''}
                        onChange={(e) => updateConfig('contact_email_general', e.target.value)}
                        className="wwp-input"
                        placeholder="contact@wewebplus.com"
                      />
                    </div>
                    <div className="wwp-input-group">
                      <label className="wwp-label">อีเมลฝ่ายขาย / Sales Email</label>
                      <input
                        type="email"
                        value={config.contact_email_sales || ''}
                        onChange={(e) => updateConfig('contact_email_sales', e.target.value)}
                        className="wwp-input"
                        placeholder="sales@wewebplus.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="wwp-input-group">
                      <label className="wwp-label">เบอร์โทรศัพท์ฝ่ายขาย / Sales Phone</label>
                      <input
                        type="text"
                        value={config.contact_phone_sales || ''}
                        onChange={(e) => updateConfig('contact_phone_sales', e.target.value)}
                        className="wwp-input"
                        placeholder="08x xxx xxxx"
                      />
                    </div>
                    <div className="wwp-input-group">
                      <label className="wwp-label">เบอร์โทรศัพท์ฝ่ายสนับสนุน / Support Phone</label>
                      <input
                        type="text"
                        value={config.contact_phone_support || ''}
                        onChange={(e) => updateConfig('contact_phone_support', e.target.value)}
                        className="wwp-input"
                        placeholder="08x xxx xxxx"
                      />
                    </div>
                  </div>

                  <div className="wwp-input-group">
                    <label className="wwp-label">ที่อยู่ (EN) / Address (EN)</label>
                    <textarea
                      rows={3}
                      value={config.contact_address_en || ''}
                      onChange={(e) => updateConfig('contact_address_en', e.target.value)}
                      className="wwp-input resize-none"
                      placeholder="Enter address in English"
                    />
                  </div>

                  <div className="wwp-input-group">
                    <label className="wwp-label">ที่อยู่ (TH) / Address (TH)</label>
                    <textarea
                      rows={3}
                      value={config.contact_address_th || ''}
                      onChange={(e) => updateConfig('contact_address_th', e.target.value)}
                      className="wwp-input resize-none"
                      placeholder="กรอกที่อยู่ภาษาไทย"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-8">
              <div className="wwp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
                  <h3 className="text-lg font-bold text-text-main dark:text-white">
                    ตั้งค่า SEO / Global SEO Settings
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="wwp-input-group">
                    <label className="wwp-label">รูปแบบหัวข้อหน้าเว็บ / Meta Title Pattern</label>
                    <input
                      type="text"
                      value={config.meta_title_pattern || ''}
                      onChange={(e) => updateConfig('meta_title_pattern', e.target.value)}
                      className="wwp-input font-mono"
                      placeholder="%page_title% | %site_name%"
                    />
                    <p className="mt-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      แท็กที่ใช้งานได้: %page_title%, %site_name%
                    </p>
                  </div>

                  <div className="wwp-input-group">
                    <label className="wwp-label">คำอธิบายเริ่มต้น (EN) / Default Meta Description (EN)</label>
                    <textarea
                      rows={4}
                      value={config.meta_description_en || ''}
                      onChange={(e) => updateConfig('meta_description_en', e.target.value)}
                      className="wwp-input resize-none"
                      placeholder="Enter default meta description in English"
                    />
                  </div>

                  <div className="wwp-input-group">
                    <label className="wwp-label">คำอธิบายเริ่มต้น (TH) / Default Meta Description (TH)</label>
                    <textarea
                      rows={4}
                      value={config.meta_description_th || ''}
                      onChange={(e) => updateConfig('meta_description_th', e.target.value)}
                      className="wwp-input resize-none"
                      placeholder="กรอกคำอธิบายเริ่มต้นภาษาไทย"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-8">
              <div className="wwp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
                  <h3 className="text-lg font-bold text-text-main dark:text-white">
                    ลิงก์โซเชียลมีเดีย / Social Media Links
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="wwp-input-group">
                    <label className="wwp-label">Facebook URL</label>
                    <input
                      type="url"
                      value={config.social_facebook || ''}
                      onChange={(e) => updateConfig('social_facebook', e.target.value)}
                      placeholder="https://facebook.com/wewebplus"
                      className="wwp-input"
                    />
                  </div>
                  <div className="wwp-input-group">
                    <label className="wwp-label">LinkedIn URL</label>
                    <input
                      type="url"
                      value={config.social_linkedin || ''}
                      onChange={(e) => updateConfig('social_linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/wewebplus"
                      className="wwp-input"
                    />
                  </div>
                  <div className="wwp-input-group">
                    <label className="wwp-label">Instagram URL</label>
                    <input
                      type="url"
                      value={config.social_instagram || ''}
                      onChange={(e) => updateConfig('social_instagram', e.target.value)}
                      placeholder="https://instagram.com/wewebplus"
                      className="wwp-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="wwp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
                  <h3 className="text-lg font-bold text-text-main dark:text-white">
                    สิทธิ์ผู้ใช้งาน / User Permission
                  </h3>
                </div>
                <p className="text-xs font-medium text-text-muted mb-6 leading-relaxed">
                  จัดการบทบาทของผู้ใช้งานในระบบ Admin โดย Admin มีสิทธิ์เต็ม, Editor แก้ไขเนื้อหาได้, Viewer
                  ดูได้อย่างเดียว
                </p>

                <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="wwp-input-group flex-1">
                    <label className="wwp-label">ค้นหา / Search</label>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="wwp-input"
                      placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={openCreateUser}
                    className="wwp-button-primary shadow-lg shadow-primary-blue/20 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มผู้ใช้ / Add User
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border-subtle dark:border-white/5">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-white/5">
                      <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        <th className="px-5 py-3">ผู้ใช้งาน / User</th>
                        <th className="px-5 py-3">บทบาท / Role</th>
                        <th className="px-5 py-3">สถานะ / Status</th>
                        <th className="px-5 py-3">เข้าสู่ระบบล่าสุด / Last Login</th>
                        <th className="px-5 py-3 text-right">จัดการ / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle dark:divide-white/5">
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                            ไม่พบผู้ใช้งาน / No users found
                          </td>
                        </tr>
                      )}
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full wwp-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-text-main dark:text-white truncate">{user.name}</div>
                                <div className="text-xs text-text-muted truncate">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${ROLE_BADGE[user.role]}`}>
                                {user.role}
                              </span>
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                                className="wwp-input py-1.5 text-xs w-auto">
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                user.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-text-muted'
                              }`}>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  user.status === 'active'
                                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                                    : 'bg-gray-400'
                                }`}
                              />
                              {user.status === 'active' ? 'ใช้งาน / Active' : 'ปิดใช้งาน / Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-text-secondary dark:text-gray-400 font-mono">
                            {user.lastLogin}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditUser(user)}
                                title="แก้ไข / Edit"
                                className="p-2 rounded-lg text-text-muted hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-primary-blue/10 transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteUser(user)}
                                title="ลบ / Delete"
                                className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  * ขณะนี้แสดงข้อมูลตัวอย่าง (Mock Data) — รอเชื่อมต่อ Backend API
                </p>
              </div>
            </div>
          )}

          {activeTab === 'scripts' && (
            <div className="space-y-8">
              <div className="wwp-card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
                  <h3 className="text-lg font-bold text-text-main dark:text-white">
                    สคริปต์เพิ่มเติม / Custom Scripts
                  </h3>
                </div>
                <p className="text-xs font-medium text-text-muted mb-6 leading-relaxed">
                  คุณสามารถเพิ่มโค้ดติดตามผล เช่น Google Analytics, Facebook Pixel หรือสคริปต์อื่นๆ ได้ที่นี่
                </p>

                <div className="grid grid-cols-1 gap-8">
                  <div className="wwp-input-group">
                    <label className="wwp-label">สคริปต์ในส่วนหัว / Header Scripts (&lt;head&gt;)</label>
                    <textarea
                      rows={8}
                      value={config.scripts_head || ''}
                      onChange={(e) => updateConfig('scripts_head', e.target.value)}
                      placeholder="<!-- Google Analytics -->"
                      className="wwp-input font-mono text-xs resize-y"
                    />
                  </div>
                  <div className="wwp-input-group">
                    <label className="wwp-label">สคริปต์ในส่วนท้าย / Footer Scripts (before &lt;/body&gt;)</label>
                    <textarea
                      rows={8}
                      value={config.scripts_body || ''}
                      onChange={(e) => updateConfig('scripts_body', e.target.value)}
                      placeholder="<!-- Custom chat widget -->"
                      className="wwp-input font-mono text-xs resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {userModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeUserModal}>
          <div className="wwp-card w-full max-w-lg p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={closeUserModal}
              className="absolute top-4 right-4 p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center mb-6">
              <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
              <h3 className="text-lg font-bold text-text-main dark:text-white">
                {editingUser ? 'แก้ไขผู้ใช้ / Edit User' : 'เพิ่มผู้ใช้ใหม่ / Add New User'}
              </h3>
            </div>

            <div className="space-y-5">
              <div className="wwp-input-group">
                <label className="wwp-label">ชื่อ / Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="wwp-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="wwp-input-group">
                <label className="wwp-label">อีเมล / Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="wwp-input"
                  placeholder="user@wewebplus.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="wwp-input-group">
                  <label className="wwp-label">บทบาท / Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="wwp-input">
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="wwp-input-group">
                  <label className="wwp-label">สถานะ / Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as 'active' | 'inactive' })}
                    className="wwp-input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={closeUserModal}
                className="px-4 py-2 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                ยกเลิก / Cancel
              </button>
              <button
                type="button"
                onClick={submitUserForm}
                className="wwp-button-primary shadow-lg shadow-primary-blue/20">
                <Save className="w-4 h-4 mr-2" />
                {editingUser ? 'บันทึก / Save' : 'เพิ่มผู้ใช้ / Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
