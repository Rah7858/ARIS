# ARIS — Accident Response Intelligence System

> Production-ready backend for AI-powered accident detection, real-time alerting, and emergency response coordination.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express.js 4.x |
| Database | PostgreSQL 14+ |
| Real-time | WebSocket (`ws`) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Email | Nodemailer |
| Security | Helmet, CORS, express-rate-limit |
| Validation | express-validator |
| Logging | Morgan |
| File Upload | Multer |

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL, JWT_SECRET, SMTP_* etc.
```

### 3. Create the database

```bash
# Create DB in psql:
psql -U postgres -c "CREATE DATABASE aris;"
```

### 4. Apply schema + seed data

```bash
npm run seed
```

> The seed script applies `schema.sql` automatically then inserts all test data.

### 5. Start the server

```bash
npm run dev      # development (nodemon)
npm start        # production
```

Server starts at **http://localhost:5000**

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_SECURE` | `false` | Use TLS (true for port 465) |
| `SMTP_USER` | — | SMTP username/email |
| `SMTP_PASS` | — | SMTP password / app password |
| `SMTP_FROM` | — | From address for emails |
| `CLIENT_URLS` | `http://localhost:3000,http://localhost:5173` | Comma-separated CORS origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | `10` | Max auth attempts per window |
| `WS_HEALTH_INTERVAL_MS` | `30000` | WebSocket health broadcast interval |
| `AI_MIN_DELAY_MS` | `300` | AI mock min processing delay |
| `AI_MAX_DELAY_MS` | `800` | AI mock max processing delay |
| `AI_MIN_CONFIDENCE` | `75` | AI mock min confidence % |
| `AI_MAX_CONFIDENCE` | `99` | AI mock max confidence % |

---

## API Reference

**Base URL:** `http://localhost:5000/api/v1`  
**Auth Header:** `Authorization: Bearer <token>`

---

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Server health check |

---

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, receive JWT |
| GET | `/auth/profile` | Yes | Get current user |
| PUT | `/auth/profile` | Yes | Update name/phone |
| POST | `/auth/logout` | Yes | Logout (stateless) |

**Register / Login Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Secret@123",
  "role": "operator",
  "phone": "+91-9000000001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "...", "email": "...", "role": "..." },
    "token": "eyJ..."
  }
}
```

---

### Cameras

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/cameras` | Any | List cameras (filter: city, status; pagination) |
| GET | `/cameras/:id` | Any | Get camera by ID |
| POST | `/cameras` | operator+ | Create camera |
| PUT | `/cameras/:id` | operator+ | Update camera |
| PATCH | `/cameras/:id/status` | operator+ | Toggle status |
| DELETE | `/cameras/:id` | admin | Delete camera |

**Query Params (GET /cameras):** `city`, `status`, `page`, `limit`

---

### Accidents

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/accidents` | Any | List accidents (filters + pagination) |
| GET | `/accidents/live` | Any | Active accidents (detected/responding) |
| GET | `/accidents/stats` | Any | Summary statistics |
| GET | `/accidents/:id` | Any | Get accident + alerts + incidents |
| POST | `/accidents` | operator+ | Record new accident |
| PUT | `/accidents/:id/status` | operator+ | Update status |
| DELETE | `/accidents/:id` | admin | Delete accident |

**Query Params (GET /accidents):** `severity`, `status`, `city`, `date_from`, `date_to`, `page`, `limit`

---

### Alerts

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/alerts` | Any | List alerts (filter: type, status, accident_id) |
| POST | `/alerts/send` | operator+ | Send alert (email/sms/system) |
| PUT | `/alerts/:id/status` | operator+ | Update alert status |

**POST /alerts/send Body:**
```json
{
  "accident_id": "uuid",
  "type": "email",
  "recipient_name": "Traffic Control",
  "recipient_contact": "traffic@example.com"
}
```

---

### Emergency Contacts

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/emergency-contacts` | Any | List contacts (filter: city, type) |
| GET | `/emergency-contacts/city/:city` | Any | All contacts for a city (grouped by type) |
| GET | `/emergency-contacts/:id` | Any | Get contact by ID |
| POST | `/emergency-contacts` | operator+ | Create contact |
| PUT | `/emergency-contacts/:id` | operator+ | Update contact |
| DELETE | `/emergency-contacts/:id` | admin | Delete contact |

---

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/analytics/dashboard` | Yes | Summary KPIs + recent accidents |
| GET | `/analytics/heatmap` | Yes | Geo coordinates for accident heatmap |
| GET | `/analytics/hourly` | Yes | Hourly distribution (query: `days`) |
| GET | `/analytics/severity` | Yes | Severity breakdown + 30-day trend |
| GET | `/analytics/response-times` | Yes | Response times by severity/city |
| GET | `/analytics/weekly` | Yes | Weekly totals (query: `weeks`) |
| GET | `/analytics/cities` | Yes | City-level comparison |

