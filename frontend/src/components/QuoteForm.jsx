import { useState, useEffect } from 'react'
import apiClient from '../api/client'

export default function QuoteForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    origin_country: '',
    origin_city: '',
    destination_country: '',
    destination_city: '',
    weight: '',
    volume: '',
    mode_of_transport: 'road',
    delivery_type: 'standard',
    shipment_date: '',
    special_services: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Set default date to 2 days from today
  useEffect(() => {
    const today = new Date()
    const twoDaysLater = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    const defaultDate = twoDaysLater.toISOString().split('T')[0]
    
    setFormData((prev) => ({
      ...prev,
      shipment_date: defaultDate
    }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    // ✅ CORRECT: Direct API call
    const response = await apiClient.post('/quotes', formData)
    
    if (response.data.success) {
      onSuccess(response.data.data)
    }
  } catch (err) {
    console.error('Quote generation error:', err)
    setError(err.response?.data?.message || 'Failed to generate quote')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Request a Quote</h2>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Origin */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Origin Country *</label>
            <input type="text" name="origin_country" value={formData.origin_country} onChange={handleChange} required className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500" placeholder="USA" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Origin City *</label>
            <input type="text" name="origin_city" value={formData.origin_city} onChange={handleChange} required className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500" placeholder="New York" />
          </div>
        </div>

        {/* Destination */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Destination Country *</label>
            <input type="text" name="destination_country" value={formData.destination_country} onChange={handleChange} required className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500" placeholder="India" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Destination City *</label>
            <input type="text" name="destination_city" value={formData.destination_city} onChange={handleChange} required className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500" placeholder="Mumbai" />
          </div>
        </div>

        {/* Weight & Volume */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg) *</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} required min="0.1" step="0.1" className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500" placeholder="100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Volume (m³)</label>
            <input type="number" name="volume" value={formData.volume} onChange={handleChange} min="0" step="0.01" className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500" placeholder="2.5" />
          </div>
        </div>

        {/* Mode & Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Transport *</label>
            <select name="mode_of_transport" value={formData.mode_of_transport} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500">
              <option value="road">Road</option>
              <option value="air">Air</option>
              <option value="sea">Sea</option>
              <option value="rail">Rail</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Delivery *</label>
            <select name="delivery_type" value={formData.delivery_type} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500">
              <option value="standard">Standard</option>
              <option value="urgent">Urgent (+20%)</option>
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Shipment Date *</label>
          <input type="date" name="shipment_date" value={formData.shipment_date} onChange={handleChange} required className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500" />
        </div>

        {/* Special Services */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Special Services</label>
          <textarea name="special_services" value={formData.special_services} onChange={handleChange} rows="2" className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500" placeholder="Insurance, Fragile, etc." />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-2 rounded-lg transition text-sm">
          {loading ? 'Generating...' : 'Get Quote'}
        </button>
      </form>
    </div>
  )
}
