from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Sale
from schemas import SaleCreate

router = APIRouter(prefix="/api/sales", tags=["Sales"])


@router.get("/")
def get_sales(
    db: Session = Depends(get_db)
):

    sales = db.query(Sale).order_by(
        Sale.created_at.desc()
    ).all()

    return sales


@router.get("/{sale_id}")
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):

    sale = db.query(Sale).filter(
        Sale.id == sale_id
    ).first()

    if not sale:
        return {
            "success": False,
            "message": "Sale not found"
        }

    return sale


@router.post("/")
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db)
):

    new_sale = Sale(
        shop_name=sale.shop_name,
        category=sale.category,
        title=sale.title,
        description=sale.description,
        discount=sale.discount,
        location=sale.location,
        image=sale.image,
        start_date=sale.start_date,
        end_date=sale.end_date,
        owner_id=sale.owner_id
    )

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    return {
        "success": True,
        "sale": new_sale
    }


@router.get("/shop/{owner_id}")
def shop_sales(
    owner_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Sale).filter(
        Sale.owner_id == owner_id
    ).all()