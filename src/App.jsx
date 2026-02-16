import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NEAFS from './pages/NEAFS'
import BuildingClassification from './pages/BuildingClassification'
import BatchCompliance from './pages/BatchCompliance'
import AnomalyDetection from './pages/AnomalyDetection'
import RenewableEnergy from './pages/RenewableEnergy'
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
        <Route path="/analytics/batch-compliance" element={<BatchCompliance />} />
        <Route path="/analytics/anomaly-detection" element={<AnomalyDetection />} />
        <Route path="/analytics/renewable-energy" element={<RenewableEnergy />} />
        <Route path="/analytics/epc-analysis" element={<EPCAnalysis />} />
        <Route path="/energy-efficiency" element={<EnergyEfficiency />} />
      </Routes>
    </Router>
  )
}

export default App
