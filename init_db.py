import sys
import asyncio
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from database import engine
from models import Base

async def create_tables():
    print("⏳ 데이터베이스 테이블 생성을 시작합니다...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ 모든 테이블이 성공적으로 생성되었습니다!")

if __name__ == "__main__":
    asyncio.run(create_tables())