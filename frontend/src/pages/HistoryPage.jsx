import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchQuotes()
  }, [user, navigate])

  const fetchQuotes = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiClient.get('/quotes/my-quotes')
      console.log('Quotes response:', response.data)
      setQuotes(response.data.data || [])
    } catch (err) {
      console.error('Error fetching quotes:', err)
      setError(err.response?.data?.message || 'Failed to fetch quotes')
    } finally {
      setLoading(false)
    }
  }

 const downloadPDF = async (quoteId) => {
  try {
    console.log('Downloading quote:', quoteId)
    
    // Make request to download endpoint with auth token
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/quotes/${quoteId}/download`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      }
    )
    
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers.get('content-type'))
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to download PDF')
    }
    
    // Check if response is PDF
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('Server did not return a PDF file')
    }
    
    // Get the PDF blob
    const blob = await response.blob()
    console.log('PDF blob size:', blob.size)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quote_${quoteId}.pdf`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('✓ PDF downloaded successfully')
    
  } catch (error) {
    console.error('Download error:', error)
    alert(`Failed to download PDF: ${error.message}`)
  }
}


  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Quote History</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading quotes...</p>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No quotes yet</p>
            <button
              onClick={() => navigate('/quote')}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded"
            >
              Create Your First Quote
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">From</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Weight</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {quote.origin_city}, {quote.origin_country}
                    </td>
                    <td className="px-6 py-4">
                      {quote.destination_city}, {quote.destination_country}
                    </td>
                    <td className="px-6 py-4">{quote.weight} kg</td>
                    <td className="px-6 py-4 font-semibold">
                      ${quote.total_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          quote.quote_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : quote.quote_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {quote.quote_status.charAt(0).toUpperCase() +
                          quote.quote_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
  onClick={() => downloadPDF(quote._id)}  // ← Changed from quote.pdf_path
  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
  disabled={quote.quote_status !== 'approved'}
>
  Download
</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
