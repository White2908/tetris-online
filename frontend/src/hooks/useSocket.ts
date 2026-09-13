import { useCallback, useEffect, useRef, useState } from "react";
import {
  connect,
  disconnect,
  isConnected as checkConnected,
  onMessage,
  send,
  type SocketMessage,
} from "../services/socket";

type UseSocketOptions = {
  autoConnect?: boolean;
  url?: string;
};

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, url } = options;

  const [isConnected, setIsConnected] = useState(checkConnected());
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);

  const urlRef = useRef(url);
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  useEffect(() => {
    if (!autoConnect) return;

    const ws = connect(urlRef.current);

    const handleOpen = () => setIsConnected(true);
    const handleClose = () => setIsConnected(false);
    const handleError = () => setIsConnected(false);

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("close", handleClose);
    ws.addEventListener("error", handleError);

    if (ws.readyState === WebSocket.OPEN) setIsConnected(true);

    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("close", handleClose);
      ws.removeEventListener("error", handleError);
    };
  }, [autoConnect]);

  useEffect(() => {
    const off = onMessage((msg) => setLastMessage(msg));
    return off;
  }, []);

  const sendMessage = useCallback((msg: SocketMessage) => {
    send(msg);
  }, []);

  const connectSocket = useCallback(() => {
    connect(urlRef.current);
  }, []);

  const disconnectSocket = useCallback(() => {
    disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect: connectSocket,
    disconnect: disconnectSocket,
  };
}

export default useSocket;
