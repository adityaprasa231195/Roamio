import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';
import { getTripImage } from '../lib/cityImages';
import { formatCurrency } from '../lib/currencies';
import toast from 'react-hot-toast';

function getStatus(trip) {
  const now = new Date();
  if (!trip.startDate) return 'draft';
  const start = new Date(trip.startDate);
  const end = trip.endDate ? new Date(trip.endDate) : null;
  if (start > now) return 'upcoming';
  if (end && end >= now) return 'ongoing';
  return 'past';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();
  const status = getStatus(trip);
  const coverImg = getTripImage(trip);

  const handleDelete = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm(`Delete "${trip.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/trips/${trip.id}`);
      toast.success('Trip deleted');
      onDelete?.(trip.id);
    } catch { toast.error('Failed to delete trip'); }
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 0 40px rgba(212,175,106,0.14), 0 12px 40px rgba(0,0,0,0.5)' }}
      transition={{ duration: 0.25 }}
      onClick={() => navigate(`/trips/${trip.id}`)}
      style={{ width: 280, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-gold)', background: 'var(--bg-surface)', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
    >
      {/* Cover image */}
      <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
        <img src={coverImg} alt={trip.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080810 0%, transparent 55%)' }} />
        {/* Status badge */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className={`badge ${status === 'upcoming' ? 'badge-gold' : status === 'ongoing' ? 'badge-success' : 'badge-muted'}`}>
            {status === 'upcoming' ? '✈ Upcoming' : status === 'ongoing' ? '● Ongoing' : status === 'past' ? 'Completed' : 'Draft'}
          </span>
        </div>
        {/* Delete */}
        {onDelete !== undefined && (
          <button onClick={handleDelete} style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 8, background: 'rgba(8,8,16,0.7)', border: '1px solid var(--border-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={13} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem 1.1rem 1.25rem' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.3rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.2 }}>{trip.name}</h3>
        {trip.stops?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: '0.5rem' }}>
            <MapPin size={12} color="var(--gold-muted)" />
            <span style={{ fontFamily: 'Outfit', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {trip.stops.map(s => s.cityName).join(' · ')}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={12} color="var(--text-muted)" />
          <span style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {formatDate(trip.startDate)} {trip.endDate ? `→ ${formatDate(trip.endDate)}` : ''}
          </span>
        </div>
        {trip.totalBudget > 0 && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget</span>
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.85rem', color: 'var(--gold-bright)' }}>{formatCurrency(trip.totalBudget, trip.currency)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
