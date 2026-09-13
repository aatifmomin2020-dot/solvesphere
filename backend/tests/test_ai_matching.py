import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_ai_evaluation_and_observability():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/ai/evaluation")
        assert res.status_code == 200
        data = res.json()
        assert "metrics" in data
        assert data["metrics"]["classification_accuracy_pct"] >= 90.0
        assert data["metrics"]["classification_f1_score"] >= 0.80
        assert "observability" in data



@pytest.mark.asyncio
async def test_university_7factor_matching_engine():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/universities/matches/SS-1042")
        assert res.status_code == 200
        data = res.json()
        assert "matches" in data
        assert len(data["matches"]) > 0
        top = data["matches"][0]
        assert "score_pct" in top
        assert "factors" in top
        assert "Domain Match" in top["factors"]
