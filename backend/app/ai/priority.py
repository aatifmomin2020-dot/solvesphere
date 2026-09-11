from typing import Dict, Any

def calculate_priority_score(
    people_affected: int,
    severity: str,
    frequency: str,
    evidence_url: str = None,
    description: str = ""
) -> Dict[str, Any]:
    """
    Calculates explainable priority score based on:
    0.4 * Impact + 0.3 * Urgency + 0.3 * Evidence Quality
    """
    # 1. Impact Score (0-100) based on population & severity
    if people_affected >= 5000:
        base_pop_score = 95.0
    elif people_affected >= 1000:
        base_pop_score = 85.0
    elif people_affected >= 200:
        base_pop_score = 70.0
    else:
        base_pop_score = 50.0

    sev_weights = {"CRITICAL": 1.0, "HIGH": 0.85, "MEDIUM": 0.65, "LOW": 0.45}
    sev_mult = sev_weights.get(severity.upper(), 0.65)
    impact_score = min(100.0, base_pop_score * (0.5 + 0.5 * sev_mult))

    # 2. Urgency Score (0-100) based on frequency and keyword triggers
    freq_scores = {"Continuous": 95.0, "Daily": 85.0, "Weekly": 70.0, "Monsoon": 90.0, "Occasional": 50.0}
    urgency_score = freq_scores.get(frequency, 75.0)
    
    # Keyword boost for urgent danger
    urgent_keywords = ["hazard", "children", "hospital", "school", "death", "electric", "flood", "fire"]
    desc_lower = description.lower()
    keyword_boost = sum(3.0 for kw in urgent_keywords if kw in desc_lower)
    urgency_score = min(100.0, urgency_score + keyword_boost)

    # 3. Evidence Quality Score (0-100)
    evidence_score = 85.0 if evidence_url else 60.0
    if len(description) > 150:
        evidence_score += 10.0
    evidence_score = min(100.0, evidence_score)

    # Calculate overall weighted priority score
    priority_score = (0.4 * impact_score) + (0.3 * urgency_score) + (0.3 * evidence_score)
    priority_score = round(priority_score, 1)

    # Classify Priority Level
    if priority_score >= 88.0 or severity.upper() == "CRITICAL":
        priority_level = "CRITICAL"
    elif priority_score >= 70.0:
        priority_level = "HIGH"
    elif priority_score >= 45.0:
        priority_level = "MEDIUM"
    else:
        priority_level = "LOW"

    return {
        "priority_score": priority_score,
        "impact_score": round(impact_score, 1),
        "urgency_score": round(urgency_score, 1),
        "evidence_score": round(evidence_score, 1),
        "priority_level": priority_level,
        "explanation": {
            "impact_factors": f"{people_affected} affected citizens with {severity} severity",
            "urgency_factors": f"Frequency: {frequency}, danger level analyzed",
            "evidence_factors": "Verified evidence attachment & detailed description provided"
        }
    }
