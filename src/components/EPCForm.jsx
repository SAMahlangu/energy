import React, { useState } from 'react'
import axios from 'axios'
import '../styles/EPCAnalysisForm.css'

function EPCForm({ onAnalysis }) {
  const [formData, setFormData] = useState({
    baseline_energy: 300000000,
    efficiency_improvement: 10,
    tariff: 2.45,
    emission_factor: 0.71,
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
      const response = await axios.post('http://13.49.72.166/api/epc-analysis', {
        baseline_energy: formData.baseline_energy,
        efficiency_improvement: formData.efficiency_improvement,
        tariff: formData.tariff,
        emission_factor: formData.emission_factor,
      })

      onAnalysis({
        energy_saved: response.data.energy_saved,
        cost_savings: response.data.cost_savings,
        co2_avoided: response.data.co2_avoided,
        interpretation: response.data.interpretation,
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Error during analysis. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRandomize = () => {
    const randomBaselineRaw = Math.random() * 450000000 + 50000000
    const baseline_energy = Math.round(randomBaselineRaw / 1000000) * 1000000 // align with step=1,000,000

    const efficiency_improvement = Math.random() * 25 + 5

    const randomTariffRaw = Math.random() * 1.7 + 1.8
    const tariff = parseFloat(randomTariffRaw.toFixed(2)) // align with step=0.01

    const randomEmissionRaw = Math.random() * 0.3 + 0.6
    const emission_factor = parseFloat(randomEmissionRaw.toFixed(2)) // align with step=0.01

    setFormData({
      baseline_energy,
      efficiency_improvement,
      tariff,
      emission_factor,
    })
    setError('')
  }

  return (
    <div className="epc-form">
      <h2>🏢 EPC Scenario Impact Analyzer</h2>
      <p className="form-description">
        Simulate how EPC efficiency improvements affect energy, cost, and emissions.
      </p>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Energy Baseline Section */}
        <div className="form-section">
          <h3>⚡ Energy Baseline & Efficiency</h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                Baseline Energy Consumption (kWh)
                <span className="input-value">{formData.baseline_energy.toLocaleString()}</span>
              </label>
              <input
                type="number"
                name="baseline_energy"
                value={formData.baseline_energy}
                onChange={handleInputChange}
                min="1000000"
                step="1000000"
              />
            </div>
            <div className="form-group">
              <label>
                Efficiency Improvement (%)
                <span className="input-value">{formData.efficiency_improvement.toFixed(1)}%</span>
              </label>
              <input
                type="range"
                name="efficiency_improvement"
                min="1"
                max="40"
                step="0.5"
                value={formData.efficiency_improvement}
                onChange={(e) => handleSliderChange('efficiency_improvement', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Economics & Environmental Section */}
        <div className="form-section">
          <h3>💰 Economics & Environmental Impact</h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                Electricity Tariff (R/kWh)
                <span className="input-value">R{formData.tariff.toFixed(2)}</span>
              </label>
              <input
                type="number"
                name="tariff"
                value={formData.tariff}
                onChange={handleInputChange}
                min="1"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>
                CO₂ Emission Factor (kg/kWh)
                <span className="input-value">{formData.emission_factor.toFixed(2)}</span>
              </label>
              <input
                type="number"
                name="emission_factor"
                value={formData.emission_factor}
                onChange={handleInputChange}
                min="0.1"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Analyzing...' : '▶ Run Analysis'}
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
      </form>
    </div>
  )
}

export default EPCForm
