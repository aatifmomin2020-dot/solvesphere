from typing import List, Dict, Any

def match_universities_for_challenge(challenge: dict, universities: List[dict]) -> List[Dict[str, Any]]:
    """
    Ranks top university matches for a given challenge based on:
    - Domain & Sub-domain alignment
    - Department expertise
    - Research area keyword match
    - Facilities & Geographic proximity
    """
    matches = []
    ch_category = challenge.get("category", "")
    ch_sub = challenge.get("sub_category", "")
    ch_text = (challenge.get("title", "") + " " + challenge.get("description", "")).lower()

    for uni in universities:
        score = 50.0 # Base score
        matched_reasons = []

        # Domain matching
        uni_domains = uni.get("domains", [])
        if ch_category in uni_domains:
            score += 25.0
            matched_reasons.append(f"Primary domain alignment: {ch_category}")

        # Department matching
        uni_depts = uni.get("departments", [])
        ch_req_depts = ["Civil Engineering", "GIS", "Hydrology", "Environmental Science", "Computer Science", "Electrical Engineering"]
        for dept in uni_depts:
            if dept in ch_req_depts or any(w.lower() in ch_text for w in dept.lower().split()):
                score += 10.0
                matched_reasons.append(f"Department capability: {dept}")
                break

        # Research areas
        uni_research = uni.get("research_areas", [])
        for area in uni_research:
            if any(w.lower() in ch_text for w in area.lower().split()):
                score += 10.0
                matched_reasons.append(f"Research focus: {area}")

        # Proximity boost if same state
        if uni.get("state", "").lower() in challenge.get("location_name", "").lower():
            score += 5.0
            matched_reasons.append(f"Regional proximity ({uni.get('city')})")

        match_percent = round(min(98.0, score), 1)
        matches.append({
            "university_id": uni.get("id"),
            "university_name": uni.get("name"),
            "city": uni.get("city"),
            "match_score": match_percent,
            "matched_reasons": matched_reasons[:3],
            "departments": uni_depts[:3],
            "faculty_count": len(uni.get("faculty", [])),
            "student_team_count": len(uni.get("student_teams", []))
        })

    # Sort descending by match score
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:5]


def match_industry_for_challenge(challenge: dict, industry_orgs: List[dict]) -> List[Dict[str, Any]]:
    """
    Ranks top industry / CSR partners for a given challenge.
    """
    matches = []
    ch_category = challenge.get("category", "")
    ch_text = (challenge.get("title", "") + " " + challenge.get("description", "")).lower()

    for org in industry_orgs:
        score = 55.0
        matched_reasons = []

        domain = org.get("industry_domain", "")
        if ch_category in domain or domain in ch_category or "Smart City" in domain:
            score += 20.0
            matched_reasons.append(f"Industry sector fit: {domain}")

        support_types = org.get("support_types", [])
        if support_types:
            score += 15.0
            matched_reasons.append(f"Available support: {', '.join(support_types[:2])}")

        expertise = org.get("expertise", [])
        for exp in expertise:
            if exp.lower() in ch_text:
                score += 10.0
                matched_reasons.append(f"Technical mentorship in {exp}")

        match_percent = round(min(96.0, score), 1)
        matches.append({
            "industry_id": org.get("id"),
            "org_name": org.get("org_name"),
            "industry_domain": domain,
            "match_score": match_percent,
            "matched_reasons": matched_reasons[:3],
            "support_types": support_types,
            "funding_available_inr": org.get("funding_available_inr", 0.0)
        })

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:5]
