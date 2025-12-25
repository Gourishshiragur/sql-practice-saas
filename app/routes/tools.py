from fastapi import APIRouter

router = APIRouter(prefix="/api/tools", tags=["Text Tools"])

@router.post("/uppercase")
def uppercase(text: str):
    return {"result": text.upper()}

@router.post("/lowercase")
def lowercase(text: str):
    return {"result": text.lower()}
