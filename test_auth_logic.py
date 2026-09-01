import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from main import app
from database import engine
from models import Base

async def test_auth_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Root check
        res = await client.get("/")
        print("Root response:", res.status_code, res.json())
        assert res.status_code == 200

        # 2. Guest login check
        guest_res = await client.post("/api/v1/users/auth")
        print("Guest auth:", guest_res.status_code, guest_res.json())
        assert guest_res.status_code == 200
        guest_id = guest_res.json()["user_id"]
        assert guest_res.json()["is_guest"] is True

        # 3. Guest profile check (tokens should be 0)
        me_res = await client.get("/api/v1/users/me", headers={"x-user-id": guest_id})
        print("Guest /me:", me_res.status_code, me_res.json())
        assert me_res.json()["llm_tokens"] == 0
        assert me_res.json()["is_guest"] is True

        # 4. Google Member registration/login check
        fb_uid = "google_test_user_" + str(uuid.uuid4())[:8]
        google_res = await client.post("/api/v1/users/firebase-auth", json={
            "firebase_uid": fb_uid,
            "email": "test@example.com",
            "display_name": "테스터",
            "photo_url": "https://example.com/avatar.png",
            "guest_uuid": guest_id
        })
        print("Google auth:", google_res.status_code, google_res.json())
        assert google_res.status_code == 200
        user_id = google_res.json()["user_id"]
        assert google_res.json()["is_guest"] is False

        # 5. Member profile check (tokens should be 1)
        member_me = await client.get("/api/v1/users/me", headers={"x-user-id": user_id})
        print("Member /me:", member_me.status_code, member_me.json())
        assert member_me.json()["llm_tokens"] == 1
        assert member_me.json()["is_guest"] is False

        # 6. Guest AI interpret block check (should be 403 Forbidden)
        new_guest = await client.post("/api/v1/users/auth")
        new_guest_id = new_guest.json()["user_id"]
        fake_hist_id = str(uuid.uuid4())
        blocked_res = await client.post(f"/api/v1/interpret/{fake_hist_id}", 
            headers={"x-user-id": new_guest_id}, 
            json={"user_context": "테스트 고민"}
        )
        print("Guest interpret block response:", blocked_res.status_code, blocked_res.json())
        assert blocked_res.status_code == 403
        assert "구글 로그인" in blocked_res.json()["detail"]

        print("🎉 ALL AUTH & PERMISSION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_auth_flow())