---

### AI Detection

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ai/detect/image` | Yes | Analyse image file (multipart) or `{image_data}` |
| POST | `/ai/detect/frame` | Yes | Analyse video frame `{frame_id, camera_id}` |
| GET | `/ai/detect/health` | Yes | AI service health |

**POST /ai/detect/image** — multipart/form-data field: `image` (jpg/png/webp, max 10MB)

**AI Response:**
```json
{
  "success": true,
  "data": {
    "accident_detected": true,
    "severity": "high",
    "confidence": 0.9123,
    "confidence_pct": 91,
    "vehicle_count": 3,
    "description": "Three-vehicle accident near junction...",
    "bounding_boxes": [
      { "id": 1, "label": "car", "confidence": 0.94, "bbox": { "x": 120, "y": 80, "width": 180, "height": 110 } }
    ],
    "model_version": "aris-mock-v1.0",
    "processing_time_ms": 547,
    "analysed_at": "2026-05-26T10:00:00.000Z"
  }
}
```

---

## WebSocket

Connect to: `ws://localhost:5000/ws`

### Events (Server → Client)

| Event | Trigger | Payload |
|---|---|---|
| `system:connected` | On connect | `{ message, timestamp }` |
| `accident:detected` | New accident created | `{ accident }` |
| `accident:updated` | Status changed | `{ accidentId, status, updatedBy }` |
| `alert:sent` | Alert dispatched | `{ alert, accident }` |
| `camera:status` | Camera created/updated/deleted | `{ camera, action }` |
| `system:health` | Every 30 seconds | `{ status, uptime_seconds, memory_mb, connected_clients }` |

### Events (Client → Server)

| Event | Description |
|---|---|
| `ping` | Heartbeat — server replies with `pong` |

**Example (browser):**
```js
const ws = new WebSocket('ws://localhost:5000/ws');
ws.onmessage = ({ data }) => {
  const { event, data: payload } = JSON.parse(data);
  console.log(event, payload);
};
ws.onopen = () => ws.send(JSON.stringify({ event: 'ping' }));
```

---

## Database Schema

```
users               — authentication & roles
cameras             — CCTV camera registry
accidents           — detected accident records
alerts              — email/sms/system notifications
emergency_contacts  — police/hospital/ambulance/fire per city
incidents           — responder activity logs
```

All tables use UUID primary keys. Auto-update triggers maintain `updated_at`.

---

## Seed Data

Test credentials after `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@aris.com | Admin@1234 |
| Operator | operator@aris.com | Operator@1234 |
| Viewer | viewer@aris.com | Viewer@1234 |

Seeded data: 5 cameras, 15 accidents, 20 emergency contacts, 7 alerts, 6 incidents across Mumbai, Delhi, Bangalore, Chennai, and Pune.

---

## Project Structure

```
backend/
├── server.js                   # HTTP + WebSocket entry point
├── src/
│   ├── app.js                  # Express app (middleware + routes)
│   ├── config/
│   │   ├── database.js         # pg Pool
│   │   └── mailer.js           # Nodemailer transporter
│   ├── middleware/
│   │   ├── auth.js             # JWT verification + RBAC
│   │   ├── validate.js         # express-validator rule sets
│   │   └── errorHandler.js     # Global 404 + error handler
│   ├── services/
│   │   ├── websocket.js        # WS server + broadcast()
│   │   ├── mailer.js           # sendAlertEmail() + HTML templates
│   │   └── aiDetection.js      # Mock AI — detectAccident()
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cameraController.js
│   │   ├── accidentController.js
│   │   ├── alertController.js
│   │   ├── emergencyContactController.js
│   │   ├── analyticsController.js
│   │   └── aiController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cameras.js
│   │   ├── accidents.js
│   │   ├── alerts.js
│   │   ├── emergencyContacts.js
│   │   ├── analytics.js
│   │   └── ai.js
│   └── db/
│       ├── schema.sql          # DDL for all 6 tables
│       └── seed.js             # Seed script
├── .env.example
├── .gitignore
├── nodemon.json
└── package.json
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message.",
  "errors": [{ "field": "email", "message": "Valid email is required." }]
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid/expired token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## License

MIT © ARIS Team
