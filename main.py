import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select

from database import engine, AsyncSessionLocal
from models import Base, Spot
from seed_data import seed_dummy_data
from routers import users, movement, omikuji, interpret

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. 앱 시작 시 테이블 자동 생성
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. 마스터 데이터(12개 스팟 & 84개 맞춤 오미쿠지) 확인 및 자동 갱신
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Spot))
        spots = res.scalars().all()
        master_res = await db.execute(select(OmikujiMaster))
        masters = master_res.scalars().all()
        if len(spots) != 12 or len(masters) != 84:
            print(f"🔄 마스터 데이터 버전 갱신 필요 (현재 Spots: {len(spots)}, Masters: {len(masters)}). 12대 세계관 84종 맞춤 오미쿠지 자동 시딩 실행!")
            await seed_dummy_data()
            
    yield

app = FastAPI(
    title="ChronoKuji API",
    description="세계관 확장형 AI 오미쿠지 서비스 API (비용 최적화 및 확장성 증명)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정 (Firebase Hosting 도메인 및 로컬 개발 환경 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 작성한 라우터들을 메인 앱에 등록
app.include_router(users.router)
app.include_router(movement.router)
app.include_router(omikuji.router)
app.include_router(interpret.router)

@app.post("/api/v1/admin/reseed")
async def admin_reseed():
    await seed_dummy_data()
    return {"status": "success", "message": "12대 세계관 맞춤 오미쿠지 84종 데이터 시딩 완료"}

@app.get("/")
async def root():
    return {"message": "Welcome to ChronoKuji API! The server is running."}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)