# Running Without Docker (Windows)

You do **not** need Docker. Only the **backend** needs PostgreSQL. The **frontend** runs standalone.

## Option A — Frontend only (fastest, no database)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — signup form works with localStorage.

---

## Option B — Full stack (backend + frontend)

### Step 1: Install PostgreSQL on Windows

Pick one:

**/winget (recommended)**
```powershell
winget install PostgreSQL.PostgreSQL.16
```

**Or download installer:** https://www.postgresql.org/download/windows/

During install, note the `postgres` user password you set.

### Step 2: Create databases

Open **SQL Shell (psql)** or PowerShell:

```powershell
# Replace YOUR_POSTGRES_PASSWORD with the password you chose at install
$env:PGPASSWORD = "YOUR_POSTGRES_PASSWORD"
psql -U postgres -f scripts/init-databases.sql
```

If `psql` is not in PATH, use the full path, e.g.:
`"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -f scripts/init-databases.sql`

### Step 3: Start all 3 backend services

```bash
# Terminal 1 — Auth Service (port 3004)
cd backend/auth-service
cp .env.example .env
npm install && npm run start:dev

# Terminal 2 — Product Service (port 3001)
cd backend/product-service
npm run start:dev

# Terminal 3 — Order Service (port 3003)
cd backend/order-service
npm run start:dev
```

### Step 4: Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Verify PostgreSQL is running

```powershell
# Should connect without ECONNREFUSED
psql -U revest -d product_db -h localhost -c "SELECT 1;"
```

Password: `revest_secret` (from init script)

---

## Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Auth API | http://localhost:3004 |
| Product API | http://localhost:3001 |
| Order API | http://localhost:3003 |

**Demo accounts:**
- Admin: `admin@revest.sa` / `Admin@123`
- User: sign up at `/signup`

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ECONNREFUSED 5432` | PostgreSQL not installed or service not started. Open **Services** → start **postgresql-x64-16** |
| `migration:run` fails | Use `DB_SYNCHRONIZE=true` in `.env` and skip migrations for local dev |
| `Cannot find module './app.module'` | Run `npm run build` once, then `npm run start:dev` |
| `docker: command not found` | Ignore Docker — use this guide instead |

---

## When you have Docker later

```bash
docker compose up -d --build
```

Set `DB_SYNCHRONIZE=false` and use `npm run migration:run` in production.
