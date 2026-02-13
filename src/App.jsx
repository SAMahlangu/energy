import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NEAFS from './pages/NEAFS'
import BuildingClassification from './pages/BuildingClassification'
import EPCAnalysis from './pages/EPCAnalysis'
import EnergyEfficiency from './pages/EnergyEfficiency'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/neafs" element={<NEAFS />} />
        <Route path="/analytics/building-classification" element={<BuildingClassification />} />
        <Route path="/analytics/epc-analysis" element={<EPCAnalysis />} />
        <Route path="/energy-efficiency" element={<EnergyEfficiency />} />
      </Routes>
    </Router>
  )
}

export default App
