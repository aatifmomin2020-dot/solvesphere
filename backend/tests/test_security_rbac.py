import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_auth_token_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Demo login as citizen
        res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data

        # Get profile
        profile_res = await ac.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {data['access_token']}"}
        )
        assert profile_res.status_code == 200
        assert profile_res.json()["role"] == "CITIZEN"


@pytest.mark.asyncio
async def test_rbac_write_endpoint_security():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Citizen token
        cit_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        cit_token = cit_res.json()["access_token"]

        # University token
        univ_res = await ac.post("/api/v1/auth/demo-login?role=UNIVERSITY")
        univ_token = univ_res.json()["access_token"]

        # Industry token
        ind_res = await ac.post("/api/v1/auth/demo-login?role=INDUSTRY")
        ind_token = ind_res.json()["access_token"]

        # Citizen cannot call government verification route
        c_ver = await ac.post(
            "/api/v1/challenges/SS-1042/verify",
            headers={"Authorization": f"Bearer {cit_token}"},
            json={"decision": "VERIFIED"}
        )
        assert c_ver.status_code == 403

        # University cannot call government verification route
        u_ver = await ac.post(
            "/api/v1/challenges/SS-1042/verify",
            headers={"Authorization": f"Bearer {univ_token}"},
            json={"decision": "VERIFIED"}
        )
        assert u_ver.status_code == 403

        # Industry cannot call government verification route
        i_ver = await ac.post(
            "/api/v1/challenges/SS-1042/verify",
            headers={"Authorization": f"Bearer {ind_token}"},
            json={"decision": "VERIFIED"}
        )
        assert i_ver.status_code == 403


@pytest.mark.asyncio
async def test_government_authorized_verification():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        gov_res = await ac.post("/api/v1/auth/demo-login?role=GOVERNMENT")
        gov_token = gov_res.json()["access_token"]

        # Government authorized call
        g_ver = await ac.post(
            "/api/v1/challenges/SS-1042/verify",
            headers={"Authorization": f"Bearer {gov_token}"},
            json={"decision": "VERIFIED", "official_priority": "HIGH", "priority_reason": "Verified high traffic danger zone."}
        )
        assert g_ver.status_code == 200
        assert g_ver.json()["status"] == "VERIFIED"
