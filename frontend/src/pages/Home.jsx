import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <div>
      {user && <Navbar />}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-5xl font-bold">F</span>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Freight Quotation Tool
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Get instant freight quotes for international shipments in seconds. Our intelligent
            pricing engine calculates the best rates for your cargo based on origin, destination,
            weight, and transport mode.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Quotes</h3>
              <p className="text-sm text-gray-600">Get pricing in seconds</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-sm text-gray-600">International routes</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-sm text-gray-600">No hidden charges</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/quote')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition shadow-lg hover:shadow-xl"
          >
            Generate Quote Now →
          </button>

          {!user && (
            <p className="mt-8 text-gray-600">
              Want to save quotes?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-red-500 hover:text-red-600 font-semibold"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
