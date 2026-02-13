import React, { useState } from 'react'
import TopNavigation from '../components/TopNavigation'
import SideNavigation from '../components/SideNavigation'
import EnergyEfficiencyForm from '../components/EnergyEfficiencyForm'
import EnergyEfficiencyResults from '../components/EnergyEfficiencyResults'
import '../styles/EnergyEfficiency.css'

export default function EnergyEfficiency() {
  const [sideNavOpen, setSideNavOpen] = useState(true)
  const [predictionResults, setPredictionResults] = useState(null)

  const handlePrediction = (results) => {
    setPredictionResults(results)
    // Scroll to results
    setTimeout(() => {
      document.getElementById('energy-efficiency-results-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="energy-efficiency-main-container">
      <TopNavigation />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNavigation open={sideNavOpen} setOpen={setSideNavOpen} />
        <div className="energy-efficiency-main-content">
          <div className="energy-efficiency-container">
            <EnergyEfficiencyForm onPrediction={handlePrediction} />
            {predictionResults && (
              <div id="energy-efficiency-results-section">
                <EnergyEfficiencyResults prediction={predictionResults} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
