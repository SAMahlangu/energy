import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/ClassificationResults.css'

function ClassificationResults(props) {
  const { classification, probabilities, formData, registryData, epcData } = props
  
  // Check if this is batch data or single building data
  const isBatchData = registryData && epcData

  if (isBatchData) {
    return <BatchComplianceAnalysis registryData={registryData} epcData={epcData} />
  }

  // Original single building results
  if (!classification) return null

  const [expandedSection, setExpandedSection] = useState('predictions')

  const sortedProbs = Object.entries(probabilities || {})
    .sort(([, a], [, b]) => b - a)

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="classification-results">
      <h2>📊 Single Building Classification Results</h2>

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

/* Batch Compliance Analysis Component */
function BatchComplianceAnalysis({ registryData, epcData }) {
  const [processedData, setProcessedData] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const cleanText = (x) => {
    if (!x) return ''
    return String(x).trim().toLowerCase()
  }

  const safeNum = (x) => {
    try {
      return parseFloat(x)
    } catch {
      return NaN
    }
  }

  const computeRiskScore = (row) => {
    let score = 0
    if (row.compliance_status && row.compliance_status.includes('NON')) score += 50
    if (row.floors_num >= 10) score += 15
    else if (row.floors_num >= 5) score += 10
    else if (row.floors_num >= 2) score += 5
    if (row['Grid Usage'] > 0) score += 10
    let fuelSources = 0
    if (row['Gas Usage'] > 0) fuelSources++
    if (row['Liquid Fuel Usage'] > 0) fuelSources++
    if (row['Solid Fuel Usage'] > 0) fuelSources++
    score += fuelSources * 5
    if (!row.smart_metered_flag) score += 10
    const occ = String(row['Occupancy Classification'] || '').toLowerCase()
    if (occ.includes('hospital') || occ.includes('health')) score += 10
    if (occ.includes('office')) score += 5
    if (occ.includes('school') || occ.includes('education')) score += 5
    return Math.min(100, score)
  }

  const getRiskCategory = (score) => {
    if (score < 30) return 'LOW'
    if (score < 60) return 'MEDIUM'
    return 'HIGH'
  }

  useEffect(() => {
    if (!registryData || !epcData) return

    const epcKeys = new Set(epcData.map(row => String(row['Registration Number'] || '').trim()))

    const processed = registryData.map(row => ({
      ...row,
      reg_key: String(row['Registration Number'] || '').trim(),
      has_epc: epcKeys.has(String(row['Registration Number'] || '').trim()),
      compliance_status: epcKeys.has(String(row['Registration Number'] || '').trim())
        ? 'COMPLIANT (EPC ISSUED)'
        : 'NON-COMPLIANT (NO EPC)',
      City: cleanText(row['City']),
      Province: cleanText(row['Province']),
      'Occupancy Classification': cleanText(row['Occupancy Classification']),
      floors_num: safeNum(row['No. of Floors']) || 0,
      'Grid Usage': safeNum(row['Grid Usage']) || 0,
      'Gas Usage': safeNum(row['Gas Usage']) || 0,
      'Liquid Fuel Usage': safeNum(row['Liquid Fuel Usage']) || 0,
      'Renewable Usage': safeNum(row['Renewable Usage']) || 0,
      smart_metered_flag: String(row['Is Smart Metered?'] || '').toLowerCase().includes('yes'),
    }))

    const withRisk = processed.map(row => ({
      ...row,
      risk_score: computeRiskScore(row),
      risk_category: getRiskCategory(computeRiskScore(row)),
    }))

    setProcessedData(withRisk)
    setFilteredData(withRisk)
  }, [registryData, epcData])

  useEffect(() => {
    if (!processedData) return

    let filtered = processedData

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(row =>
        String(row.reg_key).toLowerCase().includes(term) ||
        String(row.City).toLowerCase().includes(term) ||
        String(row.Province).toLowerCase().includes(term)
      )
    }

    if (riskFilter !== 'ALL') {
      filtered = filtered.filter(row => row.risk_category === riskFilter)
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(row => row.compliance_status === statusFilter)
    }

    setFilteredData(filtered)
  }, [searchTerm, riskFilter, statusFilter, processedData])

  if (!processedData) {
    return <div className="loading">Processing compliance data...</div>
  }

  const totalBuildings = processedData.length
  const compliant = processedData.filter(r => r.has_epc).length
  const nonCompliant = totalBuildings - compliant
  const complianceRate = ((compliant / totalBuildings) * 100).toFixed(1)

  const handleExportCSV = () => {
    if (filteredData.length === 0) return
    const csv = [
      Object.keys(filteredData[0]).join(','),
      ...filteredData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Building_Compliance_Export.csv'
    a.click()
  }

  return (
    <div className="cr-batch-container">
      <h2>📊 Batch Compliance Analysis</h2>

      {/* Metrics */}
      <div className="cr-metrics">
        <div className="cr-metric-card">
          <div className="metric-label">Total Buildings</div>
          <div className="metric-value">{totalBuildings}</div>
        </div>
        <div className="cr-metric-card compliant">
          <div className="metric-label">Compliant</div>
          <div className="metric-value">{compliant}</div>
        </div>
        <div className="cr-metric-card non-compliant">
          <div className="metric-label">Non-Compliant</div>
          <div className="metric-value">{nonCompliant}</div>
        </div>
        <div className="cr-metric-card">
          <div className="metric-label">Compliance Rate</div>
          <div className="metric-value">{complianceRate}%</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="cr-filters">
        <input
          type="text"
          placeholder="Search by Registration / City / Province"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="cr-search-input"
        />

        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="cr-filter-select">
          <option value="ALL">All Risk Levels</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="cr-filter-select">
          <option value="ALL">All Status</option>
          <option value="COMPLIANT (EPC ISSUED)">Compliant</option>
          <option value="NON-COMPLIANT (NO EPC)">Non-Compliant</option>
        </select>

        <button onClick={handleExportCSV} className="cr-export-btn">
          📥 Export CSV
        </button>
      </div>

      {/* Results Table */}
      <div className="cr-table-container">
        <p className="cr-result-count">Showing <strong>{filteredData.length}</strong> of <strong>{totalBuildings}</strong> buildings</p>
        <table className="cr-results-table">
          <thead>
            <tr>
              <th>Registration</th>
              <th>City</th>
              <th>Province</th>
              <th>Occupancy</th>
              <th>Floors</th>
              <th>Risk Score</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData
              .sort((a, b) => b.risk_score - a.risk_score)
              .slice(0, 100)
              .map((row, idx) => (
                <tr key={idx}>
                  <td>{row.reg_key}</td>
                  <td>{row.City}</td>
                  <td>{row.Province}</td>
                  <td>{row['Occupancy Classification']}</td>
                  <td>{row.floors_num || 'N/A'}</td>
                  <td><strong>{row.risk_score}</strong></td>
                  <td>
                    <span className={`risk-badge risk-${row.risk_category.toLowerCase()}`}>
                      {row.risk_category}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${row.has_epc ? 'compliant' : 'non-compliant'}`}>
                      {row.has_epc ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Charts Section */}
      <ChartsSection processedData={processedData} />

      {/* Map Section */}
      <MapSection processedData={processedData} />

      {/* Policy Recommendations */}
      <PolicyRecommendations processedData={processedData} />
    </div>
  )
}

/* Charts Component */
function ChartsSection({ processedData }) {
  // Compliance Status Data
  const complianceData = [
    { name: 'COMPLIANT\n(EPC ISSUED)', count: processedData.filter(r => r.has_epc).length },
    { name: 'NON-COMPLIANT\n(NO EPC)', count: processedData.filter(r => !r.has_epc).length },
  ]

  // Risk Category Data
  const riskData = [
    { name: 'LOW', count: processedData.filter(r => r.risk_category === 'LOW').length },
    { name: 'MEDIUM', count: processedData.filter(r => r.risk_category === 'MEDIUM').length },
    { name: 'HIGH', count: processedData.filter(r => r.risk_category === 'HIGH').length },
  ]

  // Province Compliance Rate Data
  const provinceMap = {}
  processedData.forEach(row => {
    if (!provinceMap[row.Province]) {
      provinceMap[row.Province] = { compliant: 0, total: 0 }
    }
    provinceMap[row.Province].total++
    if (row.has_epc) provinceMap[row.Province].compliant++
  })

  const provinceData = Object.entries(provinceMap)
    .map(([prov, data]) => ({
      name: prov,
      rate: parseFloat(((data.compliant / data.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.rate - a.rate)

  const colors = ['#667eea', '#764ba2']
  const riskColors = ['#28a745', '#ffc107', '#dc3545']

  return (
    <div className="cr-charts-section">
      <h3>📊 Charts</h3>
      
      <div className="cr-charts-grid">
        {/* Compliance Status Chart */}
        <div className="cr-chart-container">
          <h4>Compliance Status Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#667eea">
                {complianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Category Chart */}
        <div className="cr-chart-container">
          <h4>Rule-Based Risk Category Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#667eea">
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={riskColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Province Compliance Rate Chart */}
      <div className="cr-chart-container-full">
        <h4>Compliance Rate by Province (%)</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={provinceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rate" fill="#667eea" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* Map Component */
function MapSection({ processedData }) {
  const mapRef = React.useRef(null)
  const [mapInstance, setMapInstance] = React.useState(null)

  const PROVINCE_COORDS = {
    'gauteng': [-26.2708, 28.1123],
    'kwazulu-natal': [-29.8587, 31.0218],
    'western cape': [-33.9249, 18.4241],
    'eastern cape': [-32.2968, 26.4194],
    'free state': [-29.0852, 26.1596],
    'limpopo': [-23.4013, 29.4179],
    'mpumalanga': [-25.5653, 30.5279],
    'north west': [-26.6639, 25.2838],
    'northern cape': [-29.0467, 21.8569],
  }

  React.useEffect(() => {
    if (!mapRef.current) return

    const map = L.map(mapRef.current).setView([-30.5595, 22.9375], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Leaflet | OpenStreetMap contributors',
    }).addTo(map)

    // Add province markers
    const provinceCounts = {}
    processedData.forEach(row => {
      if (!provinceCounts[row.Province]) {
        provinceCounts[row.Province] = 0
      }
      provinceCounts[row.Province]++
    })

    Object.entries(provinceCounts).forEach(([prov, count]) => {
      const coords = PROVINCE_COORDS[prov.toLowerCase()]
      if (coords) {
        const radius = Math.min(30, 5 + count / 50)
        L.circleMarker(coords, {
          radius: radius,
          fillColor: '#667eea',
          color: '#667eea',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.7,
        })
          .bindPopup(`${prov.toUpperCase()} | Buildings: ${count}`)
          .addTo(map)
      }
    })

    setMapInstance(map)

    return () => {
      map.remove()
    }
  }, [processedData])

  return (
    <div className="cr-map-section">
      <h3>🗺️ Map Dashboard (South Africa)</h3>
      <div ref={mapRef} className="cr-map-container"></div>
    </div>
  )
}

/* Policy Recommendations Component */
function PolicyRecommendations({ processedData }) {
  const recommendations = []

  // Province with lowest compliance
  const provinceMap = {}
  processedData.forEach(row => {
    if (!provinceMap[row.Province]) {
      provinceMap[row.Province] = { compliant: 0, total: 0 }
    }
    provinceMap[row.Province].total++
    if (row.has_epc) provinceMap[row.Province].compliant++
  })

  const worstProv = Object.entries(provinceMap).sort(
    (a, b) => ((a[1].compliant / a[1].total) * 100) - ((b[1].compliant / b[1].total) * 100)
  )[0]

  if (worstProv) {
    const rate = ((worstProv[1].compliant / worstProv[1].total) * 100).toFixed(1)
    recommendations.push(`Increase inspections in '${worstProv[0]}' (compliance rate: ${rate}%).`)
  }

  // High-risk buildings
  const highRiskCount = processedData.filter(r => r.risk_category === 'HIGH').length
  recommendations.push(`Prioritize audits for HIGH risk buildings: ${highRiskCount} flagged.`)

  // Smart metering adoption
  const smartMeterRate = (
    (processedData.filter(r => r.smart_metered_flag).length / processedData.length) * 100
  ).toFixed(1)
  recommendations.push(`Promote smart metering rollout (current smart-meter rate: ${smartMeterRate}%).`)

  // Occupancy type with lowest compliance
  const occupancyMap = {}
  processedData.forEach(row => {
    if (!occupancyMap[row['Occupancy Classification']]) {
      occupancyMap[row['Occupancy Classification']] = { compliant: 0, total: 0 }
    }
    occupancyMap[row['Occupancy Classification']].total++
    if (row.has_epc) occupancyMap[row['Occupancy Classification']].compliant++
  })

  const worstOcc = Object.entries(occupancyMap).sort(
    (a, b) => ((a[1].compliant / a[1].total) * 100) - ((b[1].compliant / b[1].total) * 100)
  )[0]

  if (worstOcc) {
    const rate = ((worstOcc[1].compliant / worstOcc[1].total) * 100).toFixed(1)
    recommendations.push(`Target enforcement for '${worstOcc[0]}' buildings (compliance rate: ${rate}%).`)
  }

  return (
    <div className="cr-recommendations-section">
      <h3>📌 Auto-Generated Policy Recommendations</h3>
      <div className="cr-recommendations-list">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="cr-recommendation-item">
            ✓ {rec}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClassificationResults
