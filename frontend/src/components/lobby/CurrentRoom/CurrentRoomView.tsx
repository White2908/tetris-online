import type { ChatMessage, Player, Room } from "../../../types/lobby";
import ChatBox from "../ChatBox";
import PlayerList from "./PlayerList";
import RoomInfo from "./RoomInfo";

interface CurrentRoomViewProps {
  room: Room;
  players: Player[];
  username: string;
  isHost: boolean;
  gameStarting: boolean;
  messages: ChatMessage[];
  newMessage: string;
  onNewMessageChange: (v: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onToggleReady: () => void;
  onStartGame: () => void;
}

export default function CurrentRoomView({
  room,
  players,
  username,
  isHost,
  gameStarting,
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  onKeyDown,
  messagesEndRef,
  onToggleReady,
  onStartGame,
}: CurrentRoomViewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PlayerList
          players={players}
          username={username}
          isHost={isHost}
          gameStarting={gameStarting}
          onToggleReady={onToggleReady}
          onStartGame={onStartGame}
        />

        <div className="mt-6">
          <ChatBox
            title="Room Chat"
            messages={messages}
            newMessage={newMessage}
            onNewMessageChange={onNewMessageChange}
            onSend={onSendMessage}
            onKeyDown={onKeyDown}
            messagesEndRef={messagesEndRef}
            heightClass="h-48"
          />
        </div>
      </div>

      <RoomInfo room={room} />
    </div>
  );
}
