import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_demo_login_all_roles():
    roles = ["CITIZEN", "GOVERNMENT", "UNIVERSITY", "INDUSTRY", "FACULTY", "STUDENT"]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        for r in roles:
            response = await ac.post(f"/api/v1/auth/demo-login?role={r}")
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["user"]["role"] == r

@pytest.mark.asyncio
async def test_challenge_submission_and_ai():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Submit challenge
        sub_resp = await ac.post(
            "/api/v1/challenges",
            json={
                "title": "Severe Pothole Hazard near School Gate",
                "description": "Deep potholes are causing traffic blockage and student safety hazards during monsoon rainfall.",
                "district": "Pune",
                "locality": "Sector 5",
                "affected_population": 1200,
                "severity_level": "HIGH",
                "is_anonymous": False
            }
        )
        assert sub_resp.status_code == 200
        ch_data = sub_resp.json()
        assert "public_code" in ch_data
        assert "domain" in ch_data
        
        ch_id = ch_data["id"]

        # Public catalog view
        cat_resp = await ac.get("/api/v1/challenges")
        assert cat_resp.status_code == 200
        assert cat_resp.json()["total"] > 0

        # Government Verification
        gov_login = await ac.post("/api/v1/auth/demo-login?role=GOVERNMENT")
        gov_token = gov_login.json()["access_token"]
        
        ver_resp = await ac.post(
            f"/api/v1/challenges/{ch_id}/verify",
            headers={"Authorization": f"Bearer {gov_token}"},
            json={
                "decision": "VERIFIED",
                "official_priority": "HIGH",
                "priority_reason": "High traffic vulnerability and student access risk.",
                "assigned_department": "Department of Urban Infrastructure"
            }
        )
        assert ver_resp.status_code == 200
        assert ver_resp.json()["status"] == "VERIFIED"

@pytest.mark.asyncio
async def test_rbac_protection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        cit_login = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        cit_token = cit_login.json()["access_token"]

        # Citizen attempting to call government verify endpoint must receive 403 FORBIDDEN
        ver_resp = await ac.post(
            "/api/v1/challenges/SS-1042/verify",
            headers={"Authorization": f"Bearer {cit_token}"},
            json={"decision": "VERIFIED"}
        )
        assert ver_resp.status_code == 403
