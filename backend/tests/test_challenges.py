from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_challenges():
    response = client.get("/api/challenges")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_challenge_detail():
    response = client.get("/api/challenges/SS-1042")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "SS-1042"
    assert "Urban Waterlogging" in data["title"]
    assert data["category"] == "Environment"
