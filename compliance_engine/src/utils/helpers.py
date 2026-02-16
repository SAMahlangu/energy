import pandas as pd
import numpy as np
from io import BytesIO


def clean_text(x):
    """Clean and normalize text input."""
    if pd.isna(x):
        return ""
    return str(x).strip().lower()


def safe_num(x):
    """Safely convert value to float, returning NaN on failure."""
    try:
        return float(x)
    except:
        return np.nan


def compute_risk_rule_based(row):
    """
    Compute a rule-based risk score (0-100) for a building.
    
    Scoring factors:
    - Non-compliance: +50
    - Floors: +5-15
    - Grid usage: +10
    - Fuel sources: +5 each
    - Smart metering: +10 if not smart metered
    - Occupancy: +5-10 for high-risk types
    """
    score = 0

    # Non-compliance
    if str(row["compliance_status"]).startswith("NON"):
        score += 50

    # Floors
    floors = row.get("floors_num", np.nan)
    if not np.isnan(floors):
        if floors >= 10:
            score += 15
        elif floors >= 5:
            score += 10
        elif floors >= 2:
            score += 5

    # Grid usage
    grid = row.get("Grid Usage", 0)
    if pd.notna(grid) and grid > 0:
        score += 10

    # Fuel sources
    fuel_sources = 0
    for c in ["Gas Usage", "Liquid Fuel Usage", "Solid Fuel Usage"]:
        if row.get(c, 0) > 0:
            fuel_sources += 1
    score += fuel_sources * 5

    # Smart metering
    if not row.get("smart_metered_flag", False):
        score += 10

    # Occupancy risk
    occ = row.get("Occupancy Classification", "")
    if "hospital" in occ or "health" in occ:
        score += 10
    if "office" in occ:
        score += 5
    if "school" in occ or "education" in occ:
        score += 5

    return min(100, score)


def compliance_rate_table(df, group_col):
    """
    Generate compliance rate summary table grouped by column.
    
    Returns DataFrame with compliance statistics or None if column not present.
    """
    if group_col not in df.columns:
        return None
    table = df.groupby(group_col)["has_epc"].agg(["count", "sum"])
    table.rename(columns={"count": "total_buildings", "sum": "compliant_buildings"}, inplace=True)
    table["non_compliant_buildings"] = table["total_buildings"] - table["compliant_buildings"]
    table["compliance_rate_%"] = (table["compliant_buildings"] / table["total_buildings"]) * 100
    return table.sort_values("compliance_rate_%", ascending=False)


def to_excel_download(df_main, province_summary, occupancy_summary, ownership_summary, entity_summary, recommendations, epc_only):
    """
    Generate multi-sheet Excel workbook for export.
    
    Returns BytesIO object containing the Excel file.
    """
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df_main.to_excel(writer, sheet_name="Compliance_Buildings", index=False)
        if province_summary is not None:
            province_summary.to_excel(writer, sheet_name="Province_Summary")
        if occupancy_summary is not None:
            occupancy_summary.to_excel(writer, sheet_name="Occupancy_Summary")
        if ownership_summary is not None:
            ownership_summary.to_excel(writer, sheet_name="Ownership_Summary")
        if entity_summary is not None:
            entity_summary.to_excel(writer, sheet_name="Entity_Summary")

        pd.DataFrame({"Policy Recommendations": recommendations}).to_excel(writer, sheet_name="Recommendations", index=False)
        epc_only.to_excel(writer, sheet_name="EPC_Only_Not_Registered", index=False)

    return output.getvalue()
