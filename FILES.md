# VELORA: карта файлов

Читайте в таком порядке:

1. `README.md` — запуск проекта и текущие ограничения preview.
2. `ARCHITECTURE.md` — продуктовая концепция, MVP, API, данные и roadmap.
3. `src/features/marketplace/marketplace-home.tsx` — интерфейс покупателя и его состояния.
4. `src/features/marketplace/catalog-data.ts` — типы, demo-товары, страны, валюты и форматирование цены.
5. `src/features/marketplace/catalog-api.ts` — загрузка каталога из backend.
6. `api/app/main.py` — создание FastAPI-приложения и healthcheck.
7. `api/app/modules/catalog/` — модели, схема ответа, поиск, фильтры и demo seed каталога.
8. `api/migrations/` — Alembic environment и версия начальной схемы.
9. `api/tests/test_catalog.py` — API-тесты.

## Файлы по алфавиту

```text
.env.example
.gitignore
AGENTS.md
ARCHITECTURE.md
CLAUDE.md
FILES.md
README.md
docker-compose.yml
eslint.config.mjs
next-env.d.ts
next.config.ts
package-lock.json
package.json
postcss.config.mjs
tsconfig.json

api/Dockerfile
api/alembic.ini
api/pyproject.toml
api/app/__init__.py
api/app/core/__init__.py
api/app/core/config.py
api/app/core/database.py
api/app/main.py
api/app/modules/__init__.py
api/app/modules/catalog/__init__.py
api/app/modules/catalog/models.py
api/app/modules/catalog/router.py
api/app/modules/catalog/schemas.py
api/app/modules/catalog/seed.py
api/migrations/env.py
api/migrations/versions/0001_catalog.py
api/tests/test_catalog.py

public/file.svg
public/globe.svg
public/next.svg
public/vercel.svg
public/window.svg

src/app/favicon.ico
src/app/globals.css
src/app/layout.tsx
src/app/marketplace.css
src/app/page.tsx
src/features/marketplace/catalog-api.ts
src/features/marketplace/catalog-data.ts
src/features/marketplace/marketplace-home.tsx
```

`node_modules/`, `.next/`, `api/.pytest_cache/`, `__pycache__/` и локальные `.env` не являются исходниками и в архив не включаются. `.env.example` включён; в нём только параметры для локальной разработки.