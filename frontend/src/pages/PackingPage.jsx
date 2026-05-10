import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2 } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const CATEGORIES = ['clothing', 'documents', 'electronics', 'essentials', 'other'];
const CATEGORY_ICONS = { clothing: '👔', documents: '📄', electronics: '💻', essentials: '🎒', other: '📦' };

function PackingRing({ percent }) {
  const r = 54, c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return (
    <div style={{ position: 'relative', width: 130, height: 130 }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none" stroke="var(--gold-bright)" strokeWidth={10}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'DM Mono', fontSize: '1.4rem', color: 'var(--text-primary)' }}>{percent}%</span>
        <span style={{ fontFamily: 'Outfit', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>packed</span>
      </div>
    </div>
  );
}

export default function PackingPage({ trip }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});
  const [newItem, setNewItem] = useState({ name: '', category: 'essentials' });
  const [adding, setAdding] = useState(false);
  const prevPercent = useRef(0);

  useEffect(() => {
    api.get(`/api/trips/${trip.id}/packing`)
      .then(r => setItems(r.data.items || []))
      .catch(() => toast.error('Failed to load packing list'))
      .finally(() => setLoading(false));
  }, [trip.id]);

  const total = items.length;
  const packed = items.filter(i => i.isPacked).length;
  const percent = total > 0 ? Math.round((packed / total) * 100) : 0;

  // Confetti on 100%
  useEffect(() => {
    if (percent === 100 && prevPercent.current < 100 && total > 0) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 }, colors: ['#D4AF6A', '#A8895A', '#F2EDE4'] });
      toast.success("You're ready to fly! ✈", { duration: 4000, style: { background: 'var(--bg-elevated)', color: 'var(--gold-bright)', border: '1px solid var(--gold-dim)' } });
    }
    prevPercent.current = percent;
  }, [percent]);

  const handleToggle = async (item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPacked: !i.isPacked } : i));
    try { await api.patch(`/api/packing/${item.id}/toggle`); }
    catch { setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPacked: item.isPacked } : i)); }
  };

  const handleAdd = async () => {
    if (!newItem.name) return;
    try {
      const { data } = await api.post(`/api/trips/${trip.id}/packing`, newItem);
      setItems(prev => [...prev, data.item]);
      setNewItem({ name: '', category: 'essentials' });
      setAdding(false);
    } catch { toast.error('Failed to add item'); }
  };

  const handleDelete = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try { await api.delete(`/api/packing/${id}`); }
    catch { toast.error('Failed to delete item'); }
  };

  const grouped = CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: items.filter(i => i.category === c) }), {});

  if (loading) return <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />;

  return (
    <div>
      {/* Progress header */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <PackingRing percent={percent} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Packing List</h2>
          <p style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            {packed} of {total} items packed
          </p>
          <button onClick={() => setAdding(!adding)} className="btn-gold" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Add item form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input className="input" placeholder="Item name (e.g. Passport)" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} style={{ flex: 2, minWidth: 180, fontSize: '0.88rem' }} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <select className="input" value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} style={{ flex: 1, minWidth: 140, fontSize: '0.88rem' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <button className="btn-gold" onClick={handleAdd} style={{ fontSize: '0.88rem', padding: '0.65rem 1.2rem' }}>Add</button>
              <button className="btn-ghost" onClick={() => setAdding(false)} style={{ fontSize: '0.88rem', padding: '0.65rem 1rem' }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      {CATEGORIES.map(cat => {
        const catItems = grouped[cat];
        if (catItems.length === 0) return null;
        const catPacked = catItems.filter(i => i.isPacked).length;
        return (
          <div key={cat} className="card" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
            <button
              onClick={() => setOpen(p => ({ ...p, [cat]: !p[cat] }))}
              style={{ width: '100%', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{CATEGORY_ICONS[cat]}</span>
                <span style={{ fontFamily: 'Outfit', fontWeight: 500, color: 'var(--text-primary)' }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{catPacked}/{catItems.length}</span>
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{open[cat] ? '▲' : '▼'}</span>
            </button>
            {open[cat] !== false && (
              <div style={{ borderTop: '1px solid var(--border-gold)' }}>
                {catItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(212,175,106,0.05)' }}>
                    <button onClick={() => handleToggle(item)} style={{
                      width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${item.isPacked ? 'var(--gold-bright)' : 'var(--gold-dim)'}`,
                      background: item.isPacked ? 'var(--gold-bright)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
                    }}>
                      {item.isPacked && <Check size={13} color="#080810" strokeWidth={3} />}
                    </button>
                    <span style={{
                      fontFamily: 'Outfit', fontSize: '0.9rem', flex: 1,
                      color: item.isPacked ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: item.isPacked ? 'line-through' : 'none',
                      textDecorationColor: 'var(--gold-dim)',
                      transition: 'all 0.3s',
                    }}>{item.name}</span>
                    <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, opacity: 0.5 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: 'Outfit' }}>
          <div style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1.5rem', marginBottom: '1rem' }}>Nothing packed yet.</div>
          <button onClick={() => setAdding(true)} className="btn-gold">Add Your First Item</button>
        </div>
      )}
    </div>
  );
}
