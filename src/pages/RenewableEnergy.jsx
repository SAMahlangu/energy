import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation'
import SideNavigation from '../components/SideNavigation'
import RenewableEnergyForm from '../components/RenewableEnergyForm'
import RenewableEnergyResults from '../components/RenewableEnergyResults'
import '../styles/BuildingClassification.css'

function RenewableEnergy() {
  const [sideNavOpen, setSideNavOpen] = useState(true)
  const [analysisResults, setAnalysisResults] = useState(null)
  const location = useLocation()

  const handleMenuToggle = () => {
    setSideNavOpen(!sideNavOpen)
  }

  const handleAnalyze = (results) => {
    setAnalysisResults(results)
    // Scroll to results
    setTimeout(() => {
      const resultsSection = document.getElementById('results-section')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <div className="bc-main-container">
      <TopNavigation onMenuToggle={handleMenuToggle} currentPage={location.pathname} />
      <SideNavigation isOpen={sideNavOpen} />
      
      <main className="bc-main-content">
        <div className="bc-centered-container">
          <section className="bc-section">
            <RenewableEnergyForm onAnalyze={handleAnalyze} />
            {analysisResults && (
              <div id="results-section">
                <RenewableEnergyResults results={analysisResults} />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default RenewableEnergy
