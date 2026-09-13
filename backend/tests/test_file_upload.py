import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_file_upload_validation_and_security():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        cit_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = cit_res.json()["access_token"]

        # Valid JPEG simulation with magic bytes
        fake_jpeg_content = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00" + (b"\x00" * 200)
        files = {"file": ("test_image.jpg", fake_jpeg_content, "image/jpeg")}

        upload_res = await ac.post(
            "/api/v1/media/upload?challenge_id=SS-1042",
            headers={"Authorization": f"Bearer {token}"},
            files=files
        )
        assert upload_res.status_code == 200
        data = upload_res.json()
        assert "media_id" in data
        assert data["scan_status"] == "NOT_SCANNED"

        assert "file_hash_sha256" in data


@pytest.mark.asyncio
async def test_invalid_file_signature_rejection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        cit_res = await ac.post("/api/v1/auth/demo-login?role=CITIZEN")
        token = cit_res.json()["access_token"]

        # Invalid executable content disguised as JPEG
        malicious_content = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00"
        files = {"file": ("malicious.exe", malicious_content, "image/jpeg")}

        upload_res = await ac.post(
            "/api/v1/media/upload?challenge_id=SS-1042",
            headers={"Authorization": f"Bearer {token}"},
            files=files
        )
        assert upload_res.status_code == 400
        assert "magic bytes signature mismatch" in upload_res.json()["detail"].lower()
