# Smart Leads Dashboard

A production-grade full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing sales leads with role-based access control, real-time pipeline analytics, and JWT authentication.

---

## 📸 Feature Overview

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT access + refresh token rotation |
| 👥 Role-Based Access | `admin`, `manager`, `agent` (Sales User) roles |
| 📋 Lead Management | Full CRUD with filters, sort, pagination (10/page) |
| 📊 Analytics Dashboard | Pipeline stage funnel, source breakdown, KPIs |
| 🔍 Search & Filter | Debounced full-text search + status/source/priority filters |
| 📤 CSV Export | Export all matching leads (respects active filters) |
| 🐳 Docker Support | One-command production deployment |
| ✅ Test Suite | Integration + unit tests with in-memory MongoDB |
| 🔒 Security | Helmet, rate limiting, Mongo sanitisation |

---

## 🗂 Folder Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── __tests__/          # Jest tests (auth, leads, unit)
│   │   ├── config/             # env validation, database connection
│   │   ├── controllers/        # thin request/response handlers
│   │   ├── middleware/         # auth, validation, error handler
│   │   ├── models/             # Mongoose models (User, Lead, Activity)
│   │   ├── routes/             # Express routers
│   │   ├── services/           # business logic layer
│   │   ├── types/              # shared TypeScript types
│   │   ├── utils/              # logger, AppError, response helpers
│   │   ├── validators/         # Zod schemas
│   │   ├── app.ts              # Express app factory
│   │   └── index.ts            # server entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client + typed API modules
│   │   ├── components/
│   │   │   ├── auth/           # ProtectedRoute, PublicRoute
│   │   │   ├── layout/         # Sidebar, AppLayout
│   │   │   ├── leads/          # LeadTable, LeadForm, LeadFiltersBar
│   │   │   └── ui/             # Button, Input, Select, Badge, Modal, StatCard, Pagination
│   │   ├── hooks/              # useAuth, useLeads
│   │   ├── pages/              # DashboardPage, LeadsPage, AnalyticsPage, SettingsPage, Login, Register
│   │   ├── router/             # React Router v6 config
│   │   ├── store/              # Zustand slices (auth, leads)
│   │   ├── types/              # shared TypeScript interfaces
│   │   ├── utils/              # cn, formatCurrency, formatDate, getInitials
│   │   ├── validators/         # Zod form schemas
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker-compose.yml          # Production stack
├── docker-compose.dev.yml      # Dev MongoDB only
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Docker & Docker Compose (for MongoDB)
- Git

---

### 1 — Clone & install dependencies

```bash
git clone <your-repo-url> smart-leads-dashboard
cd smart-leads-dashboard

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

---

### 2 — Start MongoDB via Docker

```bash
# From the project root
docker compose -f docker-compose.dev.yml up -d
```

MongoDB will be available at `mongodb://localhost:27017`.

---

### 3 — Configure environment variables

**Backend:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-chars
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
BCRYPT_SALT_ROUNDS=12
```

**Frontend:**

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

### 4 — Start development servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Server running on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → Vite dev server on http://localhost:5173
```

Open **http://localhost:5173** and register your first account.

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

### Test Coverage Areas

| File | Tests |
|---|---|
| `auth.test.ts` | Register, login, /me, token refresh |
| `leads.test.ts` | Full CRUD, filters, pagination, RBAC |
| `unit.test.ts` | AppError class, all Zod validators |

---

## 🐳 Docker Production Deployment

### 1 — Create production env file

```bash
cp backend/.env.example backend/.env
# Fill in production values — strong JWT secrets, real Mongo URI, etc.
```

### 2 — Build and start all services

```bash
docker compose up --build -d
```

This starts:
- **MongoDB** on port `27017`
- **Backend** API on port `5000`
- **Frontend** (nginx) on port `80`

### 3 — Check health

```bash
# All containers running
docker compose ps

# Backend health endpoint
curl http://localhost:5000/health

# View logs
docker compose logs -f backend
```

### Stop everything

