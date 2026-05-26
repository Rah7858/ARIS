'use strict';

require('dotenv').config();

const http = require('http');
const app  = require('./src/app');
const ws   = require('./src/services/websocket');
const { pool } = require('./src/config/database');

const PORT = parseInt(process.env.PORT || '5000', 10);

// ─── Create HTTP server ───────────────────────────────────────────────────────
const server = http.createServer(app);

// ─── Attach WebSocket server ──────────────────────────────────────────────────
ws.init(server);

// ─── System health broadcast ──────────────────────────────────────────────────
const healthInterval = setInterval(() => {
  ws.broadcast('system:health', {
    status:          'operational',
    uptime_seconds:  process.uptime(),
    memory_mb:       Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    connected_clients: ws.getServer() ? ws.getServer().clients.size : 0,
    timestamp:       new Date().toISOString(),
  });
}, parseInt(process.env.WS_HEALTH_INTERVAL_MS || '30000', 10));

// ─── Start server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    // Test DB connection before binding
    await pool.query('SELECT 1');
    console.log('[DB] PostgreSQL connection verified.');

    server.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║       ARIS — Accident Response Intelligence       ║');
      console.log('╠══════════════════════════════════════════════════╣');
      console.log(`║  HTTP  → http://localhost:${PORT}                   ║`);
      console.log(`║  WS    → ws://localhost:${PORT}/ws                  ║`);
      console.log(`║  API   → http://localhost:${PORT}/api/v1            ║`);
      console.log(`║  Env   → ${(process.env.NODE_ENV || 'development').padEnd(38)}║`);
      console.log('╚══════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err.message);
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[SHUTDOWN] ${signal} received. Closing gracefully...`);
  clearInterval(healthInterval);
  server.close(async () => {
    await pool.end();
    console.log('[SHUTDOWN] DB pool closed. Exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

start();
