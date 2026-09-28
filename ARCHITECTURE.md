# VELORA Product and Technical Architecture

## 1. Product vision

Build a trusted regional marketplace where buyers can discover products from local sellers, see a relevant currency and destination, and understand delivery and seller terms before ordering. Start in Kazakhstan, Uzbekistan, Kyrgyzstan, and Tajikistan; country configuration must be data-driven rather than branching the product core by country.

## 2. Target users

- Buyers who want local product discovery, clear delivery expectations, and familiar payment choices.
- Small and mid-sized regional sellers who need a storefront, catalog, inventory, and order tools.
- Marketplace operators who verify sellers and listings, resolve disputes, and manage country-specific rules.

## 3. Core value proposition

One catalog across the region, localized by destination and currency, with seller identity and delivery terms visible in the purchase path. Trust signals must be earned and backed by verification or order data, never generated for demonstration purposes.

## 4. Competitive patterns

Use broad, documented marketplace patterns as research hypotheses: localized payment and purchase flows (Kaspi, Uzum), strong search and fulfillment (Amazon, Mercado Libre), and visible independent-seller identity (Etsy). Validate the hypotheses with buyers and sellers in each target country. Do not copy proprietary visual systems, ranking behavior, or brand assets.

## 5. Feature map

- Buyer: discovery, taxonomy, search, filters, product details, comparison, favorites, multi-seller cart, checkout, orders, tracking, reviews, and messaging.
- Seller: onboarding and verification, storefront, products and variants, inventory, order operations, delivery configuration, analytics, and payouts.
- Operations: catalog moderation, seller verification, orders, payments, delivery exceptions, reviews, promotions, commissions, and audit history.
- Platform capabilities: locations, localization, currency metadata, search adapter, notifications, media storage, and event tracking.

## 6. MVP boundary

Phase 1 targets country/city selection, catalog and category browsing, search, product details, a multi-seller cart, checkout, order records, seller onboarding foundations, and a minimal operations workflow. The current code implements only the buyer catalog slice and read-only product API. Authentication, seller/admin workflows, cart persistence, checkout, payments, and delivery are intentionally not represented as complete.

## 7. Information architecture

- Buyer: home → category/search results → product → seller storefront → cart → checkout → order/tracking.
- Seller: registration → country/business details → verification → store setup → catalog → orders.
- Admin: overview → sellers and verification → catalog moderation → orders and exceptions → configuration.
- Future route groups: `/`, `/search`, `/category/[slug]`, `/product/[slug]`, `/store/[slug]`, `/cart`, `/checkout`, `/orders/[id]`, `/seller/*`, `/admin/*`.

## 8. Critical UX flows

- Search to purchase: location → search/autocomplete → filter/sort → inspect product and seller → add to cart → address/delivery → payment → confirmation.
- Category to comparison: category → filters → select two to four products → compare normalized attributes → product → cart.
- Seller launch: account → country and business profile → verification → store details → first product → delivery/payment setup → publish.
- Operations: review seller/listing → record a reasoned decision → notify affected party → retain an audit event.

Guest browsing is the default. Account creation should not block discovery; guest checkout can be enabled once order ownership and recovery are implemented.

## 9. Design system

Use a neutral white/soft-gray canvas, graphite typography, a restrained deep-green action color, and a small orange highlight. Keep product media dominant, radii tight, controls keyboard-accessible, and motion reduced when requested by the system. The initial UI uses Manrope with Cyrillic support, responsive two-column mobile product grids, and a bottom navigation bar. Dark mode is a later token-level extension, not a second hardcoded theme.

## 10. Technical architecture

- Web: Next.js App Router, React, TypeScript, CSS design tokens, and feature-oriented modules.
- API: FastAPI modular monolith; each domain owns its router, service, repository, model, and schema as it grows.
- Persistence: PostgreSQL as the source of truth; Alembic migrations are required for schema changes.
- Supporting infrastructure: Redis only when caching, rate limits, or background work need it; S3-compatible object storage for uploaded media; OpenSearch behind a search adapter when relational search is insufficient.
- Runtime: Docker Compose for development; CI should run type/lint/tests and migration checks. Production requires managed secrets, backups, observability, TLS, and deployment-specific health probes.

