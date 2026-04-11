import { useState, useRef, useEffect } from 'react';

export default function AIModal({ isOpen, prefill, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your FinSim AI Coach. I can help you understand behavioral biases, explain your portfolio performance, analyze market scenarios, or guide you through risk management concepts. What would you like to explore?", time: 'Just now' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    if (isOpen && prefill) setInput(prefill);
  }, [isOpen, prefill]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { role: 'user', text, time }]);
    historyRef.current.push({ role: 'user', content: text });
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are FinSim AI Coach — a knowledgeable, friendly financial education assistant embedded in the FinSim AI platform, a SEBI-compliant financial simulation and education tool for Indian retail investors. Be concise, practical, and use Indian financial context (₹, SEBI, NIFTY, FII, etc.). Never give direct buy/sell advice. Always frame as educational simulation.`,
          messages: historyRef.current,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || '').join('') || 'Could not process that. Please try again.';
      const replyTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setMessages(m => [...m, { role: 'ai', text: reply, time: replyTime }]);
      historyRef.current.push({ role: 'assistant', content: reply });
    } catch {
      setMessages(m => [...m, { role: 'ai', text: '⚠ Connection issue. Please try again shortly.', time: new Date().toLocaleTimeString() }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ai-modal">
        <div className="ai-modal-header">
          <div className="ai-modal-title"><div className="dot green" />FinSim AI Coach</div>
          <button className="ai-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="ai-modal-messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br>') }} />
              <div className="msg-time">{m.time}</div>
            </div>
          ))}
          {loading && (
            <div className="msg ai">
              <div className="msg-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-modal-input-row">
          <textarea
            className="ai-modal-input"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask me about your portfolio, biases, or market scenarios..."
          />
          <button className="ai-send-btn" onClick={send}>Send ↗</button>
        </div>
      </div>
    </div>
  );
}