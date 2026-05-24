import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, X, Bot, AlertTriangle } from "lucide-react";
import { SiriMessage } from "../types";

interface SiriWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  accentColorClass: string;
}

export default function SiriWidget({ isOpen, onClose, accentColorClass }: SiriWidgetProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<SiriMessage[]>([
    {
      id: "init",
      role: "assistant",
      text: "Olá! Como posso te ajudar hoje no seu Mac?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput("");
    
    // Add user message to state
    const userMsg: SiriMessage = {
      id: String(Date.now()),
      role: "user",
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map message history to send to Gemini API
      const historyContext = updatedMessages
        .slice(1, -1) // skip the initial greeting and the current user message itself
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch("/api/gemini/siri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgText, history: historyContext }),
      });

      if (!res.ok) {
        throw new Error("Erro no servidor ao contatar a Siri.");
      }

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "Houve um problema de rede ao conectar com meus servidores neurais de IA. Por favor, verifique se a chave do Gemini está inserida nos Ajustes ou tente novamente.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="siri-panel" className="fixed bottom-22 right-6 w-96 max-w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/35 backdrop-blur-[45px] bg-white/55 text-slate-800 z-[9999]">
      {/* Siri Header */}
      <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between bg-white/25">
        <div className="flex items-center gap-2">
          {/* Animated Siri Orb Concept */}
          <div className="relative w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 animate-pulse">
            <div className="absolute inset-0.5 bg-black/20 rounded-full backdrop-blur-xs"></div>
          </div>
          <span className="font-semibold text-sm tracking-wide font-display text-slate-800">Siri</span>
        </div>
        <button
          onClick={onClose}
          id="siri-close-btn"
          className="p-1 rounded-full hover:bg-black/5 transition text-slate-600 hover:text-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-xs ${
                  isAssistant
                    ? "bg-white/45 text-slate-800 border border-white/20 rounded-tl-sm"
                    : `${accentColorClass} text-white rounded-tr-sm`
                }`}
              >
                {/* Message text */}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {/* Time badge */}
                <div className={`text-[9px] text-right mt-1 ${isAssistant ? "text-slate-400" : "text-white/70"}`}>{msg.time}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/45 text-slate-800 rounded-2xl rounded-tl-sm px-3.5 py-4 w-[60%] flex flex-col gap-2.5 shadow-xs border border-white/20">
              <div className="flex space-x-1.5 items-center justify-center h-4 py-1">
                <span className="block w-2.5 h-2.5 bg-indigo-400 rounded-full siri-bar" style={{ animationDelay: "0s" }}></span>
                <span className="block w-2.5 h-2.5 bg-purple-400 rounded-full siri-bar" style={{ animationDelay: "0.2s" }}></span>
                <span className="block w-2.5 h-2.5 bg-pink-400 rounded-full siri-bar" style={{ animationDelay: "0.4s" }}></span>
                <span className="block w-2.5 h-2.5 bg-cyan-400 rounded-full siri-bar" style={{ animationDelay: "0.6s" }}></span>
              </div>
              <div className="text-[10px] text-slate-500 text-center font-display">Siri está processando...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Siri Wave Interactive Overlay */}
      <div className="h-12 bg-white/15 border-t border-white/10 flex items-center justify-center px-4 relative">
        <div className="flex items-center gap-1 w-full max-w-[200px] justify-center opacity-40">
          <div className="w-1 h-3 bg-purple-500 rounded-full siri-bar" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-1 h-6 bg-pink-500 rounded-full siri-bar" style={{ animationDelay: "0.3s" }}></div>
          <div className="w-1 h-8 bg-cyan-400 rounded-full siri-bar" style={{ animationDelay: "0.5s" }}></div>
          <div className="w-1 h-5 bg-indigo-500 rounded-full siri-bar" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-1 h-2 bg-blue-400 rounded-full siri-bar" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/15 bg-white/30 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo para Siri..."
          disabled={loading}
          id="siri-input-field"
          className="flex-1 bg-white/50 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-white/40 focus:bg-white/80 transition shadow-inner"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          id="siri-send-btn"
          className={`p-1.5 rounded-xl transition ${
            input.trim() && !loading
              ? `${accentColorClass} hover:opacity-95 text-white`
              : "bg-black/5 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
