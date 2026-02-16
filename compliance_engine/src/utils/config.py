"""
Configuration settings for Energy Compliance & Policy Recommendation Engine
"""

# South Africa Province Coordinates (approximate center points)
PROVINCE_COORDS = {
    "gauteng": (-26.2708, 28.1123),
    "kwazulu-natal": (-29.8587, 31.0218),
    "western cape": (-33.9249, 18.4241),
    "eastern cape": (-32.2968, 26.4194),
    "free state": (-29.0852, 26.1596),
    "limpopo": (-23.4013, 29.4179),
    "mpumalanga": (-25.5653, 30.5279),
    "north west": (-26.6639, 25.2838),
    "northern cape": (-29.0467, 21.8569)
}

# South Africa center for map initialization
MAP_CENTER = [-30.5595, 22.9375]
MAP_ZOOM = 5

# Risk score thresholds
RISK_BINS = [-1, 30, 60, 100]
RISK_LABELS = ["LOW", "MEDIUM", "HIGH"]

# ML Model settings
ML_MODEL_CONFIG = {
    "n_estimators": 200,
    "random_state": 42,
    "class_weight": "balanced",
    "test_size": 0.2
}

# Energy columns
ENERGY_COLS = [
    "Grid Usage",
    "Gas Usage",
    "Liquid Fuel Usage",
    "Solid Fuel Usage",
    "Renewable Usage",
    "Other Usage"
]

# Feature columns for ML
CATEGORICAL_FEATURES = [
    "Entity Type",
    "Ownership Type",
    "Size",
    "Occupancy Classification",
    "Billing Type",
    "Metering Type",
    "Province",
    "City"
]

NUMERIC_FEATURES = [
    "floors_num",
    "smart_metered_flag"
] + ENERGY_COLS
