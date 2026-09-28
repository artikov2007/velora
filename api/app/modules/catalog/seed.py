from sqlalchemy import select

from app.core.database import SessionFactory
from app.modules.catalog.models import Category, Product

DEMO_CATEGORIES = {
    "electronics": "Электроника",
    "home": "Дом",
    "clothing": "Одежда",
    "accessories": "Аксессуары",
}

DEMO_PRODUCTS = [
    ("smartphone-pro", "Смартфон Pro, 256 ГБ", "Apple", "electronics", 72990000, "photo-1592899677977-9c10ca588bbd", "Смартфон с темным экраном"),
    ("wireless-headphones", "Беспроводные наушники", "Sony", "electronics", 18990000, "photo-1505740420928-5e560c06d30e", "Накладные наушники"),
    ("ultrabook-14", "Ноутбук 14″, 16 ГБ / 512 ГБ", "ASUS", "electronics", 48990000, "photo-1496181133206-80ce9b88a853", "Открытый ноутбук"),
    ("analog-watch", "Часы с металлическим браслетом", "Casio", "accessories", 8490000, "photo-1523275335684-37898b6baf30", "Наручные часы"),
    ("running-shoes", "Кроссовки для города", "Nike", "clothing", 12990000, "photo-1542291026-7eec264c27ff", "Спортивный кроссовок"),
    ("mirrorless-camera", "Беззеркальная камера", "Canon", "electronics", 35990000, "photo-1516035069371-29a1b244cc32", "Компактная камера"),
    ("table-lamp", "Настольная лампа", "Nord Home", "home", 5790000, "photo-1507473885765-e6ed057f782c", "Настольная лампа в интерьере"),
    ("portable-speaker", "Портативная Bluetooth-колонка", "JBL", "electronics", 9990000, "photo-1608043152269-423dbba4e7e1", "Портативная колонка"),
]


def seed_demo_data() -> None:
    with SessionFactory.begin() as session:
        for slug, name in DEMO_CATEGORIES.items():
            if session.get(Category, slug) is None:
                session.add(Category(slug=slug, name=name))
        session.flush()
        for slug, name, brand, category, price, image_id, alt in DEMO_PRODUCTS:
            exists = session.scalar(select(Product.id).where(Product.slug == slug))
            if exists is None:
                session.add(Product(
                    slug=slug,
                    name=name,
                    brand=brand,
                    category_slug=category,
                    country_code="KZ",
                    price_minor=price,
                    currency_code="KZT",
                    image_url=f"https://images.unsplash.com/{image_id}?auto=format&fit=crop&w=900&q=85",
                    image_alt=alt,
                    is_demo=True,
                ))


if __name__ == "__main__":
    seed_demo_data()