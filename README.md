# ARIS — Accident Response Intelligence System

![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-aris.rkdev.online-00E5FF?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/Real--time-WebSocket-FFB800?style=for-the-badge)

> Every Second Saves a Life. An intelligent, event-driven surveillance and automated emergency response system designed to minimize vehicle accident dispatch latency.

---

## 🌐 Live Demo & Credentials
- **Frontend App:** [aris.rkdev.online](https://aris.rkdev.online)
- **Backend API:** [aris-335h.onrender.com](https://aris-335h.onrender.com)
- **Demo Account:** `admin@aris.com` / `Admin@1234` *(Fallback Demo mode is automatically enabled if the backend API is sleeping).*

---

## 📌 Project Overview & Problem Statement

### The Problem
When a traffic collision occurs, every second of delay in response increases fatality rates. In standard city infrastructures:
- **Accidents go unreported** for several critical minutes, relying entirely on passersby to make phone calls.
- **Dispatch processes are manual**, fragmented, and slow, requiring emergency operators to cross-reference multiple communication networks.
- **Responders lack a single unified view**, rendering it difficult to inspect live video telemetry, coordinates, and local responder availability simultaneously.

### The Solution
**ARIS** solves this by creating an automated pipeline from the initial crash to first-responder dispatch. It integrates continuous computer vision analysis of traffic camera feeds, triggers instantaneous event broadcasts to an operator dashboard, and orchestrates automated emergency dispatch notifications.

---

## 📸 Screenshots Placeholders

### Command Center Dashboard
*Real-time surveillance feeds grid with interactive Leaflet GIS positioning and active incident alerts.*
```
[Insert Screenshot of Command Center HUD here]
```

### Telemetry & Live Camera Feeds
*Automated, looping traffic feeds running local mock video streams with active Rec indicators and HUD analytics.*
```
[Insert Screenshot of Surveillance Cameras Grid here]
```

---

## ⚡ How It Works (System Flow)

```
[Traffic Camera Video] ──► [CV Collision Detection] ──► [WS Ingest Server]
                                                             │
[PostgreSQL Archival]  ◄── [Automated Dispatch]  ◄── [React Operator HUD]
```

1. **Computer Vision Detection:** Real-time camera feeds are processed continuously using a computer vision pipeline to identify vehicle collisions, single-vehicle skids, and multi-car pileups. The system filters out environmental noise and assigns a dynamic AI confidence score (75–99%) to guarantee high-integrity event detection. *(Demo mode simulates this telemetry payload locally).*
2. **Low-Latency Event Ingestion:** Immediately upon collision confirmation, the backend triggers an event-driven payload and broadcasts it via raw WebSockets (`ws`) to all connected clients. The React-based Command Center HUD ingests this message in milliseconds, instantaneously plotting the accident coordinates on the Leaflet map and triggering a visual alert card.
3. **Automated Emergency Dispatch:** Once an alert is active, the platform coordinates immediate dispatch workflows using integrated communication channels like Twilio SMS and Nodemailer email to notify the nearest police, hospital, and fire units. Operators can also utilize the dashboard to manually trigger custom dispatches or override automated notifications.
4. **Immutable Incident Audit Trail:** Every detected accident, dispatch event, and operator response is recorded to a secure Supabase-managed PostgreSQL database with strict timestamps, severity levels, and resolution status logs.

---

## 🛠️ Tech Stack Details

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, TanStack Router, Recharts, Leaflet GIS |
| **Backend** | Node.js, Express, WebSocket (`ws` module), JSON Web Tokens (JWT) |
| **Database** | PostgreSQL, Supabase |
| **Infrastructure** | Vercel (Client Hosting), Render (API Web Service), Supabase (Database Management) |

---

## 🗄️ Database Schema

The system uses three primary tables in PostgreSQL, fully managed via Supabase, to guarantee high-integrity tracking of incidents and notifications:

*   **`accidents` Table:** Tracks the core telemetry of every crash.
    *   Fields: `id` (PK), `cameraId` (FK), `severity` (CRITICAL, HIGH, MEDIUM, LOW), `status` (ACTIVE, RESPONDING, RESOLVED), `confidence`, `lat`, `lng`, `vehicles`, `injuries`, `timestamp`.
*   **`emergency_contacts` Table:** Stores the directory of active responder services.
    *   Fields: `id` (PK), `name`, `type` (POLICE, HOSPITAL, AMBULANCE, FIRE), `city`, `phone`, `address`, `responseTime`.
*   **`audit_logs` / `alerts` Table:** Records the complete history of automated dispatches and logs.
    *   Fields: `id` (PK), `accidentId` (FK), `contactName`, `type`, `sentAt`, `status` (SENT, FAILED, PENDING), `method` (SMS, CALL, EMAIL).

---

## 💡 Why I Built This

I built ARIS because I wanted to move past standard, static Todo lists and CRUD applications and build a complex, high-frequency, event-driven system that mirrors a real-world production utility. I wanted to demonstrate my ability to architect a full-stack system that handles fast WebSocket uplinks, dynamic rendering performance, and secure, fault-tolerant database schemas.

ARIS shows how I think as an engineer:
- **I care about real-world utility:** Public safety systems shouldn't suffer from high network latency or broken stylesheets.
- **I engineer for stability:** Adding features like automated demo fallback logins, environment-resolved WebSocket protocols, and local video asset hosting to prevent CORS errors shows that I build with production environments in mind.
- **I enjoy complex state management:** Wiring live maps, WebSockets, real-time audio/visual alert states, and responsive charts into a cohesive single-page app was a great challenge in writing clean, modular React.

I'm actively looking for software engineering roles where I can bring this same level of enthusiasm, structure, and problem-solving to a collaborative team.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL or Supabase instance

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment template and configure your database and authentication variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database with core emergency contacts and initial records:
   ```bash
   npm run seed
   ```
5. Run the local development API:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (supporting legacy peer peer dependencies):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

---

## 👤 Developer

**Rahul Kumar**
- 🌐 **Portfolio:** [rkdev.online](https://rkdev.online)
- 💼 **LinkedIn:** [linkedin.com/in/rk1017](https://linkedin.com/in/rk1017)
- 🐙 **GitHub:** [github.com/Rah7858](https://github.com/Rah7858)
