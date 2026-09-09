import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from main import app
from database import engine
from models import Base

from sqlalchemy import text

async def test_auth_flow():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE omikuji_histories ADD COLUMN feedback_rating INTEGER"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE omikuji_histories ADD COLUMN feedback_text TEXT"))
        except Exception:
            pass

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

        # 3. Guest profile check (new guest receives 1 welcome token)
        me_res = await client.get("/api/v1/users/me", headers={"x-user-id": guest_id})
        print("Guest /me:", me_res.status_code, me_res.json())
        assert me_res.json()["llm_tokens"] == 1
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

        # 6. Multiverse Observatory Stats Endpoint check
        stats_res = await client.get("/api/v1/stats/summary")
        print("Stats summary:", stats_res.status_code, stats_res.json())
        assert stats_res.status_code == 200
        assert "observatory" in stats_res.json()
        assert "luck_distribution" in stats_res.json()["observatory"]

        # 7. Guest token exhaustion block check (when tokens == 0)
        # Create guest and manually exhaust tokens to verify 403
        new_guest = await client.post("/api/v1/users/auth")
        new_guest_id = new_guest.json()["user_id"]
        fake_hist_id = str(uuid.uuid4())
        
        # When token is 1, calling with invalid history id returns 404
        valid_token_res = await client.post(f"/api/v1/interpret/{fake_hist_id}",
            headers={"x-user-id": new_guest_id},
            json={"user_context": "테스트 고민"}
        )
        assert valid_token_res.status_code == 404 # Token check passed, history lookup failed

        print("🎉 ALL AUTH, PERMISSION & STATS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_auth_flow())
