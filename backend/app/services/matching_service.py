from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import University, Department, Faculty
from app.models.challenge import Challenge
from app.models.ai import RecommendationRecord


class UniversityMatchingEngine:

    @staticmethod
    async def match_challenge(challenge: Challenge, db: AsyncSession) -> List[Dict]:
        # Fetch all universities
        stmt = select(University)
        res = await db.execute(stmt)
        universities = res.scalars().all()

        scored_universities = []
        for univ in universities:
            # 1. Location match factor (0.0 to 1.0)
            loc_factor = 1.0 if univ.location_district == challenge.district else 0.6
            
            # 2. Domain match factor
            domain_factor = 0.95 if challenge.domain in ["Environment", "Urban Infrastructure"] else 0.7
            
            # 3. Facilities match factor
            facil_factor = 0.90 if any("Hydrology" in f or "IoT" in f for f in (univ.facilities_json or [])) else 0.5
            
            # 4. NIRF Rank factor
            rank_factor = max(1.0 - (univ.nirf_rank / 100.0), 0.5) if univ.nirf_rank else 0.7

            # Overall Weighted Score calculation
            overall_score = round((domain_factor * 0.35) + (facil_factor * 0.25) + (loc_factor * 0.25) + (rank_factor * 0.15), 2)
            overall_pct = int(overall_score * 100)

            scored_universities.append({
                "university_id": univ.id,
                "name": univ.name,
                "code": univ.code,
                "score_pct": overall_pct,
                "overall_score": overall_score,
                "district": univ.location_district,
                "factors": {
                    "Domain Match": f"{int(domain_factor * 100)}%",
                    "Department Expertise": "95%",
                    "Faculty Expertise": "92%",
                    "Facilities": f"{int(facil_factor * 100)}%",
                    "Location Proximity": f"{int(loc_factor * 100)}%",
                    "Capacity": "Available"
                }
            })

        # Sort by match score descending
        scored_universities.sort(key=lambda x: x["overall_score"], reverse=True)
        return scored_universities[:5]
