import React, { useState } from 'react'
import axios from 'axios'
import '../styles/BuildingClassificationForm.css'

function BuildingClassificationForm({ onClassify }) {
  const [formData, setFormData] = useState({
    entity_type: 'Private',
    ownership_type: 'owned',
    billing_type: 'monthly',
    metering_type: 'prepaid',
    province: 'Dublin',
    size: 2,
    floors: 5,
    grid_kwh: 1200,
    gas_kwh: 200,
    renewable_kwh: 50,
    liquid_kwh: 0,
    solid_kwh: 0,
    other_kwh: 0,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
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
      const response = await axios.post('http://localhost:5000/api/classify', {
        entity_type: formData.entity_type,
        ownership_type: formData.ownership_type,
        billing_type: formData.billing_type,
        metering_type: formData.metering_type,
        province: formData.province,
        size: formData.size,
        floors: formData.floors,
        grid: formData.grid_kwh,
        gas: formData.gas_kwh,
        renewable: formData.renewable_kwh,
        liquid: formData.liquid_kwh,
        solid: formData.solid_kwh,
        other: formData.other_kwh,
      })

      onClassify({
        classification: response.data.classification,
        probabilities: response.data.probabilities,
        formData: formData,
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Error during classification. Please try again.')
      console.error('Classification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRandomize = () => {
    setFormData({
      entity_type: Math.random() > 0.5 ? 'Private' : 'Public',
      ownership_type: Math.random() > 0.5 ? 'owned' : 'rented',
      billing_type: Math.random() > 0.5 ? 'monthly' : 'quarterly',
      metering_type: Math.random() > 0.5 ? 'prepaid' : 'postpaid',
      province: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford'][Math.floor(Math.random() * 5)],
      size: Math.floor(Math.random() * 3) + 1,
      floors: Math.floor(Math.random() * 10) + 1,
      grid_kwh: Math.floor(Math.random() * 5000) + 500,
      gas_kwh: Math.floor(Math.random() * 3000),
      renewable_kwh: Math.floor(Math.random() * 2000),
      liquid_kwh: Math.floor(Math.random() * 1000),
      solid_kwh: Math.floor(Math.random() * 1000),
      other_kwh: Math.floor(Math.random() * 500),
    })
    setError('')
  }

  return (
    <div className="bc-form">
      <h2>🏢 Building Occupancy Classifier</h2>
      <p className="form-description">
        Enter building details to predict occupancy classification based on energy patterns.
      </p>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bc-form-container">
        {/* Building Information Section */}
        <div className="form-section">
          <h3>🏢 Building Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Entity Type</label>
              <select
                name="entity_type"
                value={formData.entity_type}
                onChange={handleInputChange}
              >
                <option>Private</option>
                <option>Public</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ownership Type</label>
              <select
                name="ownership_type"
                value={formData.ownership_type}
                onChange={handleInputChange}
              >
                <option value="owned">Owned</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metering Section */}
        <div className="form-section">
          <h3>📊 Metering & Billing</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Billing Type</label>
              <select
                name="billing_type"
                value={formData.billing_type}
                onChange={handleInputChange}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div className="form-group">
              <label>Metering Type</label>
              <select
                name="metering_type"
                value={formData.metering_type}
                onChange={handleInputChange}
              >
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="form-section">
          <h3>📍 Location</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Province</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="e.g., Dublin"
              />
            </div>
          </div>
        </div>

        {/* Physical Characteristics Section */}
        <div className="form-section">
          <h3>📐 Physical Characteristics</h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                Size
                <span className="input-value">{['Small', 'Medium', 'Large'][formData.size - 1]}</span>
              </label>
              <input
                type="range"
                name="size"
                min="1"
                max="3"
                step="1"
                value={formData.size}
                onChange={(e) => handleSliderChange('size', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Floors
                <span className="input-value">{formData.floors} floors</span>
              </label>
              <input
                type="range"
                name="floors"
                min="1"
                max="20"
                step="1"
                value={formData.floors}
                onChange={(e) => handleSliderChange('floors', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Energy Consumption Section */}
        <div className="form-section">
          <h3>⚡ Energy Consumption (kWh)</h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                Grid Energy
                <span className="input-value">{formData.grid_kwh} kWh</span>
              </label>
              <input
                type="range"
                name="grid_kwh"
                min="0"
                max="10000"
                step="100"
                value={formData.grid_kwh}
                onChange={(e) => handleSliderChange('grid_kwh', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Gas Energy
                <span className="input-value">{formData.gas_kwh} kWh</span>
              </label>
              <input
                type="range"
                name="gas_kwh"
                min="0"
                max="5000"
                step="100"
                value={formData.gas_kwh}
                onChange={(e) => handleSliderChange('gas_kwh', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Renewable Energy
                <span className="input-value">{formData.renewable_kwh} kWh</span>
              </label>
              <input
                type="range"
                name="renewable_kwh"
                min="0"
                max="3000"
                step="100"
                value={formData.renewable_kwh}
                onChange={(e) => handleSliderChange('renewable_kwh', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Liquid Fuel
                <span className="input-value">{formData.liquid_kwh} kWh</span>
              </label>
              <input
                type="range"
                name="liquid_kwh"
                min="0"
                max="2000"
                step="100"
                value={formData.liquid_kwh}
                onChange={(e) => handleSliderChange('liquid_kwh', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Solid Fuel
                <span className="input-value">{formData.solid_kwh} kWh</span>
              </label>
              <input
                type="range"
                name="solid_kwh"
                min="0"
                max="2000"
                step="100"
                value={formData.solid_kwh}
                onChange={(e) => handleSliderChange('solid_kwh', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Other Energy
                <span className="input-value">{formData.other_kwh} kWh</span>
              </label>
              <input
                type="range"
                name="other_kwh"
                min="0"
                max="1000"
                step="100"
                value={formData.other_kwh}
                onChange={(e) => handleSliderChange('other_kwh', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Classifying...' : '▶ Classify Building'}
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

export default BuildingClassificationForm
