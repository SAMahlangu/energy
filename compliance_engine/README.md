# ⚡ Energy Compliance & Policy Recommendation Engine

A comprehensive Streamlit application for analyzing building energy compliance, calculating risk scores, and providing data-driven policy recommendations. Part of the Energy App ecosystem.

## 📋 Overview

This module provides stakeholders and policymakers with:
- Real-time compliance analysis of registered buildings vs. EPC-certified buildings
- Automated risk assessment using rule-based and ML-powered scoring
- Interactive geospatial visualization for South African provinces
- Data-driven policy recommendations
- Comprehensive reporting and export functionality

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip or conda

### Installation

1. Navigate to the compliance engine directory:
```bash
cd frontend/compliance_engine
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Streamlit app:
```bash
streamlit run src/app.py
```

The application will open at `http://localhost:8501`

## 📊 Features

### Compliance Dashboard
- **Key Metrics**: Total buildings, compliant/non-compliant counts, overall compliance rate
- **Compliance Status**: Matches registered buildings against EPC-issued records
- **Visual Charts**: 
  - Compliance status distribution
  - Risk category breakdown
  - Provincial compliance rates

### Risk Assessment
Two-level risk scoring system:

**1. Rule-Based Risk Score (0-100)**
Factors:
- Non-compliance status (+50)
- Number of floors (+5-15)
- Grid energy usage (+10)
- Multiple fuel sources (+5 each)
- Smart metering status (+10 if not equipped)
- Building occupancy type (+5-10 for high-risk)

Categories: **LOW** (0-30), **MEDIUM** (30-60), **HIGH** (60-100)

**2. Machine Learning Model**
Random Forest classifier trained to predict HIGH-risk buildings:
- **Features**: Entity type, ownership, size, occupancy, location, energy patterns
- **Accuracy**: Displayed in sidebar after training
- **Predictions**: Probability scores for all buildings

### Interactive Filters
- Search by Registration Number, City, or Province
- Filter by Risk Category (LOW/MEDIUM/HIGH)
- Filter by Compliance Status (COMPLIANT/NON-COMPLIANT)

### Geospatial Analysis
Interactive map showing:
- Building count distribution across provinces
- High-risk building clusters
- Province-level metrics
- Custom circle markers with tooltips

### Policy Recommendations
Automated recommendations based on:
- Provinces with lowest compliance rates
- Building occupancy types requiring enforcement
- Smart metering adoption strategies
- Priority audits for flagged high-risk buildings

### Export Functionality
Multiple report formats:
- **CSV Export**: Compliance data sorted by risk score
- **Excel Workbook**: Multi-sheet report with:
  - Compliance Buildings (full dataset)
  - Province Summary (compliance by province)
  - Occupancy Summary (compliance by building type)
  - Ownership Summary (compliance by ownership type)
  - Entity Summary (compliance by entity classification)
  - Policy Recommendations
  - EPC-Only Buildings (not in registry)

## 📂 Project Structure

