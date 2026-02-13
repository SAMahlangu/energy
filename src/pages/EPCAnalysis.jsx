import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '../components/TopNavigation';
import SideNavigation from '../components/SideNavigation';
import EPCForm from '../components/EPCForm';
import EPCResults from '../components/EPCResults';
import '../styles/EPCAnalysis.css';

export default function EPCAnalysis() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  const [analysisResults, setAnalysisResults] = useState(null);
  const navigate = useNavigate();

  const handleAnalysis = (results) => {
    setAnalysisResults(results);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('epc-results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="epc-main-container">
      <TopNavigation />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNavigation open={sideNavOpen} setOpen={setSideNavOpen} />
        <div className="epc-main-content">
          <div className="epc-container">
            <EPCForm onAnalysis={handleAnalysis} />
            {analysisResults && (
              <div id="epc-results-section">
                <EPCResults results={analysisResults} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
