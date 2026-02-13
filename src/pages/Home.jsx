import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation'
import SideNavigation from '../components/SideNavigation'
import '../styles/Home.css'

function Home() {
  const [sideNavOpen, setSideNavOpen] = useState(true)
  const location = useLocation()

  const handleMenuToggle = () => {
    setSideNavOpen(!sideNavOpen)
  }

  return (
    <div className="home-container">
      <TopNavigation onMenuToggle={handleMenuToggle} currentPage={location.pathname} />
      <SideNavigation isOpen={sideNavOpen} />

      <main className="main-content">
        <div className="content-wrapper">
          <h1>Welcome to Energy App</h1>
          <p>Manage and monitor your energy consumption efficiently</p>

          <div className="dashboard-grid">
            <div className="card">
              <div className="card-icon">⚡</div>
              <h3>Current Usage</h3>
              <p className="card-value">2.4 kW</p>
              <p className="card-status">24% above average</p>
            </div>

            <div className="card">
              <div className="card-icon">💰</div>
              <h3>Monthly Cost</h3>
              <p className="card-value">R48.50</p>
              <p className="card-status">Last 30 days</p>
            </div>

            <div className="card">
              <div className="card-icon">📊</div>
              <h3>Energy Saved</h3>
              <p className="card-value">15%</p>
              <p className="card-status">This month</p>
            </div>

            <div className="card">
              <div className="card-icon">🌱</div>
              <h3>Carbon Saved</h3>
              <p className="card-value">120 kg CO₂</p>
              <p className="card-status">Equivalent to 1 tree</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
