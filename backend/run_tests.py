import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestSolveSphere(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_01_demo_login_citizen(self):
        resp = self.client.post("/api/auth/demo-login?role=CITIZEN")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "CITIZEN")

    def test_02_demo_login_government(self):
        resp = self.client.post("/api/auth/demo-login?role=GOVERNMENT")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "GOVERNMENT")

    def test_03_list_challenges(self):
        resp = self.client.get("/api/challenges")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_04_get_challenge_detail_ss1042(self):
        resp = self.client.get("/api/challenges/SS-1042")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["id"], "SS-1042")
        self.assertIn("Urban Waterlogging", data["title"])

    def test_05_citizen_cannot_verify_challenge(self):
        cit_resp = self.client.post("/api/auth/demo-login?role=CITIZEN")
        cit_token = cit_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {cit_token}"}
        resp = self.client.post("/api/challenges/SS-1042/verify", json={"action": "VERIFY"}, headers=headers)
        self.assertEqual(resp.status_code, 403)

    def test_06_government_can_verify_challenge(self):
        gov_resp = self.client.post("/api/auth/demo-login?role=GOVERNMENT")
        gov_token = gov_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {gov_token}"}
        resp = self.client.post("/api/challenges/SS-1042/verify", json={"action": "VERIFY"}, headers=headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "VERIFIED")

if __name__ == "__main__":
    unittest.main()
