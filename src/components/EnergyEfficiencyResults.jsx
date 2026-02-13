import React, { useState } from 'react'
import '../styles/EnergyEfficiencyResults.css'

function EnergyEfficiencyResults({ prediction }) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    baseline: true,
    savings: true,
    scenario: true,
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (!prediction) {
    return null
  }

  const baseline = prediction.baseline_energy
  const improved = prediction.improved_energy
  const saved = prediction.energy_saved
  const cost = prediction.cost_saved
  const carbon = prediction.carbon_saved
  const epc_levels = prediction.epc_levels || [1, 2, 3, 4, 5, 6, 7]
  const predictions = prediction.predictions || []

  // Find max prediction for chart scaling
  const maxPred = predictions.length > 0 ? Math.max(...predictions) : 100

  return (
    <div className="energy-efficiency-results">
      <h2>📊 Energy Efficiency Analysis Results</h2>

      {/* Summary Metrics */}
      <div className="metrics-container">
        <div className="metric-card baseline-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-label">Baseline Energy</div>
            <div className="metric-value">
              {baseline.toFixed(2)}
              <span className="metric-unit">kWh</span>
            </div>
          </div>
        </div>

        <div className="metric-card improvement-card">
          <div className="metric-icon">⬇️</div>
          <div className="metric-content">
            <div className="metric-label">At EPC 1</div>
            <div className="metric-value">
              {improved.toFixed(2)}
              <span className="metric-unit">kWh</span>
            </div>
            <div className="metric-percentage">
              {((1 - improved / baseline) * 100).toFixed(1)}% reduction
            </div>
          </div>
        </div>

        <div className="metric-card savings-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-label">Cost Savings</div>
            <div className="metric-value">
              R{cost.toFixed(2)}
            </div>
            <div className="metric-percentage">
              Annual benefit
            </div>
          </div>
        </div>

        <div className="metric-card environmental-card">
          <div className="metric-icon">🌱</div>
          <div className="metric-content">
            <div className="metric-label">CO₂ Avoided</div>
            <div className="metric-value">
              {carbon.toFixed(2)}
              <span className="metric-unit">tons</span>
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
                {prediction.interpretation}
              </div>
            </div>
          )}
        </div>

        {/* Baseline Section */}
        <div className="result-section">
          <div
            className="section-header"
            onClick={() => toggleSection('baseline')}
          >
            <span className="section-title">📈 Baseline Analysis</span>
            <span className={`section-toggle ${expandedSections.baseline ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.baseline && (
            <div className="section-content">
              <div className="detail-row">
                <span className="detail-label">Current Energy Intensity:</span>
                <span className="detail-value">{baseline.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">If upgraded to EPC 1:</span>
                <span className="detail-value">{improved.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Potential Reduction:</span>
                <span className="detail-value">{((1 - improved / baseline) * 100).toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Savings Section */}
        <div className="result-section">
          <div
            className="section-header"
            onClick={() => toggleSection('savings')}
          >
            <span className="section-title">💡 Potential Savings</span>
            <span className={`section-toggle ${expandedSections.savings ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.savings && (
            <div className="section-content">
              <div className="detail-row">
                <span className="detail-label">Energy Saved Annually:</span>
                <span className="detail-value">{saved.toFixed(2)} kWh</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cost Savings:</span>
                <span className="detail-value">R{cost.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">CO₂ Emissions Avoided:</span>
                <span className="detail-value">{carbon.toFixed(2)} metric tons</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trees Equivalent:</span>
                <span className="detail-value">{Math.round(carbon * 47)} trees</span>
              </div>
            </div>
          )}
        </div>

        {/* Scenario Analysis Section */}
        <div className="result-section">
          <div
            className="section-header"
            onClick={() => toggleSection('scenario')}
          >
            <span className="section-title">📊 EPC Scenario Analysis</span>
            <span className={`section-toggle ${expandedSections.scenario ? 'open' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.scenario && (
            <div className="section-content">
              <div className="scenario-chart">
                {epc_levels.map((level, idx) => (
                  <div key={level} className="chart-bar-container">
                    <div className="chart-bar">
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${(predictions[idx] / maxPred) * 100}%` }}
                      ></div>
                    </div>
                    <div className="chart-label">
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G'][level - 1]}
                    </div>
                    <div className="chart-value">{predictions[idx].toFixed(1)}</div>
                  </div>
                ))}
              </div>
              <p className="scenario-description">
                Energy intensity at different EPC rating levels. Lower ratings (A-C) show
                significant efficiency gains through building improvements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnergyEfficiencyResults
