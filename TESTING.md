# Testing Guide

This project includes **unit**, **functional (API)**, **regression**, and **end-to-end** tests.

## Quick commands

```bash
# Unit tests only (no running services required)
npm run test:unit

# API functional tests (requires all backend services + frontend)
npm run test:functional

# Regression suite
npm run test:regression

# Full Playwright E2E (browser + API)
npm run test:e2e

# Unit + E2E
npm run test:all
```

## Prerequisites for E2E / functional tests

Start all services first:

```bash
# Terminal 1
cd backend/auth-service && npm run start:dev

# Terminal 2
cd backend/product-service && npm run start:dev

# Terminal 3
cd backend/order-service && npm run start:dev

# Terminal 4 (optional — Playwright can start frontend automatically)
cd frontend && npm run dev
```

Install Playwright browsers once:

```bash
npx playwright install chromium
```

## Test layers

| Layer | Location | What it covers |
|-------|----------|----------------|
| **Unit** | `backend/*/src/**/*.spec.ts`, `frontend/src/lib/__tests__` | Services, clients, form/cart utilities |
| **Functional (API)** | `e2e/api-functional.spec.ts` | Health, auth, catalog, order placement via HTTP |
| **Regression** | `e2e/regression.spec.ts`, `frontend/.../form-schema.regression.test.ts` | Fixed bugs: internal product route, signup schema, cart routes |
| **E2E (browser)** | `e2e/user-shopping-flow.spec.ts`, `e2e/admin-dashboard.spec.ts` | Full user checkout + admin console flows |

## Environment variables (optional)

| Variable | Default | Purpose |
|----------|---------|---------|
| `E2E_FRONTEND_URL` | `http://localhost:3000` | Frontend base URL |
| `E2E_AUTH_URL` | `http://localhost:3004` | Auth service |
| `E2E_PRODUCT_URL` | `http://localhost:3001` | Product service |
| `E2E_ORDER_URL` | `http://localhost:3003` | Order service |
| `E2E_SKIP_WEBSERVER` | unset | Set to `1` if frontend is already running |

## Reports

After E2E runs, open the HTML report:

```bash
npx playwright show-report
```
