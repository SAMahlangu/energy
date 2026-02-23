import React, { useState } from 'react'
import axios from 'axios'
import '../styles/PredictionForm.css'

const BEST_MODEL_NAME = 'LinearRegression'

const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
]

const CITIES = [
  'Foreshore, Cape Town',
  'Johannesburg',
  'Durban',
  'Bloemfontein',
]

const OCCUPANCY_TYPES = ['E1', 'E2', 'E3', 'E4', 'E5']
const ENTITY_TYPES = ['Private', 'Public']
const OWNERSHIP_TYPES = ['Owned', 'Rented', 'Owner-Occupied']

function PredictionForm({ onPredict }) {
  const [formData, setFormData] = useState({
    size_m2: 1500,
    floors: 10,
    grid_kwh: 120000,
    gas_kwh: 50000,
    renewable_kwh: 10000,
    province: 'Dublin',
    city: 'Dublin City',
    occupancy_type: 'Commercial',
    entity_type: 'Private',
    ownership_type: 'Owner-Occupied',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value)
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Prepare features array in correct order for the ML model
      const features = [
        formData.size_m2,
        formData.floors,
        formData.grid_kwh,
        formData.gas_kwh,
        formData.renewable_kwh,
        // Additional features can be added here based on the notebook's feature engineering
      ]

      // Make prediction request directly to Flask backend
      // (keep URL consistent with other features)
      const response = await axios.post('http://13.51.164.20/api/predict', {
        features: features,
        model: 'all'
      })

      // Pass results to parent component
      if (onPredict) {
        onPredict({
          predictions: response.data.predictions,
          formData: formData
        })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get prediction. Make sure Flask backend is running.')
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRandomize = () => {
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

    setFormData({
      // match notebook ranges from randomize_inputs()
      size_m2: Math.floor(Math.random() * (8000 - 300 + 1)) + 300,
      floors: Math.floor(Math.random() * (25 - 1 + 1)) + 1,
      grid_kwh: Math.floor(Math.random() * (250000 - 10000 + 1)) + 10000,
      gas_kwh: Math.floor(Math.random() * (150000 - 0 + 1)) + 0,
      renewable_kwh: Math.floor(Math.random() * (100000 - 0 + 1)) + 0,
      province: randomItem(PROVINCES),
      city: randomItem(CITIES),
      occupancy_type: randomItem(OCCUPANCY_TYPES),
      entity_type: randomItem(ENTITY_TYPES),
      ownership_type: randomItem(OWNERSHIP_TYPES),
    })
  }

  return (
    <div className="prediction-form">
      <h2>🔋 National Energy Analytics Platform</h2>
      <p className="best-model-label">
        Best Model: <span className="best-model-tag">{BEST_MODEL_NAME}</span>
      </p>
      <p className="form-description">
        Predict, benchmark, and analyze building energy performance.
      </p>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Building Characteristics Section */}
        <div className="form-section">
          <h3>🏢 Building Characteristics</h3>

          <div className="form-row">
            <div className="form-group">
              <label>
                Building Size (m²)
                <span className="input-value">{formData.size_m2.toLocaleString()}</span>
              </label>
              <input
                type="range"
                name="size_m2"
                min="100"
                max="10000"
                step="50"
                value={formData.size_m2}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Number of Floors
                <span className="input-value">{formData.floors}</span>
              </label>
              <input
                type="range"
                name="floors"
                min="1"
                max="30"
                step="1"
                value={formData.floors}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Energy Sources Section */}
        <div className="form-section">
          <h3>⚡ Energy Sources</h3>

          <div className="form-row">
            <div className="form-group">
              <label>
                Grid Energy (kWh)
                <span className="input-value">{formData.grid_kwh.toLocaleString()}</span>
              </label>
              <input
                type="range"
                name="grid_kwh"
                min="0"
                max="300000"
                step="5000"
                value={formData.grid_kwh}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Gas Energy (kWh)
                <span className="input-value">{formData.gas_kwh.toLocaleString()}</span>
              </label>
              <input
                type="range"
                name="gas_kwh"
                min="0"
                max="200000"
                step="5000"
                value={formData.gas_kwh}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Renewable Energy (kWh)
                <span className="input-value">{formData.renewable_kwh.toLocaleString()}</span>
              </label>
              <input
                type="range"
                name="renewable_kwh"
                min="0"
                max="150000"
                step="5000"
                value={formData.renewable_kwh}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="form-section">
          <h3>📍 Location</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Province</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Building Type Section */}
        <div className="form-section">
          <h3>🏛️ Building Type</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Occupancy Type</label>
              <select
                name="occupancy_type"
                value={formData.occupancy_type}
                onChange={handleChange}
              >
                {OCCUPANCY_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Entity Type</label>
              <select
                name="entity_type"
                value={formData.entity_type}
                onChange={handleChange}
              >
                {ENTITY_TYPES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ownership Type</label>
              <select
                name="ownership_type"
                value={formData.ownership_type}
                onChange={handleChange}
              >
                {OWNERSHIP_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Button Section */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Predicting...' : '▶ Predict & Analyze'}
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

export default PredictionForm
