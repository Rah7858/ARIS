'use strict';

const { WebSocketServer, OPEN } = require('ws');

let wss = null;

/**
 * Initialize the WebSocket server on an existing HTTP server.
 * @param {import('http').Server} httpServer
 */
function init(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Client connected from ${ip}. Total: ${wss.clients.size}`);

    // Send welcome / connection ack
    ws.send(JSON.stringify({
      event: 'system:connected',
      data: { message: 'Connected to ARIS WebSocket server.', timestamp: new Date().toISOString() },
    }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        // Heartbeat support
        if (msg.event === 'ping') {
          ws.send(JSON.stringify({ event: 'pong', data: { timestamp: new Date().toISOString() } }));
        }
      } catch (_) {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected. Total: ${wss.clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Client error:', err.message);
    });
  });

  console.log('[WS] WebSocket server initialised on /ws');
  return wss;
}

/**
 * Broadcast a structured event to ALL connected clients.
 * @param {string} event  - Event name (e.g. 'accident:detected')
 * @param {object} data   - Payload
 */
function broadcast(event, data) {
  if (!wss) return;

  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });

  wss.clients.forEach((client) => {
    if (client.readyState === OPEN) {
      client.send(payload);
    }
  });
}

/**
 * Get the WebSocket server instance.
 */
function getServer() {
  return wss;
}

module.exports = { init, broadcast, getServer };
