import LobbyHeader from "../components/lobby/LobbyHeader";
import RoomList from "../components/lobby/RoomList";
import ChatBox from "../components/lobby/ChatBox";
import CurrentRoomView from "../components/lobby/CurrentRoom/CurrentRoomView";
import SinglePlayerCard from "../components/lobby/SinglePlayerCard";
import { useLobby } from "../hooks/useLobby";

export default function LobbyPage() {
  const {
    username,
    setUsername,
    rooms,
    currentRoom,
    players,
    messages,
    newMessage,
    setNewMessage,
    newRoomName,
    setNewRoomName,
    joinRoomId,
    setJoinRoomId,
    showCreateModal,
    setShowCreateModal,
    showJoinModal,
    setShowJoinModal,
    isHost,
    gameStarting,
    messagesEndRef,
    createRoom,
    joinRoom,
    joinRoomById,
    leaveRoom,
    toggleReady,
    startGame,
    sendMessage,
    handleKeyDown,
    playSinglePlayer,
  } = useLobby();

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-[#050b1b] text-white">
        <LobbyHeader variant="lobby" username={username} onUsernameChange={setUsername} />

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Game Lobby</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
                >
                  Join by ID
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Create Room
                </button>
              </div>
            </div>

            <SinglePlayerCard onPlay={playSinglePlayer} />

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <RoomList rooms={rooms} onJoinRoom={joinRoom} />
              </div>

              <ChatBox
                title="Global Chat"
                messages={messages}
                newMessage={newMessage}
                onNewMessageChange={setNewMessage}
                onSend={sendMessage}
                onKeyDown={handleKeyDown}
                messagesEndRef={messagesEndRef}
                heightClass="h-64"
              />
            </div>
          </div>
        </main>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-xl bg-slate-900 border border-slate-700 p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Room</h2>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-cyan-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-xl bg-slate-900 border border-slate-700 p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Join Room by ID</h2>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-cyan-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={joinRoomById}
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b1b] text-white">
      <LobbyHeader
        variant="room"
        username={username}
        onUsernameChange={setUsername}
        roomName={currentRoom.name}
        playerCount={`${currentRoom.players.length}/${currentRoom.maxPlayers}`}
        onLeave={leaveRoom}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <CurrentRoomView
          room={currentRoom}
          players={players}
          username={username}
          isHost={isHost}
          gameStarting={gameStarting}
          messages={messages}
          newMessage={newMessage}
          onNewMessageChange={setNewMessage}
          onSendMessage={sendMessage}
          onKeyDown={handleKeyDown}
          messagesEndRef={messagesEndRef}
          onToggleReady={toggleReady}
          onStartGame={startGame}
        />
      </main>

      {gameStarting && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xl font-semibold">Starting game...</p>
          </div>
        </div>
      )}
    </div>
  );
}
