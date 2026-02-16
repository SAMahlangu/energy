import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from io import BytesIO

# ML
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.ensemble import RandomForestClassifier

# Map
import folium
from streamlit_folium import st_folium
from geopy.geocoders import Nominatim

# Import local utilities
from utils.helpers import (
    clean_text,
    safe_num,
    compute_risk_rule_based,
    compliance_rate_table,
    to_excel_download
)
from utils.config import PROVINCE_COORDS


st.set_page_config(page_title="Energy Compliance Engine (ML + Map)", layout="wide")


# =========================
# Sidebar Upload
# =========================
st.title("⚡ Energy Compliance & Policy Recommendation Engine (ML + Map)")

st.sidebar.header("📂 Upload Datasets")
uploaded_reg = st.sidebar.file_uploader("Upload: Building Registered on the NBEPR.xlsx", type=["xlsx"])
uploaded_epc = st.sidebar.file_uploader("Upload: Building Issued with EPCs.xlsx", type=["xlsx"])

if uploaded_reg is None or uploaded_epc is None:
    st.warning("Please upload BOTH datasets to continue.")
    st.stop()

# =========================
# Load Data
# =========================
df_reg = pd.read_excel(uploaded_reg)
df_epc = pd.read_excel(uploaded_epc)

df_reg.columns = [c.strip() for c in df_reg.columns]
df_epc.columns = [c.strip() for c in df_epc.columns]

# Registration key
df_reg["reg_key"] = df_reg["Registration Number"].astype(str).str.strip() if "Registration Number" in df_reg.columns else ""
df_epc["reg_key"] = df_epc["Registration Number"].astype(str).str.strip() if "Registration Number" in df_epc.columns else ""

# Clean text columns
for col in ["City", "Province", "Entity Type", "Ownership Type", "Occupancy Classification", "Billing Type", "Metering Type"]:
    if col in df_reg.columns:
        df_reg[col] = df_reg[col].apply(clean_text)
    else:
        df_reg[col] = ""

for col in ["City", "Province", "Entity Type", "Ownership Type", "Occupancy Classification"]:
    if col in df_epc.columns:
        df_epc[col] = df_epc[col].apply(clean_text)
    else:
        df_epc[col] = ""

# =========================
# Compliance Matching
# =========================
df_reg["has_epc"] = df_reg["reg_key"].isin(df_epc["reg_key"])
df_reg["compliance_status"] = np.where(df_reg["has_epc"], "COMPLIANT (EPC ISSUED)", "NON-COMPLIANT (NO EPC)")

df_epc["is_registered"] = df_epc["reg_key"].isin(df_reg["reg_key"])
df_epc_only = df_epc[df_epc["is_registered"] == False].copy()

# =========================
# Feature Engineering
# =========================
df_reg["floors_num"] = df_reg["No. of Floors"].apply(safe_num) if "No. of Floors" in df_reg.columns else np.nan

energy_cols = ["Grid Usage", "Gas Usage", "Liquid Fuel Usage", "Solid Fuel Usage", "Renewable Usage", "Other Usage"]
for c in energy_cols:
    if c in df_reg.columns:
        df_reg[c] = pd.to_numeric(df_reg[c], errors="coerce")
    else:
        df_reg[c] = 0

if "Is Smart Metered?" in df_reg.columns:
    df_reg["smart_metered_flag"] = df_reg["Is Smart Metered?"].astype(str).str.lower().str.contains("yes|true|1")
else:
    df_reg["smart_metered_flag"] = False

# Rule-based risk score
df_reg["risk_score_rule"] = df_reg.apply(compute_risk_rule_based, axis=1)
df_reg["risk_category_rule"] = pd.cut(df_reg["risk_score_rule"], bins=[-1, 30, 60, 100], labels=["LOW", "MEDIUM", "HIGH"])

# =========================
# ML MODEL (Predict HIGH Risk)
# =========================
st.sidebar.header("🤖 ML Risk Model Settings")
train_ml = st.sidebar.checkbox("Train ML Risk Model", value=True)

