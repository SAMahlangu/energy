import React from 'react'
import '../styles/AnomalyDetectionResults.css'

function AnomalyDetectionResults({ results }) {
  if (!results) return null

  const isolationForestResult = results.isolation_forest_result
  const dbscanResult = results.dbscan_result
  const recommendations = results.recommendations || []
  const input = results.input || {}

  const isAnomaly = isolationForestResult === "Anomaly"
  const statusClass = isAnomaly ? 'anomaly' : 'normal'

  return (
    <div className="ad-results-container">
      <h3>🔍 Anomaly Detection Results</h3>

      {/* Input Display */}
      <div className="adr-input-section">
        <h4>Input Metrics</h4>
        <div className="adr-input-grid">
          <div className="adr-input-item">
            <span className="input-label">Energy per m²</span>
            <span className="input-value">{(input.energy_per_m2 || 0).toFixed(1)} kWh/m²</span>
          </div>
          <div className="adr-input-item">
            <span className="input-label">Fuel Intensity</span>
            <span className="input-value">{(input.fuel_intensity || 0).toFixed(1)} kWh/m²</span>
          </div>
          <div className="adr-input-item">
            <span className="input-label">Electricity Intensity</span>
            <span className="input-value">{(input.electricity_intensity || 0).toFixed(1)} kWh/m²</span>
          </div>
        </div>
      </div>

      {/* Main Result */}
      <div className={`adr-main-result ${statusClass}`}>
        <div className="adr-status-icon">
          {isAnomaly ? '⚠️ ANOMALY' : '✅ NORMAL'}
        </div>
        <div className="adr-status-message">
          {isAnomaly 
            ? 'Unusual energy consumption pattern detected' 
            : 'Building energy consumption is within normal range'}
        </div>
      </div>

      {/* Model Results */}
      <div className="adr-models-section">
        <h4>📊 Model Predictions</h4>
        
        <div className="adr-model-result">
          <div className="model-name">Isolation Forest</div>
          <div className={`model-prediction isolation-${isolationForestResult.toLowerCase()}`}>
            {isolationForestResult}
          </div>
          <p className="model-description">
            Detects anomalies using tree-based isolation technique
          </p>
        </div>

        <div className="adr-model-result">
          <div className="model-name">DBSCAN</div>
          <div className={`model-prediction dbscan-${dbscanResult.toLowerCase()}`}>
            {dbscanResult}
          </div>
          <p className="model-description">
            Identifies outliers using density-based clustering
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="adr-recommendations">
          <h4>💡 Recommendations</h4>
          <ul className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="recommendation-item">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysis Summary */}
      <div className="adr-summary">
        <h4>📈 Analysis Summary</h4>
        <div className="summary-text">
          <p>
            Based on the analysis of three key energy metrics, this building has been evaluated using two independent
            anomaly detection algorithms:
          </p>
          <ul>
            <li><strong>Isolation Forest:</strong> An ensemble method that isolates anomalies by randomly selecting features and split values.</li>
            <li><strong>DBSCAN:</strong> A density-based clustering algorithm that identifies core points, border points, and noise points.</li>
          </ul>
          <p>
            Both methods combined provide robust detection of unusual energy consumption patterns that may indicate
            issues with building systems, inefficient operations, or data anomalies.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnomalyDetectionResults
