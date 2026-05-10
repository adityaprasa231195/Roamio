import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, FileText } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function NotesPage({ trip }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [stopId, setStopId] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api.get(`/api/trips/${trip.id}/notes`)
      .then(r => setNotes(r.data.notes || []))
      .catch(() => toast.error('Failed to load notes'))
      .finally(() => setLoading(false));
  }, [trip.id]);

  const handleAdd = async () => {
    if (!content.trim()) return;
    try {
      const { data } = await api.post(`/api/trips/${trip.id}/notes`, { content, stopId: stopId || undefined });
      setNotes(prev => [data.note, ...prev]);
      setContent(''); setStopId(''); setExpanded(false);
      toast.success('Note saved');
    } catch { toast.error('Failed to save note'); }
  };

  const handleDelete = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    try { await api.delete(`/api/notes/${id}`); }
    catch { toast.error('Failed to delete note'); }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Add note */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <textarea
          className="input"
          placeholder="Add a note, tip, or reminder..."
          value={content}
          onChange={e => { setContent(e.target.value); setExpanded(e.target.value.length > 0); }}
          style={{ resize: 'vertical', minHeight: 80, transition: 'box-shadow 0.2s' }}
        />
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="input" value={stopId} onChange={e => setStopId(e.target.value)} style={{ flex: 1, minWidth: 180, fontSize: '0.85rem' }}>
                <option value="">General (all stops)</option>
                {trip.stops?.map(s => <option key={s.id} value={s.id}>{s.cityName}</option>)}
              </select>
              <button className="btn-gold" onClick={handleAdd} style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}>
                <Plus size={16} /> Save Note
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notes timeline */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 10 }} />)}
        </div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: 'Outfit' }}>
          <FileText size={32} color="var(--gold-dim)" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1.5rem' }}>No notes yet.</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Add tips, reminders, or observations above.</div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Gold connecting line */}
          <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 1, background: 'linear-gradient(to bottom, var(--gold-bright), var(--gold-dim))', opacity: 0.4 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {notes.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} style={{ display: 'flex', gap: '1rem' }}>
                {/* Timeline dot */}
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gold-dim)', border: '2px solid var(--gold-muted)', flexShrink: 0, marginTop: 4, zIndex: 1 }} />
                <div className="card" style={{ flex: 1, padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      {note.stop?.cityName && (
                        <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px', marginBottom: '0.4rem', display: 'inline-block' }}>{note.stop.cityName}</span>
                      )}
                      <div style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.5, padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
