import axios, { AxiosResponse } from 'axios'

// Configure axios base URL and interceptors
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response: AxiosResponse = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    const response: AxiosResponse = await api.post('/auth/register', userData)
    return response.data
  },

  getProfile: async () => {
    const response: AxiosResponse = await api.get('/auth/profile')
    return response.data.data
  },
}

// Mail API
export const mailApi = {
  getInbox: async () => {
    const response: AxiosResponse = await api.get('/mail/inbox')
    return response.data.data
  },

  getMessage: async (messageId: string) => {
    const response: AxiosResponse = await api.get(`/mail/${messageId}`)
    return response.data.data
  },

  sendMail: async (mailData: { to: string | string[]; subject: string; body: string }) => {
    const response: AxiosResponse = await api.post('/mail/send', mailData)
    return response.data
  },

  replyToMail: async (messageId: string, replyData: { body: string; replyAll?: boolean }) => {
    const response: AxiosResponse = await api.post(`/mail/${messageId}/reply`, replyData)
    return response.data
  },

  forwardMail: async (messageId: string, forwardData: { to: string[]; body?: string; subject?: string }) => {
    const response: AxiosResponse = await api.post(`/mail/${messageId}/forward`, forwardData)
    return response.data
  },

  deleteMail: async (messageId: string) => {
    const response: AxiosResponse = await api.delete(`/mail/${messageId}`)
    return response.data
  },
}

// Admin API
export const adminApi = {
  getQuarantined: async () => {
    const response: AxiosResponse = await api.get('/admin/quarantined')
    return response.data.data
  },

  allowMessage: async (messageId: string) => {
    const response: AxiosResponse = await api.post(`/admin/allow/${messageId}`)
    return response.data
  },

  blockMessage: async (messageId: string) => {
    const response: AxiosResponse = await api.post(`/admin/block/${messageId}`)
    return response.data
  },
}

export default api
