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
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center shadow-inner">
            <Bot className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
              Liminal Intelligence
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Advanced Portfolio Reasoning Core</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-rose-50 shadow-sm">
          <History size={12} className="text-rose-400" /> Persistent Memory Active
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-3xl border border-rose-100/50 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-rose-500/5">
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {fetching ? (
            <div className="flex justify-center items-center h-full">
              <Sparkles className="animate-spin text-rose-400" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6">
              <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center mb-2">
                <Bot size={40} className="text-rose-200" />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-700 tracking-tight">How can I help you today?</p>
                <p className="text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60">Analyze your wealth with precision</p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {["Stress test my portfolio", "What's my best performer?", "Market outlook today", "Explain my sector risk"].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-[10px] font-black uppercase tracking-widest p-4 bg-white/50 border border-rose-50 rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition-all text-slate-500 hover:text-rose-600 shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            history.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-5 duration-500`}>
                <div className={`flex max-w-[85%] space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-1 font-bold ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-rose-50 text-rose-500 shadow-inner'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`p-5 rounded-3xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'bg-white border border-rose-100 text-slate-700'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-3 block ${msg.role === 'user' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex max-w-[80%] space-x-4">
                <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center shadow-inner">
                  <Bot size={18} className="text-rose-400 animate-pulse" />
                </div>
                <div className="p-5 rounded-3xl bg-rose-50/50 border border-rose-100/50 flex items-center">
                  <span className="flex space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-rose-100 bg-white/50">
          <div className="flex space-x-3 bg-white border border-rose-100 rounded-2xl p-2 shadow-xl shadow-rose-500/5 focus-within:border-rose-300 transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your portfolio, markets, stocks..."
              className="flex-1 bg-transparent border-0 text-slate-800 placeholder:text-slate-400 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest rounded-xl px-4 focus:outline-none font-medium"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-xl transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:shadow-none"
            >
              <Send size={18} className="stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;