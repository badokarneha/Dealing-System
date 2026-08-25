from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    password = Column(String(255))
    role = Column(String(30), default="customer")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)

    shop_name = Column(String(150))
    category = Column(String(100))

    title = Column(String(200))
    description = Column(Text)

    discount = Column(Float)
    location = Column(String(250))

    image = Column(String(500))

    start_date = Column(String(50))
    end_date = Column(String(50))

    owner_id = Column(Integer)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )