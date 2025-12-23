import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { GoogleLogin } from '@react-oauth/google'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'

export default function Login() {
  const navigate = useNavigate()
  const { loginWithGoogle, register } = useAuthStore()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await apiClient.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })
      
      if (response.data.success) {
        const { user, token } = response.data.data
const { setUser, setAuthToken } = useAuthStore.getState()
localStorage.setItem('authToken', token)
localStorage.setItem('user', JSON.stringify(user))
setUser(user)
setAuthToken(token)
navigate('/quotes')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Email/Password Signup
  const handleEmailSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      
      if (response.data.success) {
        const { user, token } = response.data.data
const { setUser, setAuthToken } = useAuthStore.getState()
localStorage.setItem('authToken', token)
localStorage.setItem('user', JSON.stringify(user))
setUser(user)
setAuthToken(token)
navigate('/quotes')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    setError('')
    
    try {
      const googleToken = credentialResponse.credential
      
      // Send to backend
      const response = await apiClient.post('/auth/google', {
        token: googleToken
      })
      
      if (response.data.success) {
        const { user, token } = response.data.data
const { setUser, setAuthToken } = useAuthStore.getState()
localStorage.setItem('authToken', token)
localStorage.setItem('user', JSON.stringify(user))
setUser(user)
setAuthToken(token)
navigate('/quotes')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed')
      console.error('Google login error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth Error
  const handleGoogleError = () => {
    setError('Google login failed. Please try again.')
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          {/* Header */}
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSignUp 
                ? 'Already have an account? ' 
                : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setFormData({ email: '', password: '', confirmPassword: '', name: '' })
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Google OAuth Button */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text={isSignUp ? 'signup_with' : 'signin_with'}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className="mt-8 space-y-6" onSubmit={isSignUp ? handleEmailSignUp : handleEmailLogin}>
            {/* Name Field (Only for SignUp) */}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
              )}
            </div>

            {/* Confirm Password Field (Only for SignUp) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
