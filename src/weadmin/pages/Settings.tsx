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
  X,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Settings as SettingsIcon,
  LayoutDashboard,
  Home,
  Layers,
  Briefcase,
  Users,
  FileText,
  MessageSquare,
  Bot,
  History
} from 'lucide-react'

type UserRole = 'admin' | 'editor' | 'viewer'

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  editor: 'bg-blue-50 text-primary-blue dark:bg-primary-blue/10 dark:text-blue-400',
  viewer: 'bg-gray-100 text-text-secondary dark:bg-white/5 dark:text-gray-400'
}

type PermissionLevel = 'viewer' | 'editor' | 'all'

interface PermissionGroup {
  id: number
  name_en: string
  name_th: string
  description: string
  permissions: Record<string, PermissionLevel>
}

const MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'homepage', name: 'Homepage', icon: Home },
  { id: 'solutions', name: 'Solutions', icon: Layers },
  { id: 'portfolio', name: 'Portfolio', icon: Briefcase },
  { id: 'clients', name: 'Clients', icon: Users },
  { id: 'services', name: 'Services', icon: Layers },
  { id: 'press', name: 'Insights (Press)', icon: FileText },
  { id: 'careers', name: 'Careers', icon: Briefcase },
  { id: 'leads', name: 'Leads', icon: MessageSquare },
  { id: 'ai-assistant', name: 'AI Assistant', icon: Bot },
  { id: 'media', name: 'Media Library', icon: ImageIcon },
  { id: 'changelog', name: 'Changelog', icon: History },
  { id: 'settings', name: 'Settings', icon: SettingsIcon }
]

