from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.db.base import engine, Base
import app.models

app = FastAPI(title="Project Byeoltago")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 테이블 생성
Base.metadata.create_all(bind=engine)

# 라우터 등록
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "별타고(Byeoltago) 프로젝트입니다."}
