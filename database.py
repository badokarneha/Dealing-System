# dashboard_backend.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import uvicorn
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# ============================================================
# CONFIGURATION
# ============================================================

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(
    title="SaleFinder Dashboard API",
    description="Backend API for SaleFinder Dashboard",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# DATA MODELS
# ============================================================

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class SaleCreate(BaseModel):
    title: str
    store: str
    discount: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: str = "active"
    image_url: Optional[str] = None
    ends_at: Optional[datetime] = None

class SaleResponse(BaseModel):
    id: int
    title: str
    store: str
    discount: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: str
    views: int
    image_url: Optional[str] = None
    created_at: datetime
    ends_at: Optional[datetime] = None
    user_id: int
    username: str

class SaleUpdate(BaseModel):
    title: Optional[str] = None
    store: Optional[str] = None
    discount: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    ends_at: Optional[datetime] = None

class ActivityResponse(BaseModel):
    id: int
    user_id: int
    action: str
    details: str
    created_at: datetime

class DashboardStats(BaseModel):
    total_views: int
    active_sales: int
    average_rating: float
    engagements: int
    views_change: float
    sales_change: float
    rating_change: float
    engagements_change: float

class SalesOverviewResponse(BaseModel):
    labels: List[str]
    values: List[int]

# ============================================================
# IN-MEMORY DATABASE
# ============================================================

class Database:
    def __init__(self):
        self.users = []
        self.sales = []
        self.activities = []
        self._next_user_id = 1
        self._next_sale_id = 1
        self._next_activity_id = 1
        
        self._seed_data()
    
    def _seed_data(self):
        # Create demo user
        demo_user = {
            "id": 1,
            "username": "demo_user",
            "email": "demo@salefinder.com",
            "full_name": "Demo User",
            "password": pwd_context.hash("demo123"),
            "created_at": datetime.now() - timedelta(days=30)
        }
        self.users.append(demo_user)
        
        # Sample sales with varied dates for chart
        sales_data = [
            {"title": "Summer Style", "store": "Zara", "discount": "-40%", "status": "active", "views": 2400, "days_ago": 5},
            {"title": "Tech Fest", "store": "Best Buy", "discount": "-25%", "status": "active", "views": 1800, "days_ago": 3},
            {"title": "Book Lovers", "store": "Barnes", "discount": "-15%", "status": "pending", "views": 890, "days_ago": 1},
            {"title": "Home & Living", "store": "IKEA", "discount": "-30%", "status": "expired", "views": 3200, "days_ago": 20},
            {"title": "Sports Gear", "store": "Nike", "discount": "-20%", "status": "active", "views": 1500, "days_ago": 2},
            {"title": "Fashion Fest", "store": "H&M", "discount": "-50%", "status": "active", "views": 4200, "days_ago": 7},
            {"title": "Electronics Sale", "store": "Amazon", "discount": "-35%", "status": "active", "views": 3100, "days_ago": 4},
            {"title": "Winter Collection", "store": "Zara", "discount": "-45%", "status": "pending", "views": 1200, "days_ago": 0},
        ]
        
        for i, data in enumerate(sales_data, 1):
            sale = {
                "id": i,
                "title": data["title"],
                "store": data["store"],
                "discount": data["discount"],
                "description": f"Amazing {data['title'].lower()} sale",
                "category": data["title"].split()[0].lower() if data["title"].split() else "general",
                "status": data["status"],
                "views": data["views"],
                "image_url": None,
                "created_at": datetime.now() - timedelta(days=data["days_ago"]),
                "ends_at": datetime.now() + timedelta(days=10 - data["days_ago"]),
                "user_id": 1
            }
            self.sales.append(sale)
        self._next_sale_id = len(sales_data) + 1
        
        # Sample activities
        activities = [
            {"action": "posted", "details": "New sale posted: 'Summer Sale'", "hours_ago": 2},
            {"action": "reviewed", "details": "Received 5-star review", "hours_ago": 4},
            {"action": "viewed", "details": "Sale 'Fashion Fest' reached 1k views", "hours_ago": 24},
            {"action": "generated", "details": "New discount code generated", "hours_ago": 48},
            {"action": "posted", "details": "New sale posted: 'Winter Collection'", "hours_ago": 1},
            {"action": "updated", "details": "Sale 'Summer Style' updated with new discount", "hours_ago": 12},
            {"action": "reviewed", "details": "New review on 'Tech Fest'", "hours_ago": 6},
            {"action": "viewed", "details": "Total daily views reached 5000", "hours_ago": 8},
        ]
        
        for i, act in enumerate(activities, 1):
            activity = {
                "id": i,
                "user_id": 1,
                "action": act["action"],
                "details": act["details"],
                "created_at": datetime.now() - timedelta(hours=act["hours_ago"])
            }
            self.activities.append(activity)
        self._next_activity_id = len(activities) + 1
    
    # User methods
    def get_user_by_username(self, username: str):
        for user in self.users:
            if user["username"] == username:
                return user
        return None
    
    def get_user_by_email(self, email: str):
        for user in self.users:
            if user["email"] == email:
                return user
        return None
    
    def get_user_by_id(self, user_id: int):
        for user in self.users:
            if user["id"] == user_id:
                return user
        return None
    
    def create_user(self, username: str, email: str, password: str, full_name: Optional[str] = None):
        user = {
            "id": self._next_user_id,
            "username": username,
            "email": email,
            "password": pwd_context.hash(password),
            "full_name": full_name,
            "created_at": datetime.now()
        }
        self.users.append(user)
        self._next_user_id += 1
        return user
    
    # Sale methods
    def get_all_sales(self, status: Optional[str] = None):
        if status:
            return [s for s in self.sales if s["status"] == status]
        return self.sales
    
    def get_sale_by_id(self, sale_id: int):
        for sale in self.sales:
            if sale["id"] == sale_id:
                return sale
        return None
    
    def create_sale(self, sale_data: dict, user_id: int):
        sale = {
            "id": self._next_sale_id,
            **sale_data,
            "views": 0,
            "created_at": datetime.now(),
            "user_id": user_id
        }
        self.sales.append(sale)
        self._next_sale_id += 1
        self.add_activity(user_id, "posted", f"New sale posted: '{sale['title']}'")
        return sale
    
    def update_sale(self, sale_id: int, update_data: dict):
        sale = self.get_sale_by_id(sale_id)
        if not sale:
            return None
        for key, value in update_data.items():
            if value is not None:
                sale[key] = value
        return sale
    
    def delete_sale(self, sale_id: int):
        for i, sale in enumerate(self.sales):
            if sale["id"] == sale_id:
                return self.sales.pop(i)
        return None
    
    def increment_views(self, sale_id: int):
        sale = self.get_sale_by_id(sale_id)
        if sale:
            sale["views"] += 1
            return sale
        return None
    
    # Activity methods
    def get_activities(self, user_id: Optional[int] = None, limit: int = 10):
        activities = self.activities
        if user_id:
            activities = [a for a in activities if a["user_id"] == user_id]
        activities = sorted(activities, key=lambda x: x["created_at"], reverse=True)
        return activities[:limit]
    
    def add_activity(self, user_id: int, action: str, details: str):
        activity = {
            "id": self._next_activity_id,
            "user_id": user_id,
            "action": action,
            "details": details,
            "created_at": datetime.now()
        }
        self.activities.append(activity)
        self._next_activity_id += 1
        return activity
    
    # Dashboard stats
    def get_dashboard_stats(self, user_id: int):
        user_sales = [s for s in self.sales if s["user_id"] == user_id]
        total_views = sum(s["views"] for s in user_sales)
        active_sales = len([s for s in user_sales if s["status"] == "active"])
        
        # Mock stats with some variation
        return {
            "total_views": total_views,
            "active_sales": active_sales,
            "average_rating": 4.9,
            "engagements": 236,
            "views_change": 12.5,
            "sales_change": 8.2,
            "rating_change": 0.3,
            "engagements_change": -2.1
        }
    
    def get_sales_overview(self, user_id: int, days: int = 7):
        """Get sales overview for the last N days"""
        user_sales = [s for s in self.sales if s["user_id"] == user_id]
        
        # Generate daily sales data
        labels = []
        values = []
        
        for i in range(days - 1, -1, -1):
            date = datetime.now() - timedelta(days=i)
            labels.append(date.strftime("%a"))
            
            # Count sales created on this day
            count = sum(1 for s in user_sales if s["created_at"].date() == date.date())
            values.append(count)
        
        return {"labels": labels, "values": values}

# Initialize database
db = Database()

# ============================================================
# AUTHENTICATION HELPERS
# ============================================================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(username: str, password: str):
    user = db.get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.get_user_by_username(username)
    if user is None:
        raise credentials_exception
    return user

# ============================================================
# API ENDPOINTS - DASHBOARD FOCUSED
# ============================================================

@app.get("/")
async def root():
    return {"message": "SaleFinder Dashboard API", "version": "1.0.0"}

# Authentication
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    if db.get_user_by_username(user_data.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.get_user_by_email(user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = db.create_user(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        full_name=user["full_name"],
        created_at=user["created_at"]
    )

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["username"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            full_name=user["full_name"],
            created_at=user["created_at"]
        )
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        created_at=current_user["created_at"]
    )

# ============================================================
# DASHBOARD ENDPOINTS (MAIN FOCUS)
# ============================================================

@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user = Depends(get_current_user)):
    """Get all dashboard statistics in one call"""
    stats = db.get_dashboard_stats(current_user["id"])
    return DashboardStats(**stats)

@app.get("/api/dashboard/overview", response_model=SalesOverviewResponse)
async def get_sales_overview(
    days: int = 7,
    current_user = Depends(get_current_user)
):
    """Get sales overview data for the chart"""
    data = db.get_sales_overview(current_user["id"], days)
    return SalesOverviewResponse(**data)

@app.get("/api/dashboard/activities", response_model=List[ActivityResponse])
async def get_dashboard_activities(
    limit: int = 10,
    current_user = Depends(get_current_user)
):
    """Get recent user activities"""
    activities = db.get_activities(current_user["id"], limit)
    return activities

@app.get("/api/dashboard/recent-sales", response_model=List[SaleResponse])
async def get_recent_sales(
    limit: int = 5,
    current_user = Depends(get_current_user)
):
    """Get recent sales for the table"""
    user_sales = [s for s in db.get_all_sales() if s["user_id"] == current_user["id"]]
    sorted_sales = sorted(user_sales, key=lambda x: x["created_at"], reverse=True)
    recent = sorted_sales[:limit]
    
    result = []
    for sale in recent:
        user = db.get_user_by_id(sale["user_id"])
        result.append({
            **sale,
            "username": user["username"] if user else "unknown"
        })
    
    return result

# ============================================================
# FULL DASHBOARD DATA (One endpoint to rule them all)
# ============================================================

@app.get("/api/dashboard/full")
async def get_full_dashboard(current_user = Depends(get_current_user)):
    """Get all dashboard data in one request"""
    stats = db.get_dashboard_stats(current_user["id"])
    overview = db.get_sales_overview(current_user["id"], 7)
    activities = db.get_activities(current_user["id"], 10)
    
    # Get recent sales
    user_sales = [s for s in db.get_all_sales() if s["user_id"] == current_user["id"]]
    sorted_sales = sorted(user_sales, key=lambda x: x["created_at"], reverse=True)
    recent_sales = sorted_sales[:5]
    
    sales_result = []
    for sale in recent_sales:
        user = db.get_user_by_id(sale["user_id"])
        sales_result.append({
            **sale,
            "username": user["username"] if user else "unknown"
        })
    
    return {
        "stats": stats,
        "overview": overview,
        "activities": activities,
        "recent_sales": sales_result
    }

# ============================================================
# SALES CRUD (For dashboard management)
# ============================================================

@app.get("/api/sales", response_model=List[SaleResponse])
async def get_sales(
    status: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Get all sales for the current user"""
    user_sales = [s for s in db.get_all_sales(status) if s["user_id"] == current_user["id"]]
    
    result = []
    for sale in user_sales:
        result.append({
            **sale,
            "username": current_user["username"]
        })
    
    return result

@app.post("/api/sales", response_model=SaleResponse)
async def create_sale(
    sale_data: SaleCreate,
    current_user = Depends(get_current_user)
):
    sale = db.create_sale(sale_data.dict(), current_user["id"])
    return {
        **sale,
        "username": current_user["username"]
    }

@app.put("/api/sales/{sale_id}", response_model=SaleResponse)
async def update_sale(
    sale_id: int,
    update_data: SaleUpdate,
    current_user = Depends(get_current_user)
):
    sale = db.get_sale_by_id(sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    if sale["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated_sale = db.update_sale(sale_id, update_data.dict(exclude_unset=True))
    db.add_activity(current_user["id"], "updated", f"Updated sale: '{updated_sale['title']}'")
    
    return {
        **updated_sale,
        "username": current_user["username"]
    }

@app.delete("/api/sales/{sale_id}")
async def delete_sale(
    sale_id: int,
    current_user = Depends(get_current_user)
):
    sale = db.get_sale_by_id(sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    if sale["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete_sale(sale_id)
    db.add_activity(current_user["id"], "deleted", f"Deleted sale: '{sale['title']}'")
    
    return {"message": "Sale deleted successfully"}

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    uvicorn.run("dashboard_backend:app", host="0.0.0.0", port=8000, reload=True)