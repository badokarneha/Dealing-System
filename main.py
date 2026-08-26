from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from auth import router as auth_router
from users import router as users_router
from sales import router as sales_router

from models import User, Sale


app = FastAPI(
    title="SaleFinder API",
    version="0.1.0"
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# DATABASE
# =========================================

Base.metadata.create_all(bind=engine)


# =========================================
# ROUTES
# =========================================

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(sales_router)


@app.get("/")
def root():
    return {
        "message": "SaleFinder API is running"
    }