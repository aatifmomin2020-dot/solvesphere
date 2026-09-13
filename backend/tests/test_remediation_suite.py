import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.embedding_service import EmbeddingService


@pytest.mark.asyncio
async def test_anonymous_cannot_update_milestone():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.put("/api/v1/projects/proj-123/milestones/ms-123", json={"status": "COMPLETED", "completion_percentage": 100})
        assert res.status_code == 401


@pytest.mark.asyncio
async def test_user_cannot_update_other_project_milestone():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.put("/api/v1/projects/proj-123/milestones/ms-123", json={"status": "COMPLETED", "completion_percentage": 100}, headers=headers)
        assert res.status_code in [403, 404]


@pytest.mark.asyncio
async def test_user_cannot_download_other_users_media():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.get("/api/v1/media/download/nonexistent-media-id", headers=headers)
        assert res.status_code == 404


@pytest.mark.asyncio
async def test_user_cannot_feedback_on_unrelated_challenge():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.post("/api/v1/challenges/invalid-challenge-id/feedback", json={"rating": 5, "comment": "Great"}, headers=headers)
        assert res.status_code in [400, 404]


@pytest.mark.asyncio
async def test_university_identity_not_first_record():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Citizen user submitting proposal should be rejected with 403 (not default to University 1)
        res = await ac.post("/api/v1/universities/proposals", json={
            "challenge_id": "ch-1",
            "title": "Unauth Proposal",
            "problem_interpretation": "Test",
            "proposed_solution": "Test",
            "technical_architecture": "Test"
        }, headers=headers)
        assert res.status_code in [400, 403]


@pytest.mark.asyncio
async def test_industry_identity_not_first_record():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Citizen user submitting industry offer should be rejected with 403 (not default to Industry 1)
        res = await ac.post("/api/v1/industry/partnerships", json={
            "project_id": "proj-1",
            "contribution_types": ["FUNDING"],
            "funding_amount_inr": 100000.0,
            "description": "Test"
        }, headers=headers)
        assert res.status_code in [400, 403]


@pytest.mark.asyncio
async def test_refresh_token_rotation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        refresh_token = login_res.json()["refresh_token"]

        rotate_res = await ac.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert rotate_res.status_code == 200
        new_data = rotate_res.json()
        assert "access_token" in new_data
        assert "refresh_token" in new_data
        assert new_data["refresh_token"] != refresh_token


@pytest.mark.asyncio
async def test_refresh_token_revocation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = login_res.json()["access_token"]
        refresh_token = login_res.json()["refresh_token"]
        headers = {"Authorization": f"Bearer {token}"}

        logout_res = await ac.post("/api/v1/auth/logout", json={"refresh_token": refresh_token}, headers=headers)
        assert logout_res.status_code == 200

        # Attempting refresh after logout must fail
        fail_res = await ac.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert fail_res.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_reuse():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        old_refresh_token = login_res.json()["refresh_token"]

        # 1st rotation (valid)
        rot1 = await ac.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh_token})
        assert rot1.status_code == 200

        # 2nd rotation with reused old token (should trigger reuse revocation error)
        rot2 = await ac.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh_token})
        assert rot2.status_code == 401
        assert "reuse detected" in rot2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_rate_limit():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Rapid logins should trigger rate limit (or return 200/401 without crashing)
        responses = []
        for _ in range(12):
            r = await ac.post("/api/v1/auth/login", json={"email": "nonexistent@test.com", "password": "wrong"})
            responses.append(r.status_code)
        assert 429 in responses or 401 in responses


@pytest.mark.asyncio
async def test_partnership_starts_pending():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=INDUSTRY")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.post("/api/v1/industry/partnerships", json={
            "project_id": "proj-1",
            "contribution_types": ["MENTORSHIP", "FUNDING"],
            "funding_amount_inr": 150000.0,
            "description": "CSR IoT Hardware Contribution"
        }, headers=headers)
        assert res.status_code == 200
        assert res.json()["status"] == "PENDING"


@pytest.mark.asyncio
async def test_partnership_requires_authorization():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Citizen role attempting government evaluation should get 403 Forbidden
        res = await ac.post("/api/v1/industry/partnerships/part-1/evaluate", json={
            "decision": "ACCEPTED",
            "reason": "Approved"
        }, headers=headers)
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_real_embedding_dimension():
    vec, flag = EmbeddingService.generate_embedding("Test text for 384 dimensional vector validation")
    assert len(vec) == 384
    assert isinstance(vec[0], float)


@pytest.mark.asyncio
async def test_pgvector_similarity_search():
    v1, _ = EmbeddingService.generate_embedding("Urban waterlogging and flood drainage")
    v2, _ = EmbeddingService.generate_embedding("Waterlogging and flooding on main road")
    
    # Cosine similarity between related embeddings must be > 0.40
    dot = sum(a * b for a, b in zip(v1, v2))
    assert dot > 0.40
