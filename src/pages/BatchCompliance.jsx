import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation'
import SideNavigation from '../components/SideNavigation'
import BuildingClassificationForm from '../components/BuildingClassificationForm'
import ClassificationResults from '../components/ClassificationResults'
import '../styles/BuildingClassification.css'

function BatchCompliance() {
  const [sideNavOpen, setSideNavOpen] = useState(true)
  const [batchRegistryData, setBatchRegistryData] = useState(null)
  const [batchEpcData, setBatchEpcData] = useState(null)
  const location = useLocation()

  const handleMenuToggle = () => {
    setSideNavOpen(!sideNavOpen)
  }

  const handleBatchDataLoaded = (data) => {
    setBatchRegistryData(data.registry)
    setBatchEpcData(data.epc)
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
            <h1 style={{ color: '#333', marginBottom: '2rem' }}>Batch Compliance Analysis</h1>
            <BuildingClassificationForm 
              onClassify={() => {}}
              onBatchDataLoaded={handleBatchDataLoaded}
              batchModeOnly={true}
            />
            {batchRegistryData && batchEpcData && (
              <div id="results-section">
                <ClassificationResults 
                  registryData={batchRegistryData}
                  epcData={batchEpcData}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default BatchCompliance
