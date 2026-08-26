from pydantic import BaseModel


# =========================================
# USER REGISTRATION
# =========================================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    city: str
    role: str = "customer"


# =========================================
# USER LOGIN
# =========================================

class LoginRequest(BaseModel):
    email: str
    password: str


# =========================================
# SALE
# =========================================

class SaleCreate(BaseModel):
    shop_name: str
    category: str
    title: str
    description: str

    discount: float
    location: str

    image: str = ""

    start_date: str
    end_date: str

    owner_id: int