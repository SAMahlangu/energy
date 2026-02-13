import React, { useState } from 'react'
import '../styles/EPCResults.css'

function EPCResults({ results }) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    energy: true,
    financial: true,
    environmental: true,
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (!results) {
    return null
  }

  const energy_saved = results.energy_saved
  const cost_savings = results.cost_savings
  const co2_avoided = results.co2_avoided // now in metric tons (to match notebook)

  return (
    <div className="epc-results">
      <h2>📊 Analysis Results</h2>

      {/* Summary Metrics Cards */}
      <div className="metrics-container">
        <div className="metric-card energy-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <div className="metric-label">Energy Savings</div>
            <div className="metric-value">
              {(energy_saved / 1000000).toFixed(1)}M
              <span className="metric-unit">kWh</span>
            </div>
            <div className="metric-percentage">
              {((energy_saved / (300000000 * 0.1)) * 100).toFixed(1)}% reduction
            </div>
          </div>
        </div>

        <div className="metric-card financial-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-label">Cost Savings</div>
            <div className="metric-value">
              R{(cost_savings / 1000000).toFixed(1)}M
            </div>
            <div className="metric-percentage">
              Annual savings
            </div>
          </div>
        </div>

        <div className="metric-card environmental-card">
          <div className="metric-icon">🌱</div>
          <div className="metric-content">
            <div className="metric-label">CO₂ Avoided</div>
            <div className="metric-value">
              {co2_avoided.toFixed(2)}
              <span className="metric-unit">tons</span>
            </div>
            <div className="metric-percentage">
              Annual CO₂ reduction
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results Sections */}
      <div className="results-sections">
        {/* Overview Section */}
        <div className="result-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('overview')}
          >
            <span className="section-title">📋 Executive Summary</span>
            <span className={`section-toggle ${expandedSections.overview ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.overview && (
            <div className="section-content">
              <div className="interpretation-text">
                {results.interpretation}
              </div>
            </div>
          )}
        </div>

        {/* Energy Details Section */}
        <div className="result-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('energy')}
          >
            <span className="section-title">⚡ Energy Impact Details</span>
            <span className={`section-toggle ${expandedSections.energy ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.energy && (
            <div className="section-content">
              <div className="detail-row">
                <span className="detail-label">Total Energy Saved:</span>
                <span className="detail-value">{(energy_saved / 1000000).toFixed(2)} Million kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Percentage Reduction:</span>
                <span className="detail-value">
                  {((energy_saved / (300000000 * 0.1)) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Section */}
        <div className="result-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('financial')}
          >
            <span className="section-title">💰 Financial Benefits</span>
            <span className={`section-toggle ${expandedSections.financial ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.financial && (
            <div className="section-content">
              <div className="detail-row">
                <span className="detail-label">Annual Cost Savings:</span>
                <span className="detail-value">R{(cost_savings / 1000000).toFixed(2)} Million</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Per Unit (kWh):</span>
                <span className="detail-value">R{(cost_savings / energy_saved).toFixed(4)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Environmental Section */}
        <div className="result-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('environmental')}
          >
            <span className="section-title">🌱 Environmental Impact</span>
            <span className={`section-toggle ${expandedSections.environmental ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.environmental && (
            <div className="section-content">
              <div className="detail-row">
                <span className="detail-label">CO₂ Emissions Avoided:</span>
                <span className="detail-value">{co2_avoided.toFixed(2)} Metric Tons</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Equivalent to:</span>
                <span className="detail-value">
                  {Math.round((co2_avoided * 1000) / 21)} trees planted
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill environmental"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EPCResults
