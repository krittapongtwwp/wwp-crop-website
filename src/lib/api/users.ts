import { fetchApi } from '@/lib/api'

// ===== Types — สะท้อน shape ที่ backend ส่งมาเป๊ะๆ =====
export type UserRole = 'admin' | 'editor' | 'viewer'

export interface ApiUser {
  id: number
  email: string
  name: string | null // backend ใช้ nullable
  role: UserRole
}

// Body shapes
export interface CreateUserPayload {
  email: string
  password: string
  name: string | null
  role: UserRole
}

// password เป็น optional ตอน update (ไม่ส่งถ้าไม่เปลี่ยน)
export interface UpdateUserPayload {
  email: string
  password?: string
  name: string | null
  role: UserRole
}

// ===== Service functions =====
export const usersApi = {
  list: (): Promise<ApiUser[]> => fetchApi('/user'),

  get: (id: number): Promise<ApiUser> => fetchApi(`/user/${id}`),

  create: (payload: CreateUserPayload): Promise<{ success: boolean; id: number }> =>
    fetchApi('/user', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  update: (id: number, payload: UpdateUserPayload): Promise<{ success: boolean; id: number }> =>
    fetchApi(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  remove: (id: number): Promise<{ success: boolean }> => fetchApi(`/user/${id}`, { method: 'DELETE' })
}

// ===== Error mapping — แปลง error code จาก backend เป็นข้อความผู้ใช้ =====
export function getUserErrorMessage(err: unknown): string {
  const code = (err as any)?.message || ''
  switch (code) {
    case 'CANNOT_DELETE_SELF':
      return 'ไม่สามารถลบบัญชีของตัวเองได้ / Cannot delete your own account'
    case 'USER_NOT_FOUND':
      return 'ไม่พบผู้ใช้งานนี้ / User not found'
    case 'EMAIL_ALREADY_EXISTS':
      return 'อีเมลนี้ถูกใช้งานแล้ว / Email already exists'
    case 'CREATE_USER_ERROR':
    case 'UPDATE_USER_ERROR':
    case 'DELETE_USER_ERROR':
    case 'GET_USER_ERROR':
      return 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ / Server error'
    default:
      return code || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ / Unknown error'
  }
}
