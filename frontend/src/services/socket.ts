export type SocketMessage = {
  type: string;
  roomId?: string;
  playerId?: string;
  payload?: unknown;
};

type Handler = (msg: SocketMessage) => void;

let ws: WebSocket | null = null;
const handlers = new Set<Handler>();

function getUrl(): string {
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_WS_URL;
  if (envUrl) return envUrl;
  return "ws://localhost:8080/ws";
}

export function connect(url = getUrl()): WebSocket {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws;
  }

  ws = new WebSocket(url);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as SocketMessage;
      handlers.forEach((h) => h(msg));
    } catch {
      // ignore non-JSON messages
    }
  };

  ws.onclose = () => {
    ws = null;
  };

  ws.onerror = () => {
    // let onclose handle cleanup
  };

  return ws;
}

export function disconnect(): void {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function send(msg: SocketMessage): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connect();
    // queue send until open
    const target = ws;
    if (target) {
      const onOpen = () => {
        target.removeEventListener("open", onOpen);
        if (target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify(msg));
        }
      };
      target.addEventListener("open", onOpen);
    }
    return;
  }
  ws.send(JSON.stringify(msg));
}

export function onMessage(handler: Handler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function getSocket(): WebSocket | null {
  return ws;
}

export function isConnected(): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}
