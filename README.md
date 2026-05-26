# ARIS - Accident Response Intelligence System
> Every Second Saves a Life

## Live Demo
🌐 https://aris.rkdev.online
📧 Login: admin@aris.com / Admin@1234

## Tech Stack
- Frontend: React 19, TypeScript, 
  TanStack Router, Tailwind CSS, Recharts
- Backend: Node.js, Express, PostgreSQL
- Database: Supabase
- Deployment: Vercel + Render

## Features
✅ Real-time accident detection dashboard
✅ AI confidence scoring
✅ Live camera surveillance (6 feeds)
✅ Emergency dispatch system
✅ Analytics and heatmaps
✅ WebSocket real-time updates
✅ JWT authentication

## Setup Instructions
# Backend
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev

# Frontend  
cd frontend
npm install --legacy-peer-deps
npm run dev