Keep domain modules in one deployable API until scaling or team ownership justifies extracting a service. Use provider interfaces for payments, carriers, FX, and search so regional choices stay out of core order logic.

## 11. Database architecture

Use UUID primary keys, UTC timestamps, foreign keys, explicit uniqueness, and indexes aligned with access patterns. Store prices as integer minor units with an ISO currency code; never use floating point. Convert with decimal/rational FX data and retain the rate/source/time used. Orders must snapshot item names, seller, currency, unit price, discounts, commission, delivery, tax, and totals so later catalog changes cannot rewrite financial history.

Planned entities: `Country`, `Region`, `City`, `User`, `Address`, `Seller`, `SellerVerification`, `Store`, `Category`, `Brand`, `Product`, `ProductVariant`, `ProductImage`, `ProductAttribute`, `Warehouse`, `Inventory`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Shipment`, `Review`, `Question`, `Answer`, `Wishlist`, `Coupon`, `Promotion`, `Commission`, `Payout`, `Notification`, `Conversation`, `Message`, `Advertisement`, `AnalyticsEvent`, and `AuditEvent`.

The current initial migration contains `categories` and `products`. Product prices are source-currency minor units; preview records currently use KZT only.

## 12. API architecture

All public routes are versioned under `/api/v1`. Existing slice: `GET /api/v1/catalog/products` with bounded pagination and search/category/country filters; `GET /healthz`; FastAPI OpenAPI at `/docs`.

Planned route groups: `/auth`, `/users`, `/locations`, `/products`, `/categories`, `/search`, `/cart`, `/orders`, `/payments`, `/delivery`, `/sellers`, `/stores`, `/reviews`, `/wishlist`, `/promotions`, `/notifications`, and `/admin`. Validate input at the boundary, authorize each write by role and resource ownership, make payment/order writes idempotent, and expose stable error schemas.

## 13. Repository structure

```text
velora/
  src/app/                     Next.js routes, metadata, tokens
  src/features/marketplace/    buyer catalog, API adapter, preview fixtures
  api/app/core/                settings, database session, shared primitives
  api/app/modules/catalog/     catalog models, schemas, API, seed
  api/migrations/              Alembic history
  api/tests/                   API behavior tests
```

As the product grows, add bounded modules under `api/app/modules/` for identity, sellers, orders, payments, delivery, marketing, and notifications. Keep UI code organized by the same buyer/seller/admin workflows.

## 14. Development roadmap

1. Core marketplace: identity and locations, catalog/search, product/store pages, inventory, cart, checkout/order snapshots, basic seller and admin workflows, responsive QA.
2. Trust and operations: verified-purchase reviews, wishlist, notifications, seller analytics, carrier tracking, moderation tooling.
3. Growth: sponsored listings, coupons, recommendation adapters, messaging, richer analytics.
4. Regional scale: payment and carrier integrations, loyalty, mobile clients, and additional countries.

Every phase needs acceptance criteria, migration review, automated tests, and a country-by-country rollout checklist.

## 15. Risks and safeguards

- Seller legitimacy, product authenticity, and inventory accuracy: staged verification, moderation queue, report flow, suspension, and audit logs.
- Cross-border payments, taxes, returns, and consumer law: launch one country at a time with local legal and finance review.
- Currency rates and financial drift: trusted FX source, explicit rounding policy, immutable order snapshots, reconciliation, and no float arithmetic.
- Fraud and account abuse: secure sessions, RBAC, rate limits, upload validation, risk review, webhook signatures, and idempotency keys.
- Search quality and scale: measure zero-result and conversion events before adding a search cluster; keep a replaceable adapter.
- Performance and accessibility: optimize product media, cache read paths, test mobile layouts and keyboard flows, and monitor Core Web Vitals.

Authentication is not yet implemented. The planned default is a secure server-managed session with HttpOnly/Secure/SameSite cookies, CSRF protection for state-changing requests, Argon2id password hashing if passwords are used, least-privilege RBAC, and auditable admin actions. Do not store credentials or payment secrets in browser storage.

## 16. Monetization

Prioritize marketplace commission after seller liquidity and order quality are proven. Add sponsored products with explicit labeling and measurable attribution later. Seller subscriptions and premium analytics require demonstrated seller value; delivery/payment revenue depends on negotiated provider costs. Keep commission rules versioned and snapshot the applied rule on each order.