import axios from 'axios'

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
})

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Log errors for debugging
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message)
    return Promise.reject(error)
  }
)

export default apiClient
