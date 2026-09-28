from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.main import create_app
from app.modules.catalog.models import Category, Product


@pytest.fixture
def client() -> Iterator[TestClient]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    with factory.begin() as session:
        session.add(Category(slug="electronics", name="Электроника"))
        session.add(Product(
            slug="headphones",
            name="Беспроводные наушники",
            brand="Sony",
            category_slug="electronics",
            country_code="KZ",
            price_minor=18990000,
            currency_code="KZT",
            image_url="https://example.com/headphones.jpg",
            image_alt="Наушники",
            is_demo=True,
        ))
    with TestClient(create_app(factory)) as client:
        yield client
    engine.dispose()


def test_catalog_returns_currency_and_demo_disclosure() -> None:
    assert client.get("/healthz").status_code == 200


def test_catalog_returns_currency_and_demo_disclosure(client: TestClient) -> None:
    response = client.get("/api/v1/catalog/products")

    assert response.status_code == 200
    product = response.json()[0]
    assert product["price_minor"] == 18990000
    assert product["currency_code"] == "KZT"
    assert product["is_demo"] is True
    assert product["category"] == "Электроника"


def test_catalog_filters_by_search_category_and_country(client: TestClient) -> None:

    response = client.get("/api/v1/catalog/products", params={"q": "Sony", "category": "electronics", "country": "kz"})

    assert response.status_code == 200
    assert [item["slug"] for item in response.json()] == ["headphones"]


def test_catalog_rejects_invalid_pagination(client: TestClient) -> None:

    assert client.get("/api/v1/catalog/products", params={"limit": 500}).status_code == 422


def test_catalog_treats_search_wildcards_literally(client: TestClient) -> None:
    response = client.get("/api/v1/catalog/products", params={"q": "%"})

    assert response.status_code == 200
    assert response.json() == []


def test_healthcheck_does_not_require_database() -> None:
    response = TestClient(create_app()).get("/healthz")

    assert response.json() == {"status": "ok"}