if train_ml:
    # Target: High risk based on rule-based system
    df_reg["high_risk_target"] = (df_reg["risk_category_rule"] == "HIGH").astype(int)

    # Select features
    feature_cols = [
        "Entity Type", "Ownership Type", "Size", "Occupancy Classification",
        "Billing Type", "Metering Type", "Province", "City",
        "floors_num", "smart_metered_flag"
    ] + energy_cols

    for c in feature_cols:
        if c not in df_reg.columns:
            df_reg[c] = np.nan

    X = df_reg[feature_cols].copy()
    y = df_reg["high_risk_target"].copy()

    # Convert bool to int
    if "smart_metered_flag" in X.columns:
        X["smart_metered_flag"] = X["smart_metered_flag"].astype(int)

    # Separate categorical and numeric
    categorical_features = [
        "Entity Type", "Ownership Type", "Size", "Occupancy Classification",
        "Billing Type", "Metering Type", "Province", "City"
    ]
    numeric_features = ["floors_num"] + energy_cols + ["smart_metered_flag"]

    # Fill missing
    for c in numeric_features:
        X[c] = pd.to_numeric(X[c], errors="coerce").fillna(0)

    for c in categorical_features:
        X[c] = X[c].astype(str).fillna("unknown")

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("num", "passthrough", numeric_features),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced"
    )

    pipeline = Pipeline(steps=[("prep", preprocessor), ("model", model)])

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    # Predict for all
    df_reg["ml_high_risk_pred"] = pipeline.predict(X)
    df_reg["ml_high_risk_prob"] = pipeline.predict_proba(X)[:, 1]

    st.sidebar.success(f"ML Model Trained ✅ Accuracy: {acc:.2f}")

# =========================
# Summary Tables
# =========================
province_summary = compliance_rate_table(df_reg, "Province")
occupancy_summary = compliance_rate_table(df_reg, "Occupancy Classification")
ownership_summary = compliance_rate_table(df_reg, "Ownership Type")
entity_summary = compliance_rate_table(df_reg, "Entity Type")

# =========================
# Recommendations
# =========================
recommendations = []
if province_summary is not None and len(province_summary) > 0:
    worst_province = province_summary.sort_values("compliance_rate_%").head(1)
    wp_name = worst_province.index[0]
    wp_rate = worst_province["compliance_rate_%"].values[0]
    recommendations.append(f"Increase inspections in '{wp_name}' (compliance rate: {wp_rate:.1f}%).")

if occupancy_summary is not None and len(occupancy_summary) > 0:
    worst_occ = occupancy_summary.sort_values("compliance_rate_%").head(1)
    occ_name = worst_occ.index[0]
    occ_rate = worst_occ["compliance_rate_%"].values[0]
    recommendations.append(f"Target enforcement for '{occ_name}' buildings (compliance rate: {occ_rate:.1f}%).")

smart_meter_rate = df_reg["smart_metered_flag"].mean() * 100
recommendations.append(f"Promote smart metering rollout (current smart-meter rate: {smart_meter_rate:.1f}%).")

high_risk_count = (df_reg["risk_category_rule"] == "HIGH").sum()
recommendations.append(f"Prioritize audits for HIGH risk buildings: {high_risk_count} flagged.")

# =========================
# Dashboard Metrics
# =========================
st.subheader("📌 Key Metrics")
col1, col2, col3, col4 = st.columns(4)

total_buildings = len(df_reg)
compliant = df_reg["has_epc"].sum()
non_compliant = total_buildings - compliant
compliance_rate = (compliant / total_buildings) * 100

col1.metric("Total Buildings", total_buildings)
col2.metric("Compliant Buildings", int(compliant))
col3.metric("Non-Compliant Buildings", int(non_compliant))
col4.metric("Compliance Rate", f"{compliance_rate:.1f}%")

st.divider()

# =========================
# Filters + Search
# =========================
st.subheader("🔎 Search & Filters")

search = st.text_input("Search by Registration Number / City / Province")

risk_filter = st.selectbox("Filter by Rule-Based Risk Category", ["ALL", "LOW", "MEDIUM", "HIGH"])
status_filter = st.selectbox("Filter by Compliance Status", ["ALL", "COMPLIANT (EPC ISSUED)", "NON-COMPLIANT (NO EPC)"])

filtered_df = df_reg.copy()

if search.strip():
    s = search.strip().lower()
    filtered_df = filtered_df[
        filtered_df["reg_key"].astype(str).str.lower().str.contains(s) |
        filtered_df["City"].astype(str).str.lower().str.contains(s) |
        filtered_df["Province"].astype(str).str.lower().str.contains(s)
    ]

if risk_filter != "ALL":
    filtered_df = filtered_df[filtered_df["risk_category_rule"] == risk_filter]

