from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_citizen_cannot_verify_challenge():
    # Login as Citizen
    cit_resp = client.post("/api/auth/demo-login?role=CITIZEN")
    cit_token = cit_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {cit_token}"}
    response = client.post("/api/challenges/SS-1042/verify", json={"action": "VERIFY"}, headers=headers)
    
    # Must return 403 FORBIDDEN
    assert response.status_code == 403

def test_government_can_verify_challenge():
    # Login as Government
    gov_resp = client.post("/api/auth/demo-login?role=GOVERNMENT")
    gov_token = gov_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {gov_token}"}
    response = client.post("/api/challenges/SS-1042/verify", json={"action": "VERIFY"}, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["status"] == "VERIFIED"
