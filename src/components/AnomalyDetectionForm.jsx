import React, { useState } from 'react'
import axios from 'axios'
import '../styles/AnomalyDetectionForm.css'

function AnomalyDetectionForm({ onDetect }) {
  const [formData, setFormData] = useState({
    energy_per_m2: 80,
    fuel_intensity: 30,
    electricity_intensity: 120,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Only update if value is empty or a valid number
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: 0
      }))
      setError('')
      return
    }

    const numValue = parseFloat(value)
    
    // Check if it's a valid number
    if (!isNaN(numValue) && isFinite(numValue)) {
      // Define min/max for each field
      const limits = {
        energy_per_m2: { min: 0, max: 300 },
        fuel_intensity: { min: 0, max: 150 },
        electricity_intensity: { min: 0, max: 400 }
      }
      
      const limit = limits[name] || { min: 0, max: 1000 }
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
      const response = await axios.post('http://13.49.72.166/api/anomaly-detect', {
        energy_per_m2: parseFloat(formData.energy_per_m2),
        fuel_intensity: parseFloat(formData.fuel_intensity),
        electricity_intensity: parseFloat(formData.electricity_intensity),
      })

      onDetect(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error during anomaly detection. Please try again.')
      console.error('Anomaly detection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRandomize = () => {
    setFormData({
      energy_per_m2: Math.random() * 200 + 20,
      fuel_intensity: Math.random() * 80 + 10,
      electricity_intensity: Math.random() * 250 + 50,
    })
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="ad-form-container">
      <h2>🔍 Energy Anomaly Detector</h2>
      <p className="form-description">
        Enter building energy metrics to detect unusual consumption patterns using machine learning models.
      </p>

      {error && <div className="form-error">{error}</div>}

      {/* Feature Input Section */}
      <div className="form-section">
        <h3>📊 Energy Metrics</h3>
        
        <div className="form-group">
          <label>Energy per m² (kWh/m²)</label>
          <div className="input-with-slider">
            <input
              type="number"
              name="energy_per_m2"
              value={Number(formData.energy_per_m2).toFixed(1)}
              onChange={handleInputChange}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (isNaN(val)) {
                  setFormData(prev => ({ ...prev, energy_per_m2: 0 }))
                }
              }}
              min="0"
              max="300"
              step="0.1"
              inputMode="decimal"
            />
            <input
              type="range"
              name="energy_per_m2"
              min="0"
              max="300"
              step="0.1"
              value={formData.energy_per_m2}
              onChange={(e) => handleSliderChange('energy_per_m2', parseFloat(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{Number(formData.energy_per_m2).toFixed(1)}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Fuel Intensity (kWh/m²)</label>
          <div className="input-with-slider">
            <input
              type="number"
              name="fuel_intensity"
              value={Number(formData.fuel_intensity).toFixed(1)}
              onChange={handleInputChange}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (isNaN(val)) {
                  setFormData(prev => ({ ...prev, fuel_intensity: 0 }))
                }
              }}
              min="0"
              max="150"
              step="0.1"
              inputMode="decimal"
            />
            <input
              type="range"
              name="fuel_intensity"
              min="0"
              max="150"
              step="0.1"
              value={formData.fuel_intensity}
              onChange={(e) => handleSliderChange('fuel_intensity', parseFloat(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{Number(formData.fuel_intensity).toFixed(1)}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Electricity Intensity (kWh/m²)</label>
          <div className="input-with-slider">
            <input
              type="number"
              name="electricity_intensity"
              value={Number(formData.electricity_intensity).toFixed(1)}
              onChange={handleInputChange}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (isNaN(val)) {
                  setFormData(prev => ({ ...prev, electricity_intensity: 0 }))
                }
              }}
              min="0"
              max="400"
              step="0.1"
              inputMode="decimal"
            />
            <input
              type="range"
              name="electricity_intensity"
              min="0"
              max="400"
              step="0.1"
              value={formData.electricity_intensity}
              onChange={(e) => handleSliderChange('electricity_intensity', parseFloat(e.target.value))}
              className="slider"
            />
            <span className="slider-value">{Number(formData.electricity_intensity).toFixed(1)}</span>
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
          {loading ? '🔄 Analyzing...' : '🚀 Detect Anomaly'}
        </button>
        <button 
          type="button"
          onClick={handleRandomize}
          className="randomize-btn"
          disabled={loading}
        >
          🎲 Randomize
        </button>
      </div>

      <div className="form-hints">
        <p><strong>💡 Hints:</strong></p>
        <ul>
          <li>Typical energy_per_m²: 50-150 kWh/m²</li>
          <li>Typical fuel_intensity: 10-60 kWh/m²</li>
          <li>Typical electricity_intensity: 80-200 kWh/m²</li>
        </ul>
      </div>
    </form>
  )
}

export default AnomalyDetectionForm
