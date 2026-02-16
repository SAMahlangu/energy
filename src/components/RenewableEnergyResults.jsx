import React from 'react'
import '../styles/RenewableEnergyResults.css'

function RenewableEnergyResults({ results }) {
  if (!results) return null

  const analysis = results.solar_analysis || {}
  const prediction = results.prediction || {}
  const input = results.input || {}
  const isCandidate = prediction.is_solar_candidate

  return (
    <div className="rer-container">
      <h3>☀️ Solar Energy Potential Analysis</h3>

      {/* Building Summary */}
      <div className="rer-summary-cards">
        <div className="rer-card">
          <span className="card-label">Building Size</span>
          <span className="card-value">{(input.building_size || 0).toFixed(0)} m²</span>
        </div>
        <div className="rer-card">
          <span className="card-label">Province</span>
          <span className="card-value">{input.province?.toUpperCase()}</span>
        </div>
        <div className="rer-card">
          <span className="card-label">Total Energy</span>
          <span className="card-value">{((input.total_energy_consumption || 0) / 1000).toFixed(0)}k kWh</span>
        </div>
        <div className="rer-card">
          <span className="card-label">Grid Usage</span>
          <span className="card-value">{((input.grid_usage || 0) / 1000).toFixed(0)}k kWh</span>
        </div>
      </div>

      {/* Main Recommendation */}
      <div className={`rer-main-recommendation ${isCandidate ? 'candidate' : 'not-candidate'}`}>
        <div className="recommendation-icon">
          {isCandidate ? '✅' : '❌'}
        </div>
        <div className="recommendation-text">
          <strong>{prediction.recommendation}</strong>
        </div>
      </div>

      {/* Reasons */}
      {prediction.reasons && prediction.reasons.length > 0 && (
        <div className="rer-reasons">
          <h4>📋 Key Factors</h4>
          <ul className="reasons-list">
            {prediction.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Solar Analysis */}
      <div className="rer-analysis-section">
        <h4>☀️ Solar Potential</h4>
        <div className="rer-metrics-grid">
          <div className="rer-metric">
            <span className="metric-label">Solar Irradiance</span>
            <span className="metric-value">{(analysis.solar_irradiance_kwh_m2_day || 0).toFixed(1)}</span>
            <span className="metric-unit">kWh/m²/day</span>
          </div>
          <div className="rer-metric">
            <span className="metric-label">Roof Area</span>
            <span className="metric-value">{(analysis.roof_area_m2 || 0).toFixed(0)}</span>
            <span className="metric-unit">m²</span>
          </div>
          <div className="rer-metric">
            <span className="metric-label">Solar Generation</span>
            <span className="metric-value">{((analysis.solar_potential_kwh_year || 0) / 1000).toFixed(0)}k</span>
            <span className="metric-unit">kWh/year</span>
          </div>
          <div className="rer-metric">
            <span className="metric-label">System Size</span>
            <span className="metric-value">{(analysis.estimated_system_kw || 0).toFixed(1)}</span>
            <span className="metric-unit">kW</span>
          </div>
        </div>
      </div>

      {/* Financial Analysis */}
      <div className="rer-financial-section">
        <h4>💰 Financial Analysis</h4>
        <div className="rer-financial-metrics">
          <div className="financial-item">
            <span className="item-label">Installation Cost</span>
            <span className="item-value">R{(analysis.installation_cost_zar || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
          </div>
          <div className="financial-item">
            <span className="item-label">Annual Savings</span>
            <span className="item-value">R{(analysis.annual_savings_zar || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
          </div>
          <div className="financial-item highlight">
            <span className="item-label">Payback Period</span>
            <span className="item-value">{(analysis.payback_years || 0).toFixed(1)}</span>
            <span className="item-unit">years</span>
          </div>
        </div>
      </div>

      {/* Grid Dependency */}
      <div className="rer-grid-section">
        <h4>🔌 Grid Dependency</h4>
        <div className="grid-metrics">
          <div className="grid-metric">
            <span className="metric-label">Grid Dependency Ratio</span>
            <span className="metric-value">{((analysis.grid_dependency_ratio || 0) * 100).toFixed(1)}%</span>
          </div>
          <div className="grid-metric">
            <span className="metric-label">Renewable Gap to Cover</span>
            <span className="metric-value">{((analysis.renewable_gap_kwh || 0) / 1000).toFixed(0)}k</span>
            <span className="metric-unit">kWh/year</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rer-info-box">
        <p>
          <strong>💡 About This Analysis:</strong> This assessment evaluates your building's suitability for solar energy based on:
          location (solar irradiance), building size, current energy consumption patterns, grid dependency, and financial viability.
          A quick payback period (typically under 6 years) indicates a strong business case for solar investment.
        </p>
      </div>
    </div>
  )
}

export default RenewableEnergyResults
