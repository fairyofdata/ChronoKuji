from fastapi import FastAPI

from routers import users, movement, omikuji, interpret

app = FastAPI(
    title="O_miku_Z API",
    description="세계관 확장형 AI 오미쿠지 서비스 API (비용 최적화 및 확장성 증명)",
    version="1.0.0"
)

# 작성한 라우터들을 메인 앱에 등록
app.include_router(users.router)
app.include_router(movement.router)
app.include_router(omikuji.router)
app.include_router(interpret.router)

@app.get("/")
async def root():
    return {"message": "Welcome to O_miku_Z API! The server is running."}