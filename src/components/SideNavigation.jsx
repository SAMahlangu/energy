import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/SideNavigation.css'

function SideNavigation({ isOpen, open }) {
  // Accept both `isOpen` (used in some pages) and `open` (used in others)
  const [expandedMenu, setExpandedMenu] = useState(null)
  const visible = typeof isOpen !== 'undefined' ? isOpen : open

  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/', submenu: null },
    { icon: '⚡', label: 'NEAFS', fullName: 'National Energy Analytics & Forecasting System', href: '/neafs', submenu: null },    
    { icon: '🏛️', label: 'Energy Efficiency Rating', fullName: 'Energy Efficiency Rating Prediction', href: '/energy-efficiency', submenu: null },
    { icon: '🔧', label: 'EPC Impact Analysis', fullName: 'EPC Impact Analysis & Energy Savings Forecasting', href: '/analytics/epc-analysis', submenu: null },
    { icon: '🏢', label: 'Building Classification', href: '/analytics/building-classification', submenu: null },
    { icon: '📋', label: 'Batch Compliance', fullName: 'Batch Compliance Analysis', href: '/analytics/batch-compliance', submenu: null },
    { icon: '🔍', label: 'Anomaly Detection', fullName: 'Energy Anomaly Detector', href: '/analytics/anomaly-detection', submenu: null },
    { icon: '☀️', label: 'Renewable Energy', fullName: 'Renewable Energy Adoption Potential', href: '/analytics/renewable-energy', submenu: null },
    // { icon: '💰', label: 'Billing', href: '#billing', submenu: null },
    // { icon: '⚙️', label: 'Settings', href: '#settings', submenu: null },
  ]

  const toggleSubmenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index)
  }

  return (
    <aside className={`side-nav ${visible ? 'open' : 'closed'}`}>
      <div className="nav-header">
        <h2>Menu</h2>
      </div>

      <ul className="nav-menu">
        {menuItems.map((item, index) => (
          <li key={index} className="nav-item">
            {item.submenu ? (
              <>
                <div 
                  className="nav-link submenu-trigger"
                  onClick={() => toggleSubmenu(index)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <span className={`submenu-icon ${expandedMenu === index ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
                {expandedMenu === index && (
                  <ul className="submenu">
                    {item.submenu.map((subitem, subindex) => (
                      <li key={subindex} className="submenu-item">
                        <Link to={subitem.href} className="submenu-link">
                          {subitem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : item.href.startsWith('/') ? (
              <Link 
                to={item.href} 
                className="nav-link"
                title={item.fullName || item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ) : (
              <a 
                href={item.href} 
                className="nav-link"
                title={item.fullName || item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="nav-footer">
        <p>Energy App v1.0</p>
      </div>
    </aside>
  )
}

export default SideNavigation
