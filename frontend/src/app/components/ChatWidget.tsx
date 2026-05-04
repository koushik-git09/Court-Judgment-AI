import { MessageCircle, Send, X } from "lucide-react";
import { useMemo, useState } from "react";

type ChatMessage = {
  id: string;
  from: "You" | "Assistant";
  text: string;
  createdAt: number;
};

function formatTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "system-1",
      from: "Assistant",
      text: "This chatbot is UI-only (no backend).",
      createdAt: Date.now(),
    },
  ]);

  const canSend = Boolean(text.trim());

  const headerLabel = useMemo(() => {
    return "Chatbot";
  }, []);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: `you-${now}`,
        from: "You",
        text: trimmed,
        createdAt: now,
      },
      {
        id: `assistant-${now}`,
        from: "Assistant",
        text: "Noted. (UI-only chat — responses are simulated.)",
        createdAt: now + 1,
      },
    ]);
    setText("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[360px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[#8B0000] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-900">{headerLabel}</div>
                <div className="text-xs text-gray-500">UI only</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="max-h-[360px] overflow-auto p-4 space-y-3 bg-white">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "You" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm border ${
                      m.from === "You"
                        ? "bg-[#8B0000] text-white border-[#8B0000]"
                        : "bg-gray-50 text-gray-800 border-gray-200"
                    }`}
                  >
                    {m.text}
                  </div>
                  <div
                    className={`mt-1 text-[11px] text-gray-500 ${
                      m.from === "You" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
              />
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="h-10 w-10 rounded-xl bg-[#8B0000] text-white flex items-center justify-center disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-14 w-14 rounded-2xl bg-[#8B0000] text-white shadow-xl flex items-center justify-center hover:bg-[#6B0000] transition-colors"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
