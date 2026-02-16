import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation'
import SideNavigation from '../components/SideNavigation'
import AnomalyDetectionForm from '../components/AnomalyDetectionForm'
import AnomalyDetectionResults from '../components/AnomalyDetectionResults'
import '../styles/BuildingClassification.css'

function AnomalyDetection() {
  const [sideNavOpen, setSideNavOpen] = useState(true)
  const [detectionResults, setDetectionResults] = useState(null)
  const location = useLocation()

  const handleMenuToggle = () => {
    setSideNavOpen(!sideNavOpen)
  }

  const handleDetect = (results) => {
    setDetectionResults(results)
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
            <AnomalyDetectionForm onDetect={handleDetect} />
            {detectionResults && (
              <div id="results-section">
                <AnomalyDetectionResults results={detectionResults} />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default AnomalyDetection
