import re
from typing import Dict, Tuple

CATEGORIES = {
    "Environment": ["flooding", "waterlogging", "pollution", "air quality", "rain", "drainage", "waste", "garbage", "deforestation"],
    "Healthcare": ["hospital", "clinic", "disease", "ambulance", "sanitation", "mental health", "medical", "doctor", "beds"],
    "Education": ["school", "teacher", "classroom", "books", "literacy", "students", "learning", "dropout"],
    "Transportation": ["pothole", "traffic", "bus", "road", "railway", "signal", "accident", "commute", "bridge"],
    "Public Safety": ["crime", "street light", "CCTV", "police", "harassment", "fire", "security", "dark alley"],
    "Water & Sanitation": ["water supply", "drinking water", "sewage", "toilet", "contamination", "pipeline", "leakage"],
    "Waste Management": ["garbage dump", "plastic waste", "recycling", "compost", "landfill", "litter"],
    "Agriculture": ["farmer", "crop", "irrigation", "soil", "pest", "fertilizer", "storage", "harvest"],
    "Smart City": ["smart pole", "sensor", "digital kiosk", "wifi", "urban planning", "e-governance"],
    "Accessibility": ["wheelchair", "ramp", "braille", "disability", "elderly", "accessible transport"],
    "Energy": ["power cut", "solar", "electricity", "transformer", "grid", "outage"]
}

SUB_CATEGORIES = {
    "Environment": ["Urban Drainage", "Air Quality Monitoring", "Green Infrastructure", "Waste Management"],
    "Healthcare": ["Emergency Response", "Primary Health Services", "Sanitation Infrastructure"],
    "Transportation": ["Road Quality", "Traffic Signal Management", "Public Transport Systems"],
    "Water & Sanitation": ["Drinking Water Quality", "Sewage Treatment", "Pipeline Infrastructure"],
    "Public Safety": ["Street Lighting", "Community Surveillance", "Emergency Services"]
}

def classify_challenge(title: str, description: str, category_input: str = None) -> Tuple[str, str, float]:
    """
    Classifies a challenge into domain and sub-domain with confidence score.
    Uses input category if valid, else determines domain from keywords/semantic analysis.
    """
    text = (title + " " + description).lower()
    
    selected_domain = category_input if category_input and category_input in CATEGORIES else "Environment"
    max_matches = 0

    if not category_input or category_input == "Other":
        for cat, keywords in CATEGORIES.items():
            matches = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text))
            if matches > max_matches:
                max_matches = matches
                selected_domain = cat
                
    sub_domains = SUB_CATEGORIES.get(selected_domain, ["General Solutions", "Infrastructure Upgrade", "IoT Monitoring"])
    selected_sub_domain = sub_domains[0]
    
    for sub in sub_domains:
        sub_words = sub.lower().split()
        if any(word in text for word in sub_words):
            selected_sub_domain = sub
            break
            
    confidence = 0.94 if max_matches > 0 or category_input else 0.82
    return selected_domain, selected_sub_domain, confidence