```bash
docker compose down
# Remove volumes too
docker compose down -v
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Create account |
| `POST` | `/auth/login` | ❌ | Login, returns tokens |
| `POST` | `/auth/refresh` | ❌ | Refresh access token |
| `GET` | `/auth/me` | ✅ | Get current user |

### Leads

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/leads` | ✅ | All | List leads (filter/sort/paginate) |
| `POST` | `/leads` | ✅ | All | Create lead |
| `GET` | `/leads/:id` | ✅ | All | Get single lead |
| `PATCH` | `/leads/:id` | ✅ | All | Update lead |
| `DELETE` | `/leads/:id` | ✅ | admin, manager | Delete lead |
| `GET` | `/leads/stats` | ✅ | admin, manager | Pipeline statistics |

### Query Parameters — `GET /leads`

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page, max 100 (default: 20) |
| `sort` | string | Field to sort by |
| `order` | `asc\|desc` | Sort direction |
| `status` | LeadStatus | Filter by status |
| `priority` | LeadPriority | Filter by priority |
| `source` | LeadSource | Filter by source |
| `search` | string | Full-text search |

### Response Shape

```json
{
  "success": true,
  "message": "Leads retrieved",
  "data": {
    "data": [...],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

## 🔐 User Roles

| Role | Leads CRUD | Delete | Stats | User Management |
|---|---|---|---|---|
| `admin` | ✅ | ✅ | ✅ | ✅ |
| `manager` | ✅ | ✅ | ✅ | ❌ |
| `agent` | ✅ | ❌ | ❌ | ❌ |

---

## 🛠 Available Scripts

### Backend

```bash
npm run dev          # Start with hot-reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled dist/index.js
npm test             # Run Jest test suite
npm run test:coverage # Tests with coverage report
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
```

### Frontend

```bash
npm run dev          # Vite dev server
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally
npm run lint         # ESLint check
npm run format       # Prettier format
```

---

## 🧱 Architecture Decisions

- **Service layer pattern** — controllers are thin; all business logic lives in `services/`
- **Centralised error handling** — `AppError` class + global `errorHandler` middleware
- **Zod on both sides** — schemas on backend (request validation) and frontend (form validation) share the same shape
- **Zustand slices** — `auth.store` and `leads.store` are independent, persisted where appropriate
- **Axios interceptors** — automatic token injection and silent refresh on 401
- **In-memory MongoDB** — `mongodb-memory-server` keeps tests fast and fully isolated

---

## 📡 API Documentation

Full REST API reference is available in **[API.md](./API.md)**.

Quick summary of endpoints:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | Public | Register user |
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/refresh` | Public | Refresh tokens |
| GET | `/api/v1/auth/me` | 🔒 | Get profile |
| GET | `/api/v1/leads` | 🔒 | List leads (filtered, paginated) |
| GET | `/api/v1/leads/stats` | 🔒 | Aggregate stats |
| GET | `/api/v1/leads/export` | 🔒 | Export CSV |
| GET | `/api/v1/leads/:id` | 🔒 | Get single lead |
| POST | `/api/v1/leads` | 🔒 | Create lead |
| PATCH | `/api/v1/leads/:id` | 🔒 | Update lead |
| DELETE | `/api/v1/leads/:id` | 🔒 admin/manager | Delete lead |

---

## 📦 Key Dependencies

### Backend
- `express` + `typescript` — HTTP server
- `mongoose` — MongoDB ODM
- `zod` — runtime schema validation
- `jsonwebtoken` + `bcryptjs` — auth
- `helmet` + `express-rate-limit` — security
- `winston` — structured logging
- `jest` + `supertest` + `mongodb-memory-server` — testing

### Frontend
- `react` + `vite` + `typescript`
- `react-router-dom` v6 — routing
- `zustand` — global state
- `axios` — HTTP client with interceptors
- `react-hook-form` + `zod` — form handling and validation
- `tailwindcss` — styling
- `lucide-react` — icons
- `react-hot-toast` — notifications

---

## Live URL Link: 
The application is deployed and can be accessed at: [smart-lead-dashboard-one.vercel.app](https://smart-lead-dashboard-one.vercel.app/login)


## Deployment Note

This project uses `NODE_ENV=development` on Render because
TypeScript build tooling and typings are required during deployment.

In a production-grade setup:
- CI builds compiled JS artifacts
- runtime uses production-only dependencies
- Docker multi-stage builds are preferred