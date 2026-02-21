import React, { useState } from 'react'
import axios from 'axios'
import '../styles/EnergyEfficiencyForm.css'

function EnergyEfficiencyForm({ onPrediction }) {
  const [formData, setFormData] = useState({
    floor_area: 1200,
    year_built: 2005,
    no_floors: 3,
    epc_rating: 4,
    insulation_level: 0.6,
    hvac_efficiency: 0.7,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }))
    setError('')
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
      const response = await axios.post('https://13.51.130.19/api/energy-efficiency', {
        floor_area: formData.floor_area,
        year_built: formData.year_built,
        no_floors: formData.no_floors,
        epc_rating: formData.epc_rating,
        insulation_level: formData.insulation_level,
        hvac_efficiency: formData.hvac_efficiency,
      })

      onPrediction({
        baseline_energy: response.data.baseline_energy,
        improved_energy: response.data.improved_energy,
        energy_saved: response.data.energy_saved,
        cost_saved: response.data.cost_saved,
        carbon_saved: response.data.carbon_saved,
        interpretation: response.data.interpretation,
        epc_levels: response.data.epc_levels,
        predictions: response.data.predictions,
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Error during prediction. Please try again.')
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRandomize = () => {
    setFormData({
      floor_area: Math.floor(Math.random() * 4500) + 500,
      year_built: Math.floor(Math.random() * 63) + 1960,
      no_floors: Math.floor(Math.random() * 10) + 1,
      epc_rating: Math.floor(Math.random() * 7) + 1,
      insulation_level: Math.random() * 0.7 + 0.3,
      hvac_efficiency: Math.random() * 0.6 + 0.4,
    })
    setError('')
  }

  return (
    <div className="energy-efficiency-form">
      <h2>🏛️ Energy Efficiency Rating Prediction</h2>
      <p className="form-description">
        Predict building energy intensity and analyze efficiency improvements based on EPC ratings.
      </p>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        {/* Building Information Section */}
        <div className="form-section">
          <h3>🏢 Building Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                Floor Area (m²)
                <span className="input-value">{formData.floor_area.toLocaleString()}</span>
              </label>
              <input
                type="range"
                name="floor_area"
                min="100"
                max="5000"
                step="50"
                value={formData.floor_area}
                onChange={(e) => handleSliderChange('floor_area', parseFloat(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Year Built
                <span className="input-value">{formData.year_built}</span>
              </label>
              <input
                type="range"
                name="year_built"
                min="1960"
                max="2023"
                step="1"
                value={formData.year_built}
                onChange={(e) => handleSliderChange('year_built', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Number of Floors
                <span className="input-value">{formData.no_floors}</span>
              </label>
              <input
                type="range"
                name="no_floors"
                min="1"
                max="15"
                step="1"
                value={formData.no_floors}
                onChange={(e) => handleSliderChange('no_floors', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                EPC Rating (1 = Best)
                <span className="input-value">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'][formData.epc_rating - 1]}
                </span>
              </label>
              <input
                type="range"
                name="epc_rating"
                min="1"
                max="7"
                step="1"
                value={formData.epc_rating}
                onChange={(e) => handleSliderChange('epc_rating', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Energy Performance Section */}
        <div className="form-section">
          <h3>⚡ Performance & Efficiency</h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                Insulation Level
                <span className="input-value">{(formData.insulation_level * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                name="insulation_level"
                min="0"
                max="1"
                step="0.05"
                value={formData.insulation_level}
                onChange={(e) => handleSliderChange('insulation_level', parseFloat(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                HVAC Efficiency
                <span className="input-value">{(formData.hvac_efficiency * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                name="hvac_efficiency"
                min="0"
                max="1"
                step="0.05"
                value={formData.hvac_efficiency}
                onChange={(e) => handleSliderChange('hvac_efficiency', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '⏳ Predicting...' : '▶ Predict Energy Performance'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleRandomize}
          disabled={loading}
        >
          🎲 Randomize Inputs
        </button>
      </div>
    </div>
  )
}

export default EnergyEfficiencyForm
