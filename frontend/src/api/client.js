import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
const api = axios.create({ baseURL: API_URL ? `${API_URL}/api` : '/api' })

export const TOKEN_KEY = 'ems_token'

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => {
    // Backend na mile toh host index.html bhej deta hai
    if (typeof res.data === 'string' && res.data.trimStart().startsWith('<')) {
      return Promise.reject({ response: { data: { message: 'Server is not reachable. Please try again later.' } } })
    }
    return res
  },
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const getErrorMessage = (err) => {
  const data = err.response?.data
  if (data?.errors) return Object.values(data.errors).join(', ')
  if (data?.message) return data.message
  // Network error, ya backend ki jagah koi HTML/404 page mila
  if (!err.response || typeof data !== 'object') return 'Server is not reachable. Please try again later.'
  return 'Something went wrong'
}

export const downloadFile = async (url, fallbackName) => {
  const res = await api.get(url, { responseType: 'blob' })
  const disposition = res.headers['content-disposition'] || ''
  const name = disposition.match(/filename="?([^"]+)"?/)?.[1] || fallbackName
  const href = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = href
  a.download = name
  a.click()
  URL.revokeObjectURL(href)
}

export default api
