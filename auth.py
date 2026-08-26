from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, LoginRequest


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# =========================================
# REGISTER
# =========================================

@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:
        return {
            "success": False,
            "message": "Email already registered"
        }

    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password,
        phone=user.phone,
        city=user.city,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone,
            "city": new_user.city,
            "role": new_user.role
        }
    }


# =========================================
# LOGIN
# =========================================

@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == request.email,
        User.password == request.password
    ).first()

    if not user:
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    return {
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "city": user.city,
            "role": user.role
        }
    }