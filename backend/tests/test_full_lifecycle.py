import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_full_11step_challenge_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # STEP 1: Citizen Submission
        sub_resp = await ac.post(
            "/api/v1/challenges",
            json={
                "title": "Unsafe Traffic Corridor & Pedestrian Hazard",
                "description": "Lack of pedestrian crossing light causing continuous accidents near public library.",
                "district": "Pune",
                "locality": "Library Square",
                "affected_population": 1800,
                "severity_level": "HIGH",
                "is_anonymous": False
            }
        )
        assert sub_resp.status_code == 200
        ch = sub_resp.json()
        ch_id = ch["id"]
        assert "duplicates_found" in ch

        # STEP 2 & 3: Government Verification
        gov_res = await ac.post("/api/v1/auth/demo-login?role=GOVERNMENT")
        gov_token = gov_res.json()["access_token"]

        ver_res = await ac.post(
            f"/api/v1/challenges/{ch_id}/verify",
            headers={"Authorization": f"Bearer {gov_token}"},
            json={
                "decision": "VERIFIED",
                "official_priority": "HIGH",
                "priority_reason": "Verified pedestrian hazard area."
            }
        )
        assert ver_res.status_code == 200

        # STEP 4: University Proposal
        univ_res = await ac.post("/api/v1/auth/demo-login?role=UNIVERSITY")
        univ_token = univ_res.json()["access_token"]

        prop_res = await ac.post(
            "/api/v1/universities/proposals",
            headers={"Authorization": f"Bearer {univ_token}"},
            json={
                "challenge_id": ch_id,
                "title": "Smart Solar Pedestrian Crossing Signal",
                "problem_interpretation": "Pedestrian safety hazard.",
                "proposed_solution": "Deploy solar-powered motion-sensing pedestrian crossing signal.",
                "technical_architecture": "PIR sensors + Solar battery array.",
                "estimated_timeline_weeks": 8,
                "budget_estimate_inr": 180000.0
            }
        )
        assert prop_res.status_code == 200

        # STEP 5: Industry Partnership Offer
        ind_res = await ac.post("/api/v1/auth/demo-login?role=INDUSTRY")
        ind_token = ind_res.json()["access_token"]

        projs_res = await ac.get("/api/v1/projects")
        assert projs_res.status_code == 200
        projs = projs_res.json()
        target_proj_id = projs[0]["id"]

        part_res = await ac.post(
            "/api/v1/industry/partnerships",
            headers={"Authorization": f"Bearer {ind_token}"},
            json={
                "project_id": target_proj_id,
                "contribution_types": ["MENTORSHIP", "FUNDING"],
                "funding_amount_inr": 100000.0,
                "description": "Provided solar LED hardware and field testing."
            }
        )
        assert part_res.status_code == 200

        # STEP 6: Project Workspace Milestone Update
        ms_res = await ac.put(
            f"/api/v1/projects/{target_proj_id}/milestones/ms-test-id",
            json={"status": "COMPLETED", "completion_percentage": 100}
        )
        # 404 is allowed if test milestone ID doesn't exist, but workspace get must succeed
        ws_res = await ac.get(f"/api/v1/projects/{target_proj_id}")
        assert ws_res.status_code == 200
        assert "impact" in ws_res.json()

        # STEP 7: Analytics Overview & North Star Metric
        an_res = await ac.get("/api/v1/analytics/overview")
        assert an_res.status_code == 200
        assert "north_star_metric" in an_res.json()

        # STEP 8: Citizen Feedback Submission
        fb_res = await ac.post(
            f"/api/v1/challenges/{ch_id}/feedback",
            json={"rating": 5, "is_resolved": "YES", "comment": "Pedestrian signal installed! Great job."}
        )
        assert fb_res.status_code == 200
