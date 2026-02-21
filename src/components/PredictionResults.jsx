import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/PredictionResults.css'

function PredictionResults({ predictions, formData }) {
  if (!predictions || !predictions.predictions) {
    return null
  }

  const preds = predictions.predictions
  const totalEnergy = formData.grid_kwh + formData.gas_kwh + formData.renewable_kwh
  const eui = totalEnergy / formData.size_m2

  // Get ensemble average if available
  const ensembleAverage = preds.ensemble_average?.prediction || null
  const rfPrediction = preds.random_forest?.prediction || null
  const xgbPrediction = preds.xgboost?.prediction || null
  const lrPrediction = preds.linear_regression?.prediction || null

  // Determine efficiency status
  const nationalBenchmark = 120 // Example benchmark, should come from backend
  const isEfficient = eui <= nationalBenchmark
  const efficiencyGap = Math.abs(eui - nationalBenchmark)

  // Simple province benchmark lookup (placeholder values, similar scale)
  const [provinceData, setProvinceData] = useState(null)
  const [ciData, setCiData] = useState(null)

  useEffect(() => {
    let mounted = true

    async function fetchBenchmarkAndCI() {
      try {
        const features = [
          formData.size_m2,
          formData.floors,
          formData.grid_kwh,
          formData.gas_kwh,
          formData.renewable_kwh,
        ]

        const provReq = axios.get('http://13.49.72.166/api/province-benchmark')
        const ciReq = axios.post('http://13.49.72.166/api/prediction-ci', { features })

        const [provRes, ciRes] = await Promise.all([provReq, ciReq])

        if (!mounted) return

        if (provRes.data && provRes.data.success) setProvinceData(provRes.data)
        if (ciRes.data && ciRes.data.success) setCiData(ciRes.data)
      } catch (err) {
        console.error('Benchmark/CI fetch error', err)
      }
    }

    fetchBenchmarkAndCI()

    return () => {
      mounted = false
    }
  }, [formData])

  // Use backend province benchmark if available, otherwise fall back to local map
  const provinceBenchmarks = provinceData
    ? provinceData.provinces.reduce((acc, p, i) => ({ ...acc, [p]: provinceData.eui_kwh_m2[i] }), {})
    : {
        'Eastern Cape': 65,
        'Free State': 70,
        'Gauteng': 75,
        'KwaZulu-Natal': 72,
        'Limpopo': 68,
        'Mpumalanga': 73,
        'Northern Cape': 80,
        'North West': 69,
        'Western Cape': 60,
      }

  const provinceBenchmark = provinceBenchmarks[formData.province] ?? nationalBenchmark

  const maxEuiForBars = Math.max(eui, nationalBenchmark, provinceBenchmark) || 1

  // Confidence interval: prefer backend CI if available
  const centralPrediction = ciData?.prediction_kwh || ensembleAverage || xgbPrediction || rfPrediction || lrPrediction || totalEnergy
  const lowerConfidence = ciData?.ci_lower_kwh || centralPrediction * 0.9
  const upperConfidence = ciData?.ci_upper_kwh || centralPrediction * 1.1

  // Small SVG chart components
  const ProvinceBenchmarkChart = ({ provinces, values, highlight }) => {
    const maxVal = Math.max(...values, 1)
    const rowH = 28
    const width = 360
    const height = provinces.length * rowH

    const highlightValue = highlight && values[provinces.indexOf(highlight)] ? values[provinces.indexOf(highlight)] : null

    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMid">
        {/* Bars */}
        {provinces.map((p, i) => {
          const val = values[i] || 0
          const barW = (val / maxVal) * (width - 120)
          const y = i * rowH
          return (
            <g key={p} transform={`translate(0, ${y})`}>
              <text x={8} y={18} fontSize={12} fill="#374151">{p}</text>
              <rect x={120} y={6} rx={6} ry={6} width={width - 136} height={12} fill="#e5e7eb" />
              <rect x={120} y={6} rx={6} ry={6} width={barW} height={12} fill={p === highlight ? '#f97316' : '#7c3aed'} />
            </g>
          )
        })}

        {/* Highlight vertical dashed line if highlightValue present */}
        {highlightValue !== null && (
          <line
            x1={120 + (highlightValue / maxVal) * (width - 136)}
            x2={120 + (highlightValue / maxVal) * (width - 136)}
            y1={0}
            y2={height}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={2}
            opacity={0.9}
          />
        )}
      </svg>
    )
  }

  const PredictionCIChart = ({ lower, mean, upper }) => {
    const w = 140
    const h = 160
    const pad = 28
    const min = Math.min(lower, mean, upper)
    const max = Math.max(lower, mean, upper)
    const range = Math.max(max - min, 1)

    const yFor = (v) => pad + ((max - v) / range) * (h - pad * 2)

    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid">
        <line x1={w / 2} x2={w / 2} y1={yFor(upper)} y2={yFor(lower)} stroke="#374151" strokeWidth={2} />
        <line x1={(w / 2) - 10} x2={(w / 2) + 10} y1={yFor(upper)} y2={yFor(upper)} stroke="#374151" strokeWidth={2} />
        <line x1={(w / 2) - 10} x2={(w / 2) + 10} y1={yFor(lower)} y2={yFor(lower)} stroke="#374151" strokeWidth={2} />
        <circle cx={w / 2} cy={yFor(mean)} r={6} fill="#3b82f6" stroke="#1e3a8a" strokeWidth={1} />
      </svg>
    )
  }

  return (
    <div className="prediction-results">
      <h2>📊 Prediction Results & Analysis</h2>

      {/* Key Metrics Summary */}
      <div className="results-grid">
        <div className="result-card primary">
          <div className="card-label">Current Energy Usage</div>
          <div className="card-value">{totalEnergy.toLocaleString()}</div>
          <div className="card-unit">kWh</div>
        </div>

        <div className="result-card">
          <div className="card-label">Energy Use Intensity (EUI)</div>
          <div className="card-value">{eui.toFixed(2)}</div>
          <div className="card-unit">kWh/m²</div>
        </div>

        <div className={`result-card ${isEfficient ? 'success' : 'warning'}`}>
          <div className="card-label">Efficiency Status</div>
          <div className="card-value">
            {isEfficient ? '✅ Efficient' : '⚠️ Inefficient'}
          </div>
          <div className="card-unit">Gap: {efficiencyGap.toFixed(2)} kWh/m²</div>
        </div>

        <div className="result-card">
          <div className="card-label">National Benchmark</div>
          <div className="card-value">{nationalBenchmark}</div>
          <div className="card-unit">kWh/m²</div>
        </div>
      </div>

      {/* Model Predictions */}
      <div className="predictions-section">
        <h3>🤖 Model Predictions</h3>

        <div className="models-grid">
          {ensembleAverage && (
            <div className="model-card featured">
              <div className="model-type">Ensemble Average</div>
              <div className="model-value">{ensembleAverage.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className="model-unit">kWh</div>
              <div className="model-badge">Recommended</div>
            </div>
          )}

          {xgbPrediction && (
            <div className="model-card">
              <div className="model-type">XGBoost</div>
              <div className="model-value">{xgbPrediction.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className="model-unit">kWh</div>
              <div className="model-info">Best accuracy</div>
            </div>
          )}

          {rfPrediction && (
            <div className="model-card">
              <div className="model-type">Random Forest</div>
              <div className="model-value">{rfPrediction.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className="model-unit">kWh</div>
              <div className="model-info">High accuracy</div>
            </div>
          )}

          {lrPrediction && (
            <div className="model-card">
              <div className="model-type">Linear Regression</div>
              <div className="model-value">{lrPrediction.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className="model-unit">kWh</div>
              <div className="model-info">Baseline</div>
            </div>
          )}
        </div>
      </div>

      {/* Energy Mix Breakdown */}
      <div className="energy-section">
        <h3>⚡ Energy Mix Breakdown</h3>

        <div className="energy-breakdown">
          <div className="energy-source">
            <div className="source-label">Grid Energy</div>
            <div className="source-value">{formData.grid_kwh.toLocaleString()}</div>
            <div className="source-unit">kWh</div>
            <div className="source-percentage">
              {((formData.grid_kwh / totalEnergy) * 100).toFixed(1)}%
            </div>
            <div className="source-bar">
              <div
                className="bar-fill grid"
                style={{ width: `${(formData.grid_kwh / totalEnergy) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="energy-source">
            <div className="source-label">Gas Energy</div>
            <div className="source-value">{formData.gas_kwh.toLocaleString()}</div>
            <div className="source-unit">kWh</div>
            <div className="source-percentage">
              {((formData.gas_kwh / totalEnergy) * 100).toFixed(1)}%
            </div>
            <div className="source-bar">
              <div
                className="bar-fill gas"
                style={{ width: `${(formData.gas_kwh / totalEnergy) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="energy-source">
            <div className="source-label">Renewable Energy</div>
            <div className="source-value">{formData.renewable_kwh.toLocaleString()}</div>
            <div className="source-unit">kWh</div>
            <div className="source-percentage">
              {((formData.renewable_kwh / totalEnergy) * 100).toFixed(1)}%
            </div>
            <div className="source-bar">
              <div
                className="bar-fill renewable"
                style={{ width: `${(formData.renewable_kwh / totalEnergy) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark & Confidence Section */}
      <div className="benchmark-section">
        <h3>📊 Benchmark & Confidence</h3>

        <div className="benchmark-grid">
          <div className="benchmark-card">
            <div className="benchmark-title">Province Benchmark</div>
            <p className="benchmark-description">
              Compare your building&apos;s energy use intensity (EUI) against typical values
              for the selected province.
            </p>
            <div className="benchmark-chart">
              <div className="benchmark-row">
                <span className="benchmark-label">Predicted EUI</span>
                <span className="benchmark-value">{eui.toFixed(2)} kWh/m²</span>
              </div>

              <ProvinceBenchmarkChart
                provinces={Object.keys(provinceBenchmarks)}
                values={Object.keys(provinceBenchmarks).map((p) => provinceBenchmarks[p])}
                highlight={formData.province}
              />

              <div style={{ height: 8 }} />

              <div className="benchmark-row">
                <span className="benchmark-label">Province Benchmark</span>
                <span className="benchmark-value">{provinceBenchmark.toFixed(2)} kWh/m²</span>
              </div>
            </div>
          </div>

          <div className="benchmark-card">
            <div className="benchmark-title">Prediction Confidence</div>
            <p className="benchmark-description">
              Visualize the prediction with an uncertainty band (confidence interval)
              around the estimated annual energy consumption.
            </p>
            <div className="benchmark-chart">
              <div className="benchmark-row">
                <span className="benchmark-label">Predicted Energy</span>
                <span className="benchmark-value">
                  {centralPrediction.toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                  })}{' '}
                  kWh
                </span>
              </div>
              <div className="benchmark-bar-track ci-track" style={{ height: 160 }}>
                <PredictionCIChart lower={lowerConfidence} mean={centralPrediction} upper={upperConfidence} />
              </div>
              <div className="benchmark-row benchmark-ci-text">
                <span>
                  ~ {Number(lowerConfidence).toLocaleString('en-US', { maximumFractionDigits: 0 })} –{' '}
                  {Number(upperConfidence).toLocaleString('en-US', { maximumFractionDigits: 0 })} kWh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Building Information */}
      <div className="info-section">
        <h3>🏢 Building Information</h3>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Size:</span>
            <span className="info-value">{formData.size_m2} m²</span>
          </div>
          <div className="info-item">
            <span className="info-label">Floors:</span>
            <span className="info-value">{formData.floors}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Province:</span>
            <span className="info-value">{formData.province}</span>
          </div>
          <div className="info-item">
            <span className="info-label">City:</span>
            <span className="info-value">{formData.city}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Occupancy Type:</span>
            <span className="info-value">{formData.occupancy_type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Entity Type:</span>
            <span className="info-value">{formData.entity_type}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3>💡 Recommendations</h3>

        <div className="recommendations">
          {isEfficient ? (
            <>
              <div className="recommendation success">
                <span className="rec-icon">✅</span>
                <div>
                  <strong>Energy Efficient Building</strong>
                  <p>Your building's EUI is below the national benchmark. Maintain current practices.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="recommendation warning">
                <span className="rec-icon">⚠️</span>
                <div>
                  <strong>Energy Optimization Needed</strong>
                  <p>Your building's EUI exceeds the national benchmark by {efficiencyGap.toFixed(2)} kWh/m².</p>
                </div>
              </div>

              <div className="recommendation info">
                <span className="rec-icon">💡</span>
                <div>
                  <strong>Increase Renewable Energy Usage</strong>
                  <p>Consider increasing renewable energy sources to reduce overall consumption and carbon footprint.</p>
                </div>
              </div>

              <div className="recommendation info">
                <span className="rec-icon">💡</span>
                <div>
                  <strong>Energy Audit</strong>
                  <p>Conduct an energy audit to identify inefficiencies in HVAC, lighting, and equipment systems.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PredictionResults
