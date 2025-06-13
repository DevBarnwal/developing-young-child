import axios from 'axios'

// Set base URL
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL

// Request interceptor
axios.interceptors.request.use(
  config => {
    // Get token from cookie for each request
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
    const token = tokenCookie ? tokenCookie.split('=')[1] : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Clear invalid tokens
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      delete axios.defaults.headers.common['Authorization']

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      error.message = error.response.data.message
    }

    return Promise.reject(error)
  }
)

export default axios
