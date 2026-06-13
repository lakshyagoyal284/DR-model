from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Stub — replace with proper auth (JWT + hashed passwords)
@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    if body.username == "doctor" and body.password == "password":
        return LoginResponse(
            access_token="dummy-token-replace-me",
            token_type="bearer",
        )
    raise HTTPException(401, detail="Invalid credentials")
