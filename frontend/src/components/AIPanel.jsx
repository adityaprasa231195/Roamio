import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AIPanel({ trip }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hello! I\'m your AI travel co-pilot. Ask me anything — activity ideas, budget tips, or destination inspiration.' }]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setStreaming(true);

    // Determine which AI endpoint to use
    let endpoint = '/api/ai/inspire-me';
    let body = { interests: [userMsg] };

    if (userMsg.toLowerCase().includes('budget') || userMsg.toLowerCase().includes('money') || userMsg.toLowerCase().includes('cost')) {
      endpoint = '/api/ai/budget-advice';
      body = { tripId: trip?.id };
    } else if (trip && (userMsg.toLowerCase().includes('activit') || userMsg.toLowerCase().includes('do') || userMsg.toLowerCase().includes('see'))) {
      endpoint = '/api/ai/suggest-activities';
      const city = trip?.stops?.[0]?.cityName || 'Paris';
      body = { city, budget: 150, interests: [userMsg], days: 3 };
    }

    let aiText = '';
    setMessages(prev => [...prev, { role: 'assistant', text: '', streaming: true }]);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify(body),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          const d = JSON.parse(line.slice(6));
          if (d.type === 'delta') {
            aiText += d.text;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', text: aiText, streaming: true };
              return updated;
            });
          }
          if (d.type === 'done') {
            // Try to prettify JSON responses
            let displayText = aiText;
            try {
              const parsed = JSON.parse(aiText);
              if (parsed.city) displayText = `✦ ${parsed.city}, ${parsed.country}\n\n${parsed.tagline}\n\n${parsed.why}`;
              else if (parsed.verdict) displayText = `${parsed.verdict}\n\n${parsed.warnings?.map(w => '⚠ ' + w).join('\n') || ''}\n${parsed.tips?.map(t => '💡 ' + t).join('\n') || ''}`;
              else if (Array.isArray(parsed)) displayText = parsed.map(a => `• ${a.name} ($${a.estimatedCost}) — ${a.description}`).join('\n\n');
            } catch { /* use raw text */ }
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', text: displayText, streaming: false };
              return updated;
            });
          }
        }
      }
    } catch {
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', text: 'Sorry, I had trouble connecting. Please try again.' }; return u; });
    }
    setStreaming(false);
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF6A, #A8895A)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(212,175,106,0.4), 0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <Sparkles size={22} color="#080810" />
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,8,16,0.5)' }} />
            <motion.div
              initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, zIndex: 1001,
                background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-gold)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--gold-bright)" />
                  <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', color: 'var(--text-primary)' }}>AI Co-Pilot</span>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #D4AF6A, #A8895A)' : 'var(--bg-elevated)',
                      border: msg.role === 'assistant' ? '1px solid var(--border-gold)' : 'none',
                      borderLeft: msg.role === 'assistant' ? '2px solid var(--gold-bright)' : 'none',
                    }}>
                      {msg.streaming && !msg.text && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                        </div>
                      )}
                      <p style={{
                        fontFamily: 'Outfit', fontSize: '0.85rem', lineHeight: 1.6, margin: 0,
                        color: msg.role === 'user' ? '#080810' : 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                      }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-gold)', display: 'flex', gap: '0.5rem' }}>
                <input
                  className="input" placeholder="Ask about activities, budget, destinations..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  style={{ fontSize: '0.85rem' }}
                />
                <button onClick={send} disabled={streaming || !input.trim()} style={{
                  width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #D4AF6A, #A8895A)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  opacity: streaming || !input.trim() ? 0.5 : 1,
                }}>
                  <Send size={16} color="#080810" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
