import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import RateManager from '../components/RateManager'

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('quotes')
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/quote')
    } else {
      if (activeTab === 'quotes') {
        fetchAllQuotes()
      }
    }
  }, [activeTab, user, navigate])

  const fetchAllQuotes = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/quotes/all')
      setQuotes(response.data.data)
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuoteStatus = async (quoteId, newStatus) => {
    try {
      await apiClient.patch(`/quotes/${quoteId}/status`, { status: newStatus })
      fetchAllQuotes()
    } catch (error) {
      console.error('Failed to update quote status:', error)
      alert('Failed to update status')
    }
  }

  const deleteQuote = async (quoteId) => {
  if (window.confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
    try {
      const response = await apiClient.delete(`/quotes/${quoteId}`)
      
      if (response.data.success) {
        fetchAllQuotes()
        alert('Quote deleted successfully')
      }
    } catch (error) {
      console.error('Delete error:', error.response?.data || error)
      alert(error.response?.data?.message || 'Failed to delete quote')
    }
  }
}


  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'quotes'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Quotes
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'rates'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Base Rates
          </button>
        </div>

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div>
            {loading ? (
              <p>Loading quotes...</p>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Route</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote) => (
                      <tr key={quote._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{quote.user_id?.name || 'Guest'}</td>
                        <td className="px-6 py-4">
                          {quote.origin_country} → {quote.destination_country}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          ${quote.total_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={quote.quote_status}
                            onChange={(e) =>
                              updateQuoteStatus(quote._id, e.target.value)
                            }
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 space-x-2 text-sm">
                          <button
                            onClick={() => deleteQuote(quote._id)}
                            className="text-red-500 hover:text-red-600 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Rates Tab */}
        {activeTab === 'rates' && <RateManager />}
      </div>
    </div>
  )
}
