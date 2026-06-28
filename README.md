# Revest Solutions — Senior Full Stack Developer Assignment

Microservice-based backend (NestJS) and a dynamic JSON-driven signup form (Next.js + TypeScript + Material UI).

## Project Structure

```
revest-assignment/
├── backend/
│   ├── product-service/   # Product CRUD + TCP microservice (port 3001/3002)
│   └── order-service/     # Order CRUD + inter-service communication (port 3003)
├── client/                # Next.js dynamic signup form (port 3000)
└── README.md
```

## Prerequisites

- Node.js 20+
- npm

## Backend — Microservices

### Architecture

| Service | HTTP Port | Microservice Port | Responsibility |
|---------|-----------|-------------------|----------------|
| Product Service | 3001 | 3002 (TCP) | Product CRUD, stock management |
| Order Service | 3003 | — | Order CRUD, validates products via Product Service |

**Inter-service communication:** Order Service calls Product Service over **TCP** using NestJS message patterns (`get_product`, `reserve_stock`, `release_stock`, etc.).

### Run Product Service

```bash
cd backend/product-service
npm install
npm run start:dev
```

### Run Order Service (in a separate terminal)

```bash
cd backend/order-service
npm install
npm run start:dev
```

> **Important:** Start Product Service before Order Service.

### API Examples

#### 1. Create a Product

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless POS Terminal",
    "sku": "POS-001",
    "description": "Retail POS handheld device",
    "price": 499.99,
    "stock": 50,
    "category": "Hardware"
  }'
```

#### 2. Create an Order (uses Product Service internally)

Replace `PRODUCT_ID` with the id returned from step 1.

```bash
curl -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Ahmed Al-Rashid",
    "customerEmail": "ahmed@example.com",
    "shippingAddress": "Riyadh, Saudi Arabia",
    "items": [
      { "productId": "PRODUCT_ID", "quantity": 2 }
    ],
    "notes": "Priority delivery"
  }'
```

#### 3. Get Orders with Product Details

```bash
curl http://localhost:3003/orders
```

#### 4. Get All Products

```bash
curl http://localhost:3001/products
```

### Product Schema

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Auto-generated |
| name | string | Product name |
| sku | string | Unique SKU |
| description | string | Product description |
| price | number | Unit price |
| stock | number | Available quantity |
| category | string | Product category |
| status | enum | ACTIVE, INACTIVE, DISCONTINUED |

### Order Schema

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Auto-generated |
| customerName | string | Customer full name |
| customerEmail | string | Customer email |
| shippingAddress | string | Delivery address |
| status | enum | PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED |
| items | array | Order line items with productId, quantity, unitPrice, subtotal |
| totalAmount | number | Computed order total |
| products | array | Enriched product details (on GET) |

---

## Frontend — Dynamic Signup Form

### Features

- **JSON-driven fields** — form renders from `client/src/data/form-schema.json`
- **Dynamic field types** — TEXT, LIST (dropdown), RADIO
- **Validation** — React Hook Form + Zod (min/max length, required, email)
- **Schema editor** — edit JSON live to change labels, types, required flags
- **Persistence** — submissions saved to `localStorage`

### Run Client

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Supported Field Types

| fieldType | Renders As |
|-----------|------------|
| TEXT | MUI TextField |
| LIST | MUI Select dropdown |
| RADIO | MUI RadioGroup |

Change `"fieldType": "LIST"` to `"RADIO"` (or vice versa) in the JSON editor and click **Apply Schema** to see the UI update instantly.

---

## Tech Stack

**Backend:** NestJS 10, @nestjs/microservices (TCP), class-validator, class-transformer

**Frontend:** Next.js 14, TypeScript, Material UI, React Hook Form, Zod

---

## Author

Assignment submission for Revest Solutions — Senior Full Stack Developer
