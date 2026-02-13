import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation'
import SideNavigation from '../components/SideNavigation'
import PredictionForm from '../components/PredictionForm'
import PredictionResults from '../components/PredictionResults'
import '../styles/NEAFS.css'

function NEAFS() {
  const [sideNavOpen, setSideNavOpen] = useState(true)
  const [predictionResults, setPredictionResults] = useState(null)
  const location = useLocation()

  const handleMenuToggle = () => {
    setSideNavOpen(!sideNavOpen)
  }

  const handlePrediction = (results) => {
    setPredictionResults(results)
    // Scroll to results
    setTimeout(() => {
      const resultsSection = document.getElementById('results-section')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <div className="neafs-main-container">
      <TopNavigation onMenuToggle={handleMenuToggle} currentPage={location.pathname} />
      <SideNavigation isOpen={sideNavOpen} />
      
      <main className="neafs-main-content">
        <div className="neafs-centered-container">
          <section className="prediction-section">
            <PredictionForm onPredict={handlePrediction} />
            {predictionResults && (
              <div id="results-section">
                <PredictionResults 
                  predictions={predictionResults}
                  formData={predictionResults.formData}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default NEAFS
