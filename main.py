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
    
    # 2. 마스터 데이터(스팟)가 비어있으면 자동 시딩
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Spot).limit(1))
        first_spot = res.scalars().first()
        if not first_spot:
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

@app.get("/")
async def root():
    return {"message": "Welcome to ChronoKuji API! The server is running."}