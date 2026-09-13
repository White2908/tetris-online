import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes";
import type { Room, Player, ChatMessage } from "../types/lobby";
import { useSocket } from "./useSocket";

// simple incremental id — replaces crypto.randomUUID()
let _id = 0;
const nextId = (p = "id") => `${p}-${++_id}-${Date.now().toString(36)}`;

export function useLobby() {
  const navigate = useNavigate();
  const { isConnected, lastMessage, sendMessage: wsSend } = useSocket({ autoConnect: true });

  const [username, setUsername] = useState(() => localStorage.getItem("username") || `Player${Math.floor(Math.random() * 1000)}`);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHost = currentRoom?.host === username;

  // persist username
  useEffect(() => { localStorage.setItem("username", username); }, [username]);

  // auto scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // fetch history when connected / room changes
  useEffect(() => {
    if (!isConnected) return;
    wsSend({ type: "get_history", roomId: currentRoom?.id ?? "", playerId: username, payload: { roomId: currentRoom?.id ?? "" } });
  }, [isConnected, currentRoom?.id, username, wsSend]);

  // incoming chat
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type === "chat") {
      const r = lastMessage.payload as { id: string; player: string; text: string; timestamp: string; roomId?: string };
      const msg: ChatMessage = { id: r.id, player: r.player, text: r.text, timestamp: new Date(r.timestamp) };
      queueMicrotask(() => setMessages((m) => (m.some((x) => x.id === msg.id) ? m : [...m, msg])));
    } else if (lastMessage.type === "chat_history" && Array.isArray(lastMessage.payload)) {
      const list = (lastMessage.payload as { id: string; player: string; text: string; timestamp: string }[]).map((r) => ({
        id: r.id, player: r.player, text: r.text, timestamp: new Date(r.timestamp),
      }));
      queueMicrotask(() => setMessages(list));
    }
  }, [lastMessage]);

  const joinRoom = useCallback((room: Room) => {
    if (room.players.length >= room.maxPlayers) return alert("Room is full!");
    if (room.status === "playing") return alert("Game already in progress!");
    setCurrentRoom(room);
    const list: Player[] = room.players.map((p) => ({ id: p, name: p, isHost: p === room.host, ready: p === room.host }));
    if (!list.find((p) => p.name === username)) list.push({ id: username, name: username, isHost: false, ready: false });
    setPlayers(list);
    setShowJoinModal(false);
    setJoinRoomId("");
    setMessages([]);
  }, [username]);

  const createRoom = useCallback(() => {
    if (!newRoomName.trim()) return;
    const room: Room = { id: nextId("room"), name: newRoomName, players: [username], maxPlayers: 4, status: "waiting", host: username };
    setRooms((r) => [...r, room]);
    joinRoom(room);
    setShowCreateModal(false);
    setNewRoomName("");
  }, [newRoomName, username, joinRoom]);

  const joinRoomById = useCallback(() => {
    const r = rooms.find((x) => x.id === joinRoomId);
    if (r) {
      joinRoom(r);
    } else {
      alert("Room not found!");
    }
  }, [rooms, joinRoomId, joinRoom]);

  const leaveRoom = useCallback(() => {
    setCurrentRoom(null);
    setPlayers([]);
    setMessages([]);
  }, []);

  const toggleReady = useCallback(() => {
    setPlayers((p) => p.map((x) => (x.name === username ? { ...x, ready: !x.ready } : x)));
  }, [username]);

  const startGame = useCallback(() => {
    if (!isHost || !currentRoom || gameStarting) return;
    const notReady = players.filter((p) => !p.isHost && !p.ready);
    if (notReady.length) return alert(`Waiting for ${notReady.map((p) => p.name).join(", ")}`);
    setGameStarting(true);
    wsSend({ type: "start_game", roomId: currentRoom.id, playerId: username, payload: {} });
    // optimistic update, will be confirmed by server; fallback navigate anyway
    setRooms((r) => r.map((x) => x.id === currentRoom.id ? { ...x, status: "playing" as const } : x));
    setCurrentRoom((r) => r ? { ...r, status: "playing" as const } : null);
  }, [isHost, currentRoom, gameStarting, players, username, wsSend]);

  // handle start_game response -> navigate and clear loading
  useEffect(() => {
    if (!lastMessage || !gameStarting || !currentRoom) return;
    if (lastMessage.type === "game_started" && lastMessage.roomId === currentRoom.id) {
      queueMicrotask(() => setGameStarting(false));
      navigate(ROUTES.GAME, { state: { roomId: currentRoom.id, mode: "multi" as const, players } });
    } else if (lastMessage.type === "error") {
      // simple: clear loading on any error while starting
      queueMicrotask(() => {
        setGameStarting(false);
        // revert optimistic status
        setRooms((r) => r.map((x) => x.id === currentRoom.id ? { ...x, status: "waiting" as const } : x));
        setCurrentRoom((r) => r ? { ...r, status: "waiting" as const } : null);
      });
    }
  }, [lastMessage, gameStarting, currentRoom, players, navigate]);

  // fallback: if server doesn't reply (offline/mock), navigate after short delay and clear loading
  useEffect(() => {
    if (!gameStarting || !currentRoom) return;
    const t = setTimeout(() => {
      if (gameStarting) {
        setGameStarting(false);
        navigate(ROUTES.GAME, { state: { roomId: currentRoom.id, mode: "multi" as const, players } });
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [gameStarting, currentRoom, players, navigate]);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    wsSend({ type: "chat", roomId: currentRoom?.id ?? "", playerId: username, payload: { text: newMessage, player: username, roomId: currentRoom?.id ?? "" } });
    setNewMessage("");
  }, [newMessage, username, currentRoom, wsSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  const playSinglePlayer = useCallback(() => navigate(ROUTES.GAME, { state: { mode: "single" as const } }), [navigate]);

  return {
    username, setUsername, rooms, currentRoom, players, messages,
    newMessage, setNewMessage, newRoomName, setNewRoomName, joinRoomId, setJoinRoomId,
    showCreateModal, setShowCreateModal, showJoinModal, setShowJoinModal,
    isHost, gameStarting, messagesEndRef,
    createRoom, joinRoom, joinRoomById, leaveRoom, toggleReady, startGame, sendMessage, handleKeyDown, playSinglePlayer,
  };
}

export default useLobby;
