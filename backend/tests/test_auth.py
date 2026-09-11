import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_demo_login_citizen():
    response = client.post("/api/auth/demo-login?role=CITIZEN")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "CITIZEN"

def test_demo_login_government():
    response = client.post("/api/auth/demo-login?role=GOVERNMENT")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "GOVERNMENT"
