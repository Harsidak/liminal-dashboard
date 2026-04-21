import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { History, Send, Bot, User, Sparkles } from 'lucide-react';
import api from "@/lib/api";

const Chat = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.getChatHistory();
        setHistory(res.messages || []);
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    };
    loadHistory();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Optimistically add user message to UI
    const tempUserMsg = { id: Date.now(), role: "user", content: userMessage, timestamp: new Date().toISOString() };
    setHistory(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(userMessage);
      const aiMsg = { id: Date.now() + 1, role: "assistant", content: res.reply, timestamp: new Date().toISOString() };
      setHistory(prev => [...prev, aiMsg]);
    } catch (e) {
      const errMsg = { id: Date.now() + 1, role: "assistant", content: "Sorry, I couldn't connect. Please try again.", timestamp: new Date().toISOString() };
      setHistory(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Liminal AI
          </h1>
        </div>
        <div className="text-sm text-slate-400 flex items-center gap-2">
          <History size={16} /> Persistent History Enabled
        </div>
      </div>

      <Card className="flex-1 flex flex-col bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {fetching ? (
            <div className="flex justify-center items-center h-full">
              <Sparkles className="animate-spin text-indigo-400" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <Bot size={48} className="opacity-20" />
              <p>Ask me anything about your portfolio or the markets.</p>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {["Stress test my portfolio", "What's my best performer?", "Market outlook today", "Explain my sector risk"].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-xs p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            history.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-2 rounded-full h-fit ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600/20 border border-indigo-500/30'
                      : 'bg-slate-800/50 border border-slate-700/50'
                  }`}>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[10px] text-slate-500 mt-2 block">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] space-x-3">
                <div className="p-2 rounded-full bg-slate-800 h-fit">
                  <Bot size={16} className="animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your portfolio, markets, stocks..."
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Chat;