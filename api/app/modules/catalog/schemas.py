from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    name: str
    brand: str
    category_slug: str
    category: str
    country_code: str
    price_minor: int = Field(ge=0)
    currency_code: str = Field(min_length=3, max_length=3)
    image_url: str
    image_alt: str
    is_demo: bool
    created_at: datetime