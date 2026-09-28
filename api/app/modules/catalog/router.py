from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_session
from app.modules.catalog.models import Product
from app.modules.catalog.schemas import ProductRead

router = APIRouter(prefix="/api/v1/catalog", tags=["catalog"])


@router.get("/products", response_model=list[ProductRead])
def list_products(
    session: Annotated[Session, Depends(get_session)],
    q: Annotated[str | None, Query(max_length=120)] = None,
    category: Annotated[str | None, Query(max_length=80)] = None,
    country: Annotated[str | None, Query(min_length=2, max_length=2)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 24,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[ProductRead]:
    statement = select(Product).options(joinedload(Product.category))
    if q and q.strip():
        term = q.strip().replace("!", "!!").replace("%", "!%").replace("_", "!_")
        statement = statement.where(
            Product.name.ilike(f"%{term}%", escape="!")
            | Product.brand.ilike(f"%{term}%", escape="!")
        )
    if category:
        statement = statement.where(Product.category_slug == category)
    if country:
        statement = statement.where(Product.country_code == country.upper())

    items = session.scalars(statement.order_by(Product.created_at.desc(), Product.slug).limit(limit).offset(offset)).all()
    return [
        ProductRead.model_validate({
            "id": product.id,
            "slug": product.slug,
            "name": product.name,
            "brand": product.brand,
            "category_slug": product.category_slug,
            "category": product.category.name,
            "country_code": product.country_code,
            "price_minor": product.price_minor,
            "currency_code": product.currency_code,
            "image_url": product.image_url,
            "image_alt": product.image_alt,
            "is_demo": product.is_demo,
            "created_at": product.created_at,
        })
        for product in items
    ]