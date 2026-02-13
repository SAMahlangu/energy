import React, { useState } from 'react'
import '../styles/TopNavigation.css'

function TopNavigation({ onMenuToggle, currentPage }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const fullProjectName = 'National Energy Analytics & Forecasting System'
  const acronym = 'NEAFS'

  // Show full name on NEAFS page, acronym otherwise
  const isNEAFSPage = currentPage === '/neafs'
  const displayName = isNEAFSPage ? fullProjectName : acronym
  const [showFullName, setShowFullName] = useState(isNEAFSPage)

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div 
          className="app-title-container"
          onClick={() => setShowFullName(!showFullName)}
          onMouseEnter={() => setShowFullName(true)}
          onMouseLeave={() => !isNEAFSPage && setShowFullName(false)}
        >
          <h1 className="app-title">
            {isNEAFSPage ? fullProjectName : (showFullName ? fullProjectName : acronym)}
          </h1>
          {(showFullName && !isNEAFSPage) && <div className="tooltip-arrow"></div>}
        </div>
      </div>

      <div className="nav-right">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>

        <div className="nav-icons">
          <button className="icon-btn notification">
            <span className="icon">🔔</span>
            <span className="badge">3</span>
          </button>

          <div className="profile-menu">
            <button
              className="icon-btn profile"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <span className="icon">👤</span>
            </button>

            {isProfileOpen && (
              <div className="dropdown-menu">
                <a href="#profile">My Profile</a>
                <a href="#settings">Settings</a>
                <a href="#help">Help & Support</a>
                <hr />
                <a href="#logout">Logout</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation
