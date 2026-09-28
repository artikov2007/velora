# VELORA

VELORA is a regional marketplace foundation for Kazakhstan, Uzbekistan, Kyrgyzstan, and Tajikistan. This repository contains the first catalog-focused MVP slice: a responsive buyer storefront, a versioned catalog API, PostgreSQL models, and an initial Alembic migration.

## Preview status

The catalog, exchange rates, and prices are generated preview data. The storefront labels them as demo data; products cannot be ordered. There is no production seller verification, authentication, checkout, payment processing, or delivery integration yet. Do not use the local compose credentials or preview data in production.

## Run locally

Prerequisites: Node.js 20.9+, Python 3.12+, and Docker Compose.

Start PostgreSQL and the API from this directory:

```bash
docker compose up --build
```

The API applies migrations and inserts idempotent demo catalog rows at startup. Open `http://localhost:8000/docs` for OpenAPI and `http://localhost:8000/healthz` for its health check.

If your hosted development environment blocks container-to-container networking, start only the database with `docker compose up -d db`, then run the API on the host from `api/`:

```bash
export VELORA_DATABASE_URL=postgresql+psycopg://velora:local-only-change-me@localhost:5432/velora
alembic upgrade head
python -m app.modules.catalog.seed
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

In another terminal, start the storefront:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The Next.js server proxies `/api/*` to FastAPI, keeping browser requests same-origin; set `VELORA_API_INTERNAL_URL` if the API is not at `http://127.0.0.1:8000`. If the API is unavailable, the page stays usable with its clearly labeled local demo catalog.

Run the API tests:

```bash
cd api
python -m pip install -e ".[dev]"
pytest -q
```

The initial product and technical decisions are in [ARCHITECTURE.md](ARCHITECTURE.md).This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
