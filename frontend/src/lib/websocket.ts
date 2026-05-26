// ARIS WebSocket service
const WS_URL = "ws://localhost:5000/ws";

type EventHandler = (data: unknown) => void;

class ARISWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectTimer: number | null = null;
  private reconnectDelay = 3000;
  private maxReconnectDelay = 30000;
  private intentionalClose = false;

  connect(): void {
    if (typeof window === "undefined") return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("[WS] Connected to ARIS server");
        this.reconnectDelay = 3000; // reset on success
      };

      this.ws.onmessage = (event) => {
        try {
          const { event: name, data } = JSON.parse(event.data);
          const handlers = this.handlers.get(name);
          if (handlers) handlers.forEach((h) => h(data));
        } catch {
          // ignore malformed
        }
      };

      this.ws.onclose = () => {
        if (!this.intentionalClose) {
          console.warn(`[WS] Disconnected. Reconnecting in ${this.reconnectDelay}ms...`);
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        // Error handled by onclose
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    this.ws?.close();
    this.ws = null;
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  send(event: string, data?: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }
}

export const wsClient = new ARISWebSocket();
