import type { ChatMessage } from "../../types/lobby";

interface ChatBoxProps {
  title: string;
  messages: ChatMessage[];
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  heightClass?: string;
}

export default function ChatBox({
  title,
  messages,
  newMessage,
  onNewMessageChange,
  onSend,
  onKeyDown,
  messagesEndRef,
  heightClass = "h-64",
}: ChatBoxProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className={`${heightClass} overflow-y-auto space-y-3 mb-4`}>
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="text-cyan-400 font-medium">{msg.player}:</span>
            <span className="text-slate-300 ml-1">{msg.text}</span>
            <span className="text-xs text-slate-500 ml-2">{msg.timestamp.toLocaleTimeString()}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onNewMessageChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
        <button
          onClick={onSend}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}
