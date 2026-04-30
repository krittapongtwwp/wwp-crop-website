// const API_URL = '/api';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_URL = `${BASE_URL}/api`

function getAuthHeaders() {
  const token = localStorage.getItem('weadmin_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>)
  }

  // If body is FormData, let the browser set the Content-Type with the correct boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const url = `${API_URL}${endpoint}`
  console.log(`Fetching: ${url}`)

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('weadmin_token')
        window.location.href = '/weadmin/login'
      }
      const rawText = await response.text()
      if (response.status !== 404) {
        console.error(`API_ERROR_RAW: ${rawText}`)
      }
      let errorData = { error: 'API request failed' }
      try {
        errorData = JSON.parse(rawText)
      } catch (e) {}

      const error = new Error(errorData.error || 'API request failed')
      ;(error as any).status = response.status
      throw error
    }

    return response.json()
  } catch (error: any) {
    if (error.status !== 404) {
      console.error(`Fetch error for ${url}:`, error)
    }
    throw error
  }
}

export async function uploadMedia(file: File, altText?: string, folder?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (altText) formData.append('alt_text', altText)
  if (folder) formData.append('folder', folder)

  const token = localStorage.getItem('weadmin_token')

  const response = await fetch(`${API_URL}/media/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Upload failed')
  }

  return response.json()
}
