import React, { useState } from 'react'
import axios from 'axios'
import '../styles/RenewableEnergyForm.css'

function RenewableEnergyForm({ onAnalyze }) {
  const [formData, setFormData] = useState({
    size: 500,
    total_energy_consumption: 50000,
    grid_usage: 40000,
    renewable_usage: 5000,
    province: 'gauteng',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const provinces = [
    'gauteng', 'western cape', 'kwazulu-natal', 'limpopo',
    'mpumalanga', 'free state', 'north west', 'eastern cape', 'northern cape'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: 0
      }))
      setError('')
      return
    }

    if (name === 'province') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      setError('')
      return
    }

    const numValue = parseFloat(value)
    
    if (!isNaN(numValue) && isFinite(numValue)) {
      const limits = {
        size: { min: 10, max: 100000 },
        total_energy_consumption: { min: 0, max: 5000000 },
        grid_usage: { min: 0, max: 5000000 },
        renewable_usage: { min: 0, max: 5000000 }
      }
      
      const limit = limits[name] || { min: 0, max: 1000000 }
      const constrainedValue = Math.max(limit.min, Math.min(limit.max, numValue))
      
      setFormData(prev => ({
        ...prev,
        [name]: constrainedValue
      }))
      setError('')
    }
  }

  const handleSliderChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:5000/api/renewable-energy-potential', {
        size: parseFloat(formData.size),
        total_energy_consumption: parseFloat(formData.total_energy_consumption),
        grid_usage: parseFloat(formData.grid_usage),
        renewable_usage: parseFloat(formData.renewable_usage),
        province: formData.province,
      })

      onAnalyze(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error during analysis. Please try again.')
      console.error('Renewable energy analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRandomize = () => {
    setFormData({
      size: Math.floor(Math.random() * 5000) + 200,
      total_energy_consumption: Math.floor(Math.random() * 200000) + 20000,
      grid_usage: Math.floor(Math.random() * 150000) + 15000,
      renewable_usage: Math.floor(Math.random() * 10000) + 1000,
      province: provinces[Math.floor(Math.random() * provinces.length)],
    })
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="re-form-container">
      <h2>☀️ Renewable Energy Adoption Analyzer</h2>
      <p className="form-description">
        Analyze your building's potential for solar energy adoption and calculate financial viability.
      </p>

      {error && <div className="form-error">{error}</div>}

      {/* Building Information Section */}
      <div className="form-section">
        <h3>🏢 Building Information</h3>
        
        <div className="form-group">
          <label>Building Size (m²)</label>
          <div className="input-with-slider">
            <input
              type="number"
              name="size"
              value={Number(formData.size).toFixed(1)}
              onChange={handleInputChange}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (isNaN(val)) setFormData(prev => ({ ...prev, size: 0 }))
              }}
              min="10"
              max="100000"
              step="1"
              inputMode="decimal"
            />
            <input
              type="range"
              name="size"
              min="10"
              max="10000"
              step="10"
              value={formData.size}
              onChange={(e) => handleSliderChange('size', parseFloat(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{Number(formData.size).toFixed(1)} m²</span>
          </div>
        </div>

        <div className="form-group">
          <label>Province</label>
          <select
            name="province"
            value={formData.province}
            onChange={handleInputChange}
            className="province-select"
          >
            {provinces.map(prov => (
              <option key={prov} value={prov}>
                {prov.charAt(0).toUpperCase() + prov.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Energy Consumption Section */}
      <div className="form-section">
        <h3>⚡ Energy Consumption (Annual)</h3>
        
        <div className="form-group">
          <label>Total Energy Consumption (kWh/year)</label>
          <div className="input-with-slider">
            <input
              type="number"
              name="total_energy_consumption"
              value={Number(formData.total_energy_consumption).toFixed(1)}
              onChange={handleInputChange}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (isNaN(val)) setFormData(prev => ({ ...prev, total_energy_consumption: 0 }))
              }}
              min="0"
              max="5000000"
              step="1"
              inputMode="decimal"
            />
            <input
              type="range"
              name="total_energy_consumption"
              min="0"
              max="500000"
              step="5000"
              value={formData.total_energy_consumption}
              onChange={(e) => handleSliderChange('total_energy_consumption', parseFloat(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{(Number(formData.total_energy_consumption) / 1000).toFixed(0)}k</span>
          </div>
        </div>

        <div className="form-group">
          <label>Grid Usage (kWh/year)</label>
          <div className="input-with-slider">
            <input
              type="number"
              name="grid_usage"
              value={Number(formData.grid_usage).toFixed(1)}
              onChange={handleInputChange}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (isNaN(val)) setFormData(prev => ({ ...prev, grid_usage: 0 }))
              }}
              min="0"
              max="5000000"
              step="1"
              inputMode="decimal"
            />
            <input
              type="range"
              name="grid_usage"
              min="0"
              max="500000"
              step="5000"
              value={formData.grid_usage}
              onChange={(e) => handleSliderChange('grid_usage', parseFloat(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{(Number(formData.grid_usage) / 1000).toFixed(0)}k</span>
          </div>
        </div>

        <div className="form-group">
          <label>Current Renewable Usage (kWh/year)</label>
          <div className="input-with-slider">
            <input
              type="number"
              name="renewable_usage"
              value={Number(formData.renewable_usage).toFixed(1)}
              onChange={handleInputChange}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (isNaN(val)) setFormData(prev => ({ ...prev, renewable_usage: 0 }))
              }}
              min="0"
              max="5000000"
              step="1"
              inputMode="decimal"
            />
            <input
              type="range"
              name="renewable_usage"
              min="0"
              max="500000"
              step="5000"
              value={formData.renewable_usage}
              onChange={(e) => handleSliderChange('renewable_usage', parseFloat(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{(Number(formData.renewable_usage) / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? '🔄 Analyzing...' : '🚀 Analyze Potential'}
        </button>
        <button 
          type="button"
          onClick={handleRandomize}
          className="randomize-btn"
          disabled={loading}
        >
          🎲 Sample Data
        </button>
      </div>
    </form>
  )
}

export default RenewableEnergyForm
