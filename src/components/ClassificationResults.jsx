import React, { useState } from 'react'
import '../styles/ClassificationResults.css'

function ClassificationResults({ classification, probabilities, formData }) {
  const [expandedSection, setExpandedSection] = useState('predictions')

  const sortedProbs = Object.entries(probabilities || {})
    .sort(([, a], [, b]) => b - a)

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="classification-results">
      <h2>📊 Classification Results</h2>

      {/* Main Prediction Card */}
      <div className="result-cards-grid">
        <div className="result-card primary">
          <div className="card-label">Predicted Classification</div>
          <div className="card-value">{classification}</div>
          <div className="card-unit">Building Occupancy Type</div>
        </div>
        
        <div className="result-card success">
          <div className="card-label">Confidence</div>
          <div className="card-value">
            {probabilities[classification] 
              ? (probabilities[classification] * 100).toFixed(1) 
              : 'N/A'}%
          </div>
          <div className="card-unit">Prediction Confidence</div>
        </div>
      </div>

      {/* Probability Distribution */}
      <div className="section-container">
        <div 
          className="section-header"
          onClick={() => toggleSection('predictions')}
        >
          <h3>🎯 Probability Distribution</h3>
          <span className="expand-icon">{expandedSection === 'predictions' ? '▼' : '▶'}</span>
        </div>
        {expandedSection === 'predictions' && (
          <div className="section-content">
            <div className="probability-bars">
              {sortedProbs.map(([classname, prob]) => (
                <div key={classname} className="probability-item">
                  <span className="class-label">{classname}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${prob * 100}%` }}
                    ></div>
                  </div>
                  <span className="probability-value">{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Building Information Summary */}
      <div className="section-container">
        <div 
          className="section-header"
          onClick={() => toggleSection('building')}
        >
          <h3>🏢 Building Information</h3>
          <span className="expand-icon">{expandedSection === 'building' ? '▼' : '▶'}</span>
        </div>
        {expandedSection === 'building' && (
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Entity Type</span>
                <span className="info-value">{formData.entity_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ownership Type</span>
                <span className="info-value">{formData.ownership_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Billing Type</span>
                <span className="info-value">{formData.billing_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Metering Type</span>
                <span className="info-value">{formData.metering_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Province</span>
                <span className="info-value">{formData.province}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Size</span>
                <span className="info-value">{['Small', 'Medium', 'Large'][formData.size - 1]}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Number of Floors</span>
                <span className="info-value">{formData.floors}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Energy Consumption Breakdown */}
      <div className="section-container">
        <div 
          className="section-header"
          onClick={() => toggleSection('energy')}
        >
          <h3>⚡ Energy Consumption Breakdown</h3>
          <span className="expand-icon">{expandedSection === 'energy' ? '▼' : '▶'}</span>
        </div>
        {expandedSection === 'energy' && (
          <div className="section-content">
            <div className="energy-breakdown">
              <div className="energy-item">
                <span className="energy-label">Grid Energy</span>
                <span className="energy-value">{formData.grid_kwh} kWh</span>
              </div>
              <div className="energy-item">
                <span className="energy-label">Gas Energy</span>
                <span className="energy-value">{formData.gas_kwh} kWh</span>
              </div>
              <div className="energy-item">
                <span className="energy-label">Renewable Energy</span>
                <span className="energy-value">{formData.renewable_kwh} kWh</span>
              </div>
              <div className="energy-item">
                <span className="energy-label">Liquid Fuel</span>
                <span className="energy-value">{formData.liquid_kwh} kWh</span>
              </div>
              <div className="energy-item">
                <span className="energy-label">Solid Fuel</span>
                <span className="energy-value">{formData.solid_kwh} kWh</span>
              </div>
              <div className="energy-item">
                <span className="energy-label">Other Energy</span>
                <span className="energy-value">{formData.other_kwh} kWh</span>
              </div>
            </div>
            <div className="total-energy">
              <strong>Total Energy:</strong> {
                formData.grid_kwh + formData.gas_kwh + formData.renewable_kwh + 
                formData.liquid_kwh + formData.solid_kwh + formData.other_kwh
              } kWh
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClassificationResults
