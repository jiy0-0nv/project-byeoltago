from fastapi import APIRouter

router = APIRouter()

@router.get("/dbtest")
def dbtest():
    from app.db.base import engine
    try:
        connection = engine.connect()
        return {"message": "연결 성공"}
    except Exception as e:
        return {"message": "연결 실패:" + str(e)}
