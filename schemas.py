from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "customer"


class LoginRequest(BaseModel):
    email: str
    password: str


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