import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Globe } from 'lucide-react';
import api from '../api/client';
import { getTripImage } from '../lib/cityImages';
import toast from 'react-hot-toast';

export default function ShareModal({ trip, onClose }) {
  const [copied, setCopied] = useState(false);
  const [making, setMaking] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    trip.isPublic && trip.shareToken ? `${window.location.origin}/shared/${trip.shareToken}` : null
  );

  const makePublic = async () => {
    setMaking(true);
    try {
      const { data } = await api.put(`/api/trips/${trip.id}`, { isPublic: true });
      const url = `${window.location.origin}/shared/${data.trip.shareToken}`;
      setShareUrl(url);
      toast.success('Trip is now public!');
    } catch { toast.error('Failed to make trip public'); }
    setMaking(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,16,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      >
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="card" style={{ width: '100%', maxWidth: 480, padding: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={18} color="var(--gold-bright)" />
              <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.4rem' }}>Share Trip</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
          </div>

          {/* Trip preview card */}
          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem', position: 'relative', height: 140 }}>
            <img src={getTripImage(trip)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,16,0.9) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.3rem', color: 'var(--text-primary)' }}>{trip.name}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                {trip.stops?.slice(0, 4).map(s => (
                  <span key={s.id} style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.cityName}</span>
                ))}
              </div>
            </div>
          </div>

          {shareUrl ? (
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Share this link:</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input readOnly value={shareUrl} className="input" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} onClick={e => e.target.select()} />
                <button onClick={copy} className="btn-gold" style={{ flexShrink: 0, padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <a href={shareUrl} target="_blank" rel="noreferrer" className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <Globe size={16} /> Open Public View
              </a>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {[
                  { icon: 'X', url: `https://twitter.com/intent/tweet?text=Check out my trip: ${encodeURIComponent(trip.name)}&url=${encodeURIComponent(shareUrl)}` },
                  { icon: 'W', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(trip.name + ' - ' + shareUrl)}` },
                ].map(s => (
                  <a key={s.icon} href={s.url} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>{s.icon}</a>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                This trip is currently private. Make it public to get a shareable link.
              </p>
              <button onClick={makePublic} disabled={making} className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <Globe size={16} /> {making ? 'Publishing...' : 'Make Public & Get Link'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
