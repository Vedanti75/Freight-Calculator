import { create } from 'zustand'
import apiClient from '../api/client'

export const useAuthStore = create((set) => ({
  // State
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  error: null,

  // ===== AUTHENTICATION METHODS =====

  // Google OAuth Login/Register
  loginWithGoogle: async (googleToken) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/google', { token: googleToken })
      const { user, token } = response.data.data
      
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      set({ user, token, isLoading: false })
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Google login failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  // Email/Password Registration
  register: async (name, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password
      })
      const { user, token } = response.data.data
      
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      set({ user, token, isLoading: false })
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  // Email/Password Login
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user, token } = response.data.data
      
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      set({ user, token, isLoading: false })
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  // ===== USER MANAGEMENT =====

  // Update User Profile
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put('/auth/profile', profileData)
      const updatedUser = response.data.data
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      set({ user: updatedUser, isLoading: false })
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  // Verify Token & Check Auth Status
  checkAuth: async () => {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      set({ user: null, token: null })
      return false
    }

    try {
      await apiClient.get('/auth/verify')
      return true
    } catch (error) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      set({ user: null, token: null })
      return false
    }
  },

  // ===== STATE MANAGEMENT =====

  // Manual Setters (for direct state updates)
  setUser: (user) => set({ user }),
  setAuthToken: (token) => set({ token }),

  // Logout - Clear all auth data
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    set({ user: null, token: null, error: null })
  },

  // Clear Error Message
  clearError: () => set({ error: null }),

  // Set Loading State
  setLoading: (isLoading) => set({ isLoading })
}))