```
compliance_engine/
├── src/
│   ├── app.py                 # Main Streamlit application
│   └── utils/
│       ├── __init__.py
│       ├── helpers.py         # Utility functions (scoring, export)
│       └── config.py          # Configuration (provinces, ML settings)
├── .streamlit/
│   └── config.toml           # Streamlit theme & settings
├── .gitignore
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## 📥 Input Datasets

### Required Files (Excel format)

**1. Building Registered on the NBEPR.xlsx**
- Registration Number (identifier)
- City
- Province
- Entity Type
- Ownership Type
- Occupancy Classification
- No. of Floors
- Size (1=Small, 2=Medium, 3=Large)
- Grid Usage (kWh)
- Gas Usage (kWh)
- Liquid Fuel Usage (kWh)
- Solid Fuel Usage (kWh)
- Renewable Usage (kWh)
- Other Usage (kWh)
- Billing Type
- Metering Type
- Is Smart Metered? (Yes/No)

**2. Building Issued with EPCs.xlsx**
- Registration Number (identifier)
- City
- Province
- Entity Type
- Ownership Type
- Occupancy Classification

## 🤖 ML Model Details

### Model Type
Random Forest Classifier with 200 estimators

### Training Process
1. Generates HIGH-risk target based on rule-based risk categories
2. Splits data: 80% training, 20% testing
3. Applies preprocessing:
   - Categorical: OneHotEncoder
   - Numeric: Pass-through (after missing value imputation)
4. Trains pipeline with balanced class weights

### Features
- **Categorical** (8): Entity Type, Ownership Type, Size, Occupancy Classification, Billing Type, Metering Type, Province, City
- **Numeric** (12): Floors, Smart Metering Flag, Grid/Gas/Liquid/Solid/Renewable/Other Energy Usage + derivatives

### Output
- Binary predictions (HIGH risk: 1, NOT high risk: 0)
- Probability scores (0-1) for each building

## 🗺️ Geographic Configuration

Supports all 9 South African provinces with predetermined coordinates:
- Gauteng
- KwaZulu-Natal
- Western Cape
- Eastern Cape
- Free State
- Limpopo
- Mpumalanga
- North West
- Northern Cape

## ⚙️ Configuration

Edit `.streamlit/config.toml` to customize:
- **Theme**: Colors, fonts
- **Client**: Error details verbosity
- **Server**: Upload file size limits
- **Logger**: Log level

## 📦 Dependencies

Core libraries:
- **Streamlit** - Web app framework
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Scikit-learn** - Machine learning
- **Matplotlib** - Visualization
- **Folium** - Map visualization
- **OpenPyXL** - Excel export

See `requirements.txt` for specific versions.

## 🔄 Data Flow

```
Upload Excel Files
        ↓
Validate & Clean Data
        ↓
Match Registration & EPC Records
        ↓
Feature Engineering & Risk Scoring
        ↓
Train ML Model (Optional)
        ↓
Generate Visualizations & Reports
        ↓
Export (CSV/Excel)
```

## 🎛️ User Controls

**Sidebar:**
- Dataset upload (drag & drop)
- ML model training toggle with accuracy display

**Main Panel:**
- Key metrics dashboard
- Interactive search & filters
- Sortable data table
- Multi-tab charts
- Geospatial map with layer selection
- Export buttons

## 📊 Example Workflows

### Workflow 1: Compliance Audit
1. Upload both datasets
2. View dashboard metrics
3. Filter by Province
4. Export CSV for field audit

### Workflow 2: Risk-Based Inspection Planning
1. Upload datasets
2. Filter by HIGH risk category
3. View by Province on map
4. Export building list for inspectors

### Workflow 3: Policy Analysis
1. Upload datasets
2. Train ML model
3. Review auto-generated recommendations
4. Export full Excel report
5. Analyze trends by occupancy type

## 🐛 Troubleshooting

**Issue**: App won't start
- Check Python version: `python --version` (should be 3.8+)
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

**Issue**: Memory error with large dataset
- Streamlit has upload limit of 100MB by default
- Modify `.streamlit/config.toml`: `maxUploadSize = 200`

**Issue**: Map not rendering
- Check internet connection (Folium needs tile server access)
- Verify province names match config exactly (lowercase)

**Issue**: ML model fails
- Check for missing values in data
- Ensure all required columns are present
- Review console output for specific error

## 📝 License

Internal use only - Energy Compliance & Policy Recommendation Engine

## 🤝 Integration

**Part of Energy App Ecosystem:**
- Backend: Flask API (`/backend`)
- Frontend: React Dashboard (`/frontend`)
- Compliance Engine: Streamlit App (`/frontend/compliance_engine`)
- Building Classification: ML Models (`/backend/models`)

## 📧 Support

For issues, feature requests, or questions, contact the development team or refer to main project README.

## 🚀 Future Enhancements

- Live energy data integration via APIs
- Advanced clustering for building portfolios
- Predictive energy savings modeling
- Cost-benefit analysis tools
- Multi-year trend analysis
- Custom risk scoring configuration
- Role-based access control
- Real-time data updates
