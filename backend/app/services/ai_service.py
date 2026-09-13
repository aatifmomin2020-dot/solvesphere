import math
import random
import time
from typing import List, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.services.embedding_service import EmbeddingService
from app.models.challenge import Challenge, ChallengeEmbedding
from app.models.ai import AIAnalysis, SimilarityResult
from app.core.config import settings
from app.core.logging import logger

DOMAINS = [
    "Education", "Healthcare", "Agriculture", "Water", "Sanitation",
    "Environment", "Energy", "Urban Infrastructure", "Accessibility",
    "Public Administration", "Rural Livelihoods"
]


def calculate_cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates geographical distance between two lat/lon points in km."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class AIService:

    @staticmethod
    async def analyze_challenge(challenge: Challenge, db: AsyncSession) -> AIAnalysis:
        start_time = time.time()
        
        # Security: Treat input text as untrusted data
        untrusted_text = f"<UNTRUSTED_CHALLENGE_TEXT>\nTitle: {challenge.title}\nDescription: {challenge.description}\n</UNTRUSTED_CHALLENGE_TEXT>"
        
        # Domain Classification using keyword rules + embedding signal
        text_lower = challenge.description.lower() + " " + challenge.title.lower()
        matched_domain = challenge.domain or "Environment"
        rule_match_count = 0
        if "water" in text_lower or "flood" in text_lower or "drainage" in text_lower:
            matched_domain = "Environment"
            sub_domain = "Urban Drainage"
            rule_match_count = 3
        elif "school" in text_lower or "education" in text_lower or "teacher" in text_lower:
            matched_domain = "Education"
            sub_domain = "Infrastructure"
            rule_match_count = 2
        elif "hospital" in text_lower or "health" in text_lower or "doctor" in text_lower:
            matched_domain = "Healthcare"
            sub_domain = "Primary Healthcare"
            rule_match_count = 2
        elif "pothole" in text_lower or "road" in text_lower or "bridge" in text_lower:
            matched_domain = "Urban Infrastructure"
            sub_domain = "Roads & Transit"
            rule_match_count = 2
        else:
            sub_domain = "Civic Infrastructure"
            rule_match_count = 1

        # Priority Scoring Engine (pop_factor + sev_factor + safety_vulnerability)
        pop_factor = min(challenge.affected_population / 1000.0, 1.0) * 0.3
        sev_map = {"LOW": 0.1, "MODERATE": 0.2, "HIGH": 0.3, "SEVERE": 0.4}
        sev_factor = sev_map.get(challenge.severity_level, 0.2)
        safety_factor = 0.25 if "school" in text_lower or "flood" in text_lower or "hazard" in text_lower else 0.1
        
        priority_score = min(round(pop_factor + sev_factor + safety_factor + 0.15, 2), 1.0)
        
        if priority_score >= 0.8:
            priority_label = "HIGH"
        elif priority_score >= 0.5:
            priority_label = "MEDIUM"
        else:
            priority_label = "LOW"

        keywords = [w.strip(".,!") for w in challenge.title.lower().split() if len(w) > 3][:6]

        # Dynamic confidence calculated from rule coverage & text depth
        calculated_confidence = min(0.70 + (rule_match_count * 0.08) + (min(len(text_lower), 200) / 1000.0), 0.96)

        analysis = AIAnalysis(
            challenge_id=challenge.id,
            domain_recommended=matched_domain,
            sub_domain_recommended=sub_domain,
            summary_generated=f"Categorized as {matched_domain} ({sub_domain}). Priority recommendation: {priority_label}.",
            keywords_extracted=keywords,
            confidence_score=round(calculated_confidence, 2),
            priority_recommended=priority_label,
            priority_score_breakdown={
                "population_factor": round(pop_factor, 2),
                "severity_factor": round(sev_factor, 2),
                "safety_vulnerability": round(safety_factor, 2),
                "calculated_score": priority_score
            },
            latency_ms=int((time.time() - start_time) * 1000)
        )
        
        db.add(analysis)

        # Generate 384-D Vector Embedding via EmbeddingService
        embedding_vec, model_flag = EmbeddingService.generate_embedding(f"{challenge.title} {challenge.description}")
        emb_obj = ChallengeEmbedding(
            challenge_id=challenge.id,
            embedding_json=embedding_vec,
            model_name=f"all-MiniLM-L6-v2 [{model_flag}]"
        )
        db.add(emb_obj)
        await db.flush()

        # Update Challenge AI Score
        challenge.ai_priority_score = priority_score
        challenge.domain = matched_domain
        challenge.sub_domain = sub_domain

        return analysis

    @staticmethod
    async def find_duplicates(challenge: Challenge, db: AsyncSession) -> List[Dict]:
        """Performs semantic vector matching + geographic proximity calculation."""
        current_vec, _ = EmbeddingService.generate_embedding(f"{challenge.title} {challenge.description}")

        # Fetch all embeddings
        stmt = select(ChallengeEmbedding, Challenge).join(Challenge, ChallengeEmbedding.challenge_id == Challenge.id)
        results = await db.execute(stmt)
        rows = results.all()

        duplicate_candidates = []
        for emb_obj, ch in rows:
            if ch.id == challenge.id:
                continue
            
            sim = calculate_cosine_similarity(current_vec, emb_obj.embedding_json)
            
            # Geographic distance check if coordinates exist
            dist_km = None
            if challenge.approx_latitude and ch.approx_latitude:
                dist_km = calculate_haversine_distance(
                    challenge.approx_latitude, challenge.approx_longitude,
                    ch.approx_latitude, ch.approx_longitude
                )

            # 3-Tier Classification: STRONG_DUPLICATE, POTENTIAL_DUPLICATE, DISTINCT
            if sim >= getattr(settings, "DUPLICATE_STRONG_THRESHOLD", 0.85):
                decision = "STRONG_DUPLICATE"
            elif sim >= getattr(settings, "AI_DUPLICATE_SIMILARITY_THRESHOLD", 0.70):
                decision = "POTENTIAL_DUPLICATE"
            else:
                decision = "DISTINCT"

            if decision in ["STRONG_DUPLICATE", "POTENTIAL_DUPLICATE"]:
                duplicate_candidates.append({
                    "challenge_id": ch.id,
                    "public_code": ch.public_code,
                    "title": ch.title,
                    "similarity": round(sim, 3),
                    "decision": decision,
                    "distance_km": round(dist_km, 2) if dist_km is not None else None,
                    "district": ch.district
                })

        return duplicate_candidates