import { fetchApi, uploadMedia } from '@/lib/api'
import { usersApi, getUserErrorMessage, type ApiUser } from '@/lib/api/users'

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
  const [users, setUsers] = useState<ApiUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userSubmitting, setUserSubmitting] = useState(false)

  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [userForm, setUserForm] = useState<{
    name: string
    email: string
    role: UserRole
    password: string
    confirmPassword: string
  }>({
    name: '',
    email: '',
    role: 'viewer',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // System Permissions State
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([
    {
      id: 1,
      name_en: 'Administrator',
      name_th: 'ผู้ดูแลระบบ',
      description: 'Full access to all system features and settings.',
      permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: 'all' }), {})
    },
    {
      id: 2,
      name_en: 'Editor',
      name_th: 'ผู้แก้ไขเนื้อหา',
      description: 'Can manage content but cannot change system settings.',
      permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: m.id === 'settings' ? 'viewer' : 'editor' }), {})
    },
    {
      id: 3,
      name_en: 'Viewer',
      name_th: 'ผู้เข้าชม',
      description: 'Read-only access to most parts of the system.',
      permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: 'viewer' }), {})
    }
  ])
  const [permissionModalOpen, setPermissionModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<PermissionGroup | null>(null)
  const [permissionForm, setPermissionForm] = useState<PermissionGroup>({
    id: 0,
    name_en: '',
    name_th: '',
    description: '',
    permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: 'viewer' }), {})
  })

  // ===== Load users on mount =====
  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const data = await usersApi.list()
      setUsers(data)
    } catch (err) {
      console.error('Failed to load users', err)
      alert(getUserErrorMessage(err))
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // ===== Inline role change (dropdown ในตาราง) =====
  const updateUserRole = async (id: number, role: UserRole) => {
    const target = users.find((u) => u.id === id)
    if (!target) return
    try {
      await usersApi.update(id, {
        email: target.email,
        name: target.name,
        role
      })
      await loadUsers()
    } catch (err) {
      console.error('Failed to update role', err)
      alert(getUserErrorMessage(err))
    }
  }

  const openCreateUser = () => {
    setEditingUser(null)
    setUserForm({ name: '', email: '', role: 'viewer', password: '', confirmPassword: '' })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setUserModalOpen(true)
  }

  const openEditUser = (user: ApiUser) => {
    setEditingUser(user)
    setUserForm({
      name: user.name ?? '',
      email: user.email,
      role: user.role,
      password: '',
      confirmPassword: ''
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setUserModalOpen(true)
  }

  const closeUserModal = () => {
    if (userSubmitting) return
    setUserModalOpen(false)
    setEditingUser(null)
  }

  const submitUserForm = async () => {
    const name = userForm.name.trim()
    const email = userForm.email.trim()
    if (!email) {
      alert('กรุณากรอกอีเมล / Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('รูปแบบอีเมลไม่ถูกต้อง / Invalid email format')
      return
    }

    const password = userForm.password
    const confirmPassword = userForm.confirmPassword
    const passwordRequired = !editingUser
    const passwordProvided = password.length > 0 || confirmPassword.length > 0

    if (passwordRequired || passwordProvided) {
      if (password.length < 4) {
        alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร / Password must be at least 8 characters')
        return
      }
      if (password !== confirmPassword) {
        alert('รหัสผ่านยืนยันไม่ตรงกัน / Passwords do not match')
        return
      }
    }

    try {
      setUserSubmitting(true)
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          email,
          name: name || null,
          role: userForm.role,
          ...(passwordProvided ? { password } : {})
        })
      } else {
        await usersApi.create({
          email,
          name: name || null,
          role: userForm.role,
          password
        })
      }
      await loadUsers()
      setUserModalOpen(false)
      setEditingUser(null)
    } catch (err) {
      console.error('Failed to save user', err)
      alert(getUserErrorMessage(err))
    } finally {
      setUserSubmitting(false)
    }
  }

  const deleteUser = async (user: ApiUser) => {
    const label = user.name || user.email
    if (!confirm(`ต้องการลบผู้ใช้ "${label}" ใช่หรือไม่? / Delete this user?`)) return
    try {
      await usersApi.remove(user.id)
      await loadUsers()
    } catch (err) {
      console.error('Failed to delete user', err)
      alert(getUserErrorMessage(err))
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return true
    return (u.name ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  // System Permissions Handlers
  const openCreatePermission = () => {
    setEditingPermission(null)
    setPermissionForm({
      id: Date.now(),
      name_en: '',
      name_th: '',
      description: '',
      permissions: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: 'viewer' }), {})
    })
    setPermissionModalOpen(true)
  }

  const openEditPermission = (group: PermissionGroup) => {
    setEditingPermission(group)
    setPermissionForm({ ...group })
    setPermissionModalOpen(true)
  }

  const deletePermission = (id: number) => {
    if (!confirm('ต้องการลบสิทธิ์นี้ใช่หรือไม่? / Delete this permission group?')) return
    setPermissionGroups((prev) => prev.filter((g) => g.id !== id))
  }

  const submitPermissionForm = () => {
    if (!permissionForm.name_en || !permissionForm.name_th) {
      alert('กรุณากรอกชื่อสิทธิ์ / Please enter permission name')
      return
    }

    if (editingPermission) {
      setPermissionGroups((prev) => prev.map((g) => (g.id === editingPermission.id ? permissionForm : g)))
    } else {
      setPermissionGroups((prev) => [...prev, permissionForm])
    }
    setPermissionModalOpen(false)
  }

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
                { id: 'users', name: 'บัญชีผู้ใช้งาน / User Accounts', icon: UsersIcon },
                { id: 'permissions', name: 'สิทธิการใช้งาน / Permissions', icon: ShieldCheck }
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
                    บัญชีผู้ใช้งาน / User Accounts
                  </h3>
                </div>
                <p className="text-xs font-medium text-text-muted mb-6 leading-relaxed">
                  จัดการบัญชีผู้ใช้และกำหนดบทบาทพื้นฐาน Admin, Editor, Viewer เพื่อควบคุมการเข้าถึงระบบ
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
                        <th className="px-5 py-3 text-right">จัดการ / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle dark:divide-white/5">
                      {usersLoading && (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-text-muted">
                            กำลังโหลด... / Loading...
                          </td>
                        </tr>
                      )}
                      {!usersLoading && filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-text-muted">
                            ไม่พบผู้ใช้งาน / No users found
                          </td>
                        </tr>
                      )}
                      {!usersLoading &&
                        filteredUsers.map((user) => {
                          const displayName = user.name || user.email
                          const initials = displayName
                            .split(/\s+|@/)
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                          return (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full wwp-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-text-main dark:text-white truncate">
                                      {user.name || <span className="text-text-muted italic">— ไม่ระบุชื่อ</span>}
                                    </div>
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
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="wwp-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
                    <h3 className="text-lg font-bold text-text-main dark:text-white">
                      สิทธิการใช้งานระบบ / System Permissions
                    </h3>
                  </div>
                  <button
                    onClick={openCreatePermission}
                    className="wwp-button-primary shadow-lg shadow-primary-blue/20">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มสิทธิ์ใหม่ / Add Permission
                  </button>
                </div>
                <p className="text-xs font-medium text-text-muted mb-8 leading-relaxed max-w-2xl">
                  กำหนดกลุ่มสิทธิ์ (Role) และระบุระดับการเข้าถึงในแต่ละโมดูลของระบบ เช่น การดูข้อมูล (Viewer), การแก้ไข (Editor) หรือการเข้าถึงทั้งหมด (Full Access)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {permissionGroups.map((group) => (
                    <div
                      key={group.id}
                      className="group relative flex flex-col p-6 rounded-2xl bg-gray-50 dark:bg-white/2 border border-border-subtle dark:border-white/5 hover:border-primary-blue/30 dark:hover:border-primary-blue/30 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center text-primary-blue dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditPermission(group)}
                            className="p-2 rounded-lg text-text-muted hover:text-primary-blue hover:bg-white dark:hover:bg-white/10 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePermission(group.id)}
                            className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-white dark:hover:bg-white/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-base font-bold text-text-main dark:text-white flex items-center">
                          {group.name_th}
                          <ChevronRight className="w-3 h-3 mx-1.5 text-text-muted" />
                          <span className="text-xs text-text-secondary font-medium">{group.name_en}</span>
                        </h4>
                        <p className="text-xs text-text-muted mt-2 line-clamp-2 h-8 leading-relaxed">
                          {group.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-border-subtle dark:border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            สิทธิ์การเข้าถึง / Permissions
                          </span>
                          <span className="text-[10px] font-bold text-primary-blue px-2 py-0.5 rounded-full bg-blue-50 dark:bg-primary-blue/10">
                            {Object.values(group.permissions).filter((p) => p === 'all').length}/{MODULES.length} โมดูล
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {MODULES.slice(0, 5).map((m) => (
                            <div
                              key={m.id}
                              title={m.name}
                              className={`w-1.5 h-1.5 rounded-full ${
                                group.permissions[m.id] === 'all'
                                  ? 'bg-primary-blue shadow-[0_0_4px_rgba(43,113,237,0.5)]'
                                  : group.permissions[m.id] === 'editor'
                                  ? 'bg-blue-300'
                                  : 'bg-gray-300 dark:bg-white/10'
                              }`}
                            />
                          ))}
                          {MODULES.length > 5 && (
                            <span className="text-[8px] font-bold text-text-muted ml-0.5">+{MODULES.length - 5}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

              {/* Password Section */}
              <div className="pt-5 border-t border-border-subtle dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="w-4 h-4 text-text-muted" />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-gray-400">
                    {editingUser ? 'เปลี่ยนรหัสผ่าน / Change Password' : 'ตั้งรหัสผ่าน / Set Password'}
                  </span>
                </div>
                {editingUser && (
                  <p className="text-[11px] text-text-muted mb-4">
                    เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน / Leave blank to keep current password
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="wwp-input-group">
                    <label className="wwp-label">
                      รหัสผ่าน / Password {!editingUser && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="wwp-input pr-10"
                        placeholder={editingUser ? '••••••••' : 'อย่างน้อย 8 ตัวอักษร'}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text-main transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="wwp-input-group">
                    <label className="wwp-label">
                      ยืนยันรหัสผ่าน / Confirm {!editingUser && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={userForm.confirmPassword}
                        onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                        className="wwp-input pr-10"
                        placeholder={editingUser ? '••••••••' : 'พิมพ์รหัสผ่านอีกครั้ง'}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text-main transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={closeUserModal}
                disabled={userSubmitting}
                className="px-4 py-2 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50">
                ยกเลิก / Cancel
              </button>
              <button
                type="button"
                onClick={submitUserForm}
                disabled={userSubmitting}
                className="wwp-button-primary shadow-lg shadow-primary-blue/20 disabled:opacity-60">
                <Save className="w-4 h-4 mr-2" />
                {userSubmitting ? 'กำลังบันทึก... / Saving...' : editingUser ? 'บันทึก / Save' : 'เพิ่มผู้ใช้ / Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Permission Modal */}
      {permissionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPermissionModalOpen(false)}>
          <div
            className="wwp-card w-full max-w-4xl p-8 my-8 relative"
            onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPermissionModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center mb-6">
              <div className="w-1 h-6 wwp-gradient rounded-full mr-3" />
              <h3 className="text-lg font-bold text-text-main dark:text-white">
                {editingPermission ? 'แก้ไขกลุ่มสิทธิ์ / Edit Permission Group' : 'เพิ่มกลุ่มสิทธิ์ใหม่ / Add New Permission Group'}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-5 lg:col-span-1">
                <div className="wwp-input-group">
                  <label className="wwp-label">ชื่อสิทธิ์ (TH) / Name (TH)</label>
                  <input
                    type="text"
                    value={permissionForm.name_th}
                    onChange={(e) => setPermissionForm({ ...permissionForm, name_th: e.target.value })}
                    className="wwp-input"
                    placeholder="เช่น ผู้จัดการเนื้อหา"
                  />
                </div>
                <div className="wwp-input-group">
                  <label className="wwp-label">ชื่อสิทธิ์ (EN) / Name (EN)</label>
                  <input
                    type="text"
                    value={permissionForm.name_en}
                    onChange={(e) => setPermissionForm({ ...permissionForm, name_en: e.target.value })}
                    className="wwp-input"
                    placeholder="e.g. Content Manager"
                  />
                </div>
                <div className="wwp-input-group">
                  <label className="wwp-label">คำอธิบาย / Description</label>
                  <textarea
                    rows={4}
                    value={permissionForm.description}
                    onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                    className="wwp-input resize-none"
                    placeholder="ระบุรายละเอียดของกลุ่มสิทธิ์นี้..."
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-gray-400">
                    กำหนดสิทธิ์การเข้าถึงโมดูล / Module Access
                  </span>
                  <div className="flex gap-2">
                    {['viewer', 'editor', 'all'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          const newPermissions = { ...permissionForm.permissions }
                          MODULES.forEach((m) => (newPermissions[m.id] = level as PermissionLevel))
                          setPermissionForm({ ...permissionForm, permissions: newPermissions })
                        }}
                        className="text-[10px] font-bold text-primary-blue hover:underline uppercase tracking-tighter">
                        Set All {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-border-subtle dark:border-white/5 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-white/2">
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-white/5 sticky top-0 z-10">
                        <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-text-muted">
                          <th className="px-5 py-3">โมดูล / Module</th>
                          <th className="px-5 py-3 text-center">Viewer</th>
                          <th className="px-5 py-3 text-center">Editor</th>
                          <th className="px-5 py-3 text-center">Full Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle dark:divide-white/5">
                        {MODULES.map((module) => (
                          <tr key={module.id} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 flex items-center gap-3">
                              <module.icon className="w-4 h-4 text-text-muted" />
                              <span className="font-bold text-text-main dark:text-white">{module.name}</span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <input
                                type="radio"
                                name={`perm-${module.id}`}
                                checked={permissionForm.permissions[module.id] === 'viewer'}
                                onChange={() => setPermissionForm({
                                  ...permissionForm,
                                  permissions: { ...permissionForm.permissions, [module.id]: 'viewer' }
                                })}
                                className="w-4 h-4 accent-primary-blue"
                              />
                            </td>
                            <td className="px-5 py-4 text-center">
                              <input
                                type="radio"
                                name={`perm-${module.id}`}
                                checked={permissionForm.permissions[module.id] === 'editor'}
                                onChange={() => setPermissionForm({
                                  ...permissionForm,
                                  permissions: { ...permissionForm.permissions, [module.id]: 'editor' }
                                })}
                                className="w-4 h-4 accent-primary-blue"
                              />
                            </td>
                            <td className="px-5 py-4 text-center">
                              <input
                                type="radio"
                                name={`perm-${module.id}`}
                                checked={permissionForm.permissions[module.id] === 'all'}
                                onChange={() => setPermissionForm({
                                  ...permissionForm,
                                  permissions: { ...permissionForm.permissions, [module.id]: 'all' }
                                })}
                                className="w-4 h-4 accent-primary-blue"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setPermissionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                ยกเลิก / Cancel
              </button>
              <button
                type="button"
                onClick={submitPermissionForm}
                className="wwp-button-primary shadow-lg shadow-primary-blue/20">
                <Save className="w-4 h-4 mr-2" />
                {editingPermission ? 'บันทึกสิทธิ์ / Save' : 'สร้างสิทธิ์ / Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
