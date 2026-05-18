# Smart Leads Dashboard — API Documentation

Base URL: `http://localhost:5000/api/v1`

All protected endpoints require `Authorization: Bearer <accessToken>` header.

---

## Authentication

### POST `/auth/register`
Register a new user.

**Request body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass1",
  "role": "agent"           // optional: "admin" | "manager" | "agent"
}
```

**Response 201**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "agent" },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

---

### POST `/auth/login`
Authenticate and receive tokens.

**Request body**
```json
{ "email": "jane@example.com", "password": "SecurePass1" }
```

**Response 200**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "agent" },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

---

### POST `/auth/refresh`
Rotate tokens using a refresh token.

**Request body**
```json
{ "refreshToken": "..." }
```

**Response 200**
```json
{
  "success": true,
  "message": "Tokens refreshed",
  "data": { "accessToken": "...", "refreshToken": "..." }
}
```

---

### GET `/auth/me` 🔒
Return the authenticated user's profile.

**Response 200**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": { "id": "...", "email": "jane@example.com", "role": "agent" }
}
```

---

## Leads

All leads endpoints require authentication (`🔒`).

### GET `/leads` 🔒
List leads with filtering, sorting, and pagination.

**Query parameters**

| Param       | Type   | Default    | Description                                                                 |
|-------------|--------|------------|-----------------------------------------------------------------------------|
| `page`      | number | `1`        | Page number                                                                 |
| `limit`     | number | `10`       | Records per page (max 100)                                                  |
| `sort`      | string | `createdAt`| Field to sort by (`createdAt`, `firstName`, `status`, `priority`, `value`) |
| `order`     | string | `desc`     | `asc` or `desc`                                                             |
| `status`    | string | —          | `new` \| `contacted` \| `qualified` \| `proposal` \| `negotiation` \| `won` \| `lost` |
| `source`    | string | —          | `website` \| `referral` \| `social_media` \| `cold_call` \| `email_campaign` \| `event` \| `other` |
| `priority`  | string | —          | `low` \| `medium` \| `high`                                                |
| `search`    | string | —          | Full-text search across name, email, company                                |
| `dateFrom`  | string | —          | ISO date — filter `createdAt >=`                                            |
| `dateTo`    | string | —          | ISO date — filter `createdAt <=`                                            |
| `assignedTo`| string | —          | User ObjectId                                                               |

Multiple filters combine with AND logic.

**Response 200**
```json
{
  "success": true,
  "message": "Leads retrieved",
  "data": {
    "data": [ { /* Lead object */ } ],
    "pagination": { "total": 42, "page": 1, "limit": 10, "pages": 5 }
  }
}
```

---

### GET `/leads/stats` 🔒
Aggregate statistics for the dashboard.

**Response 200**
```json
{
  "success": true,
  "message": "Stats retrieved",
  "data": {
    "byStatus": { "new": 10, "contacted": 4, "qualified": 2, "won": 1, "lost": 0, "proposal": 0, "negotiation": 0 },
    "bySource": { "website": 5, "referral": 3, "social_media": 2, "cold_call": 1, "email_campaign": 1, "event": 1, "other": 4 },
    "byPriority": { "low": 3, "medium": 9, "high": 5 },
    "totalValue": 150000,
    "avgValue": 8823.5
  }
}
```

---

### GET `/leads/export` 🔒
Export leads as a CSV file (respects all filter params, no pagination limit).

**Query parameters** — same as `GET /leads` except `page` and `limit` are ignored.

**Response 200** — `Content-Type: text/csv`
```
ID,First Name,Last Name,Email,...
...
```

---

### GET `/leads/:id` 🔒
Retrieve a single lead by ID.

**Response 200**
```json
{
  "success": true,
  "message": "Lead retrieved",
  "data": { /* Lead object with populated assignedTo and createdBy */ }
}
```

---

### POST `/leads` 🔒
Create a new lead.

**Request body**
```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul@example.com",
  "source": "instagram",
  "status": "new",
  "priority": "high",
  "phone": "+91-9999999999",
  "company": "Acme Ltd",
  "value": 5000,
  "notes": "Interested in enterprise plan"
}
```

**Response 201**
```json
{ "success": true, "message": "Lead created", "data": { /* Lead object */ } }
```

---

### PATCH `/leads/:id` 🔒
Partially update a lead. All body fields are optional.

**Response 200**
```json
{ "success": true, "message": "Lead updated", "data": { /* Updated Lead */ } }
```

---

### DELETE `/leads/:id` 🔒🛡️ (admin / manager only)
Delete a lead.

**Response 204** — No content

---

## Lead Object Schema

```typescript
{
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  source: 'website' | 'referral' | 'social_media' | 'cold_call' | 'email_campaign' | 'event' | 'other';
  priority: 'low' | 'medium' | 'high';
  value?: number;
  notes?: string;
  tags: string[];
  assignedTo?: { id: string; name: string; email: string };
  createdBy: { id: string; name: string; email: string };
  lastContactedAt?: string;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": { "fieldName": ["Validation message"] }   // Only for 422 validation errors
}
```

| Status | Meaning                          |
|--------|----------------------------------|
| 400    | Bad request / validation failed  |
| 401    | Missing or invalid token         |
| 403    | Insufficient role permissions    |
| 404    | Resource not found               |
| 409    | Conflict (e.g. email taken)      |
| 422    | Schema validation error (Zod)    |
| 429    | Rate limit exceeded              |
| 500    | Internal server error            |

---

## Role-Based Access Control

| Role      | Create Lead | Read Leads | Update Lead | Delete Lead | View Stats |
|-----------|:-----------:|:----------:|:-----------:|:-----------:|:----------:|
| `admin`   | ✅          | ✅         | ✅          | ✅          | ✅         |
| `manager` | ✅          | ✅         | ✅          | ✅          | ✅         |
| `agent`   | ✅          | ✅         | ✅          | ❌          | ✅         |

> **Assignment mapping:** `admin` = Admin role, `agent` = Sales User role (as specified in the assignment).