if status_filter != "ALL":
    filtered_df = filtered_df[filtered_df["compliance_status"] == status_filter]

st.write(f"Showing **{len(filtered_df)}** buildings after filtering.")
st.dataframe(filtered_df.sort_values("risk_score_rule", ascending=False), use_container_width=True)

st.divider()

# =========================
# Charts
# =========================
st.subheader("📊 Charts")

c1, c2 = st.columns(2)

with c1:
    st.write("### Compliance Status Distribution")
    fig1 = plt.figure(figsize=(6, 4))
    df_reg["compliance_status"].value_counts().plot(kind="bar")
    plt.xlabel("Status")
    plt.ylabel("Count")
    plt.xticks(rotation=20)
    plt.tight_layout()
    st.pyplot(fig1)

with c2:
    st.write("### Rule-Based Risk Category Distribution")
    fig2 = plt.figure(figsize=(6, 4))
    df_reg["risk_category_rule"].value_counts().plot(kind="bar")
    plt.xlabel("Risk Category")
    plt.ylabel("Count")
    plt.tight_layout()
    st.pyplot(fig2)

if province_summary is not None:
    st.write("### Compliance Rate by Province (%)")
    fig3 = plt.figure(figsize=(10, 4))
    province_summary["compliance_rate_%"].sort_values(ascending=False).plot(kind="bar")
    plt.xlabel("Province")
    plt.ylabel("Compliance Rate (%)")
    plt.xticks(rotation=45)
    plt.tight_layout()
    st.pyplot(fig3)

# =========================
# MAP DASHBOARD
# =========================
st.divider()
st.subheader("🗺️ Map Dashboard (South Africa)")

map_mode = st.selectbox("Map View", ["Buildings Count per Province", "High Risk per Province"])

m = folium.Map(location=[-30.5595, 22.9375], zoom_start=5)

if map_mode == "Buildings Count per Province":
    prov_counts = df_reg["Province"].value_counts()
    for prov, count in prov_counts.items():
        if prov in PROVINCE_COORDS:
            lat, lon = PROVINCE_COORDS[prov]
            folium.CircleMarker(
                location=[lat, lon],
                radius=min(30, 5 + count / 50),
                popup=f"{prov.title()} | Buildings: {count}",
                fill=True
            ).add_to(m)

elif map_mode == "High Risk per Province":
    prov_high = df_reg[df_reg["risk_category_rule"] == "HIGH"]["Province"].value_counts()
    for prov, count in prov_high.items():
        if prov in PROVINCE_COORDS:
            lat, lon = PROVINCE_COORDS[prov]
            folium.CircleMarker(
                location=[lat, lon],
                radius=min(30, 5 + count / 30),
                popup=f"{prov.title()} | HIGH Risk: {count}",
                fill=True
            ).add_to(m)

st_folium(m, width=1100, height=500)

# =========================
# Recommendations
# =========================
st.divider()
st.subheader("📌 Auto Policy Recommendations")

for rec in recommendations:
    st.success(rec)

# =========================
# Export
# =========================
st.divider()
st.subheader("⬇️ Export Reports")

df_export = df_reg.sort_values("risk_score_rule", ascending=False).copy()

csv_data = df_export.to_csv(index=False).encode("utf-8")
st.download_button("📥 Download Compliance CSV", data=csv_data, file_name="Compliance_Buildings_Output.csv", mime="text/csv")

excel_data = to_excel_download(
    df_export, province_summary, occupancy_summary, ownership_summary, entity_summary,
    recommendations, df_epc_only
)
st.download_button(
    "📥 Download Full Excel Report",
    data=excel_data,
    file_name="Energy_Compliance_Engine_Output.xlsx",
    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)

st.info(f"EPC-only buildings not found in Registered dataset: {len(df_epc_only)}")

if train_ml:
    st.divider()
    st.subheader("🤖 ML Risk Model Results")

    st.write("### Sample Predictions (Top 20 Most Likely HIGH Risk)")
    top_ml = df_reg.sort_values("ml_high_risk_prob", ascending=False).head(20)
    st.dataframe(top_ml[["Registration Number", "Province", "City", "compliance_status", "risk_score_rule", "ml_high_risk_prob"]], use_container_width=True)

    st.write("### Explanation")
    st.info("The ML model learns patterns from your rule-based risk labels and predicts which buildings are likely HIGH risk.")
