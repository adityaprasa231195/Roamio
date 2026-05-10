import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Clock, Copy, Check, Euro, JapaneseYen, IndianRupee, PoundSterling, Wallet } from 'lucide-react';
import api from '../api/client';
import { getTripImage } from '../lib/cityImages';
import { formatCurrency } from '../lib/currencies';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const CAT_COLORS = { sightseeing: '#D4AF6A', food: '#C9874A', adventure: '#4CAF7D', culture: '#5A8AC9', shopping: '#A8895A', transport: '#5A5448' };

export default function SharedTripPage() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/api/trips/shared/${token}`)
      .then(r => setTrip(r.data.trip))
      .catch(() => setError('This trip is private or does not exist.'))
      .finally(() => setLoading(false));
  }, [token]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--text-muted)' }}>Loading journey...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Journey not found.</div>
        <div style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{error}</div>
      </div>
    </div>
  );

  const coverImg = getTripImage(trip, 'hero');
  const totalSpent = trip?.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const allActivities = trip?.stops?.flatMap(s => s.activities?.map(a => ({ ...a, city: s.cityName }))) || [];

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Cinematic hero */}
      <div style={{ position: 'relative', height: '70vh', minHeight: 400, overflow: 'hidden' }}>
        <img src={coverImg} alt={trip.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080810 0%, rgba(8,8,16,0.4) 50%, rgba(8,8,16,0.2) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '3rem', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>A Curated Journey</div>
            <h1 style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--text-primary)', textShadow: '0 2px 30px rgba(0,0,0,0.6)', marginBottom: '1rem' }}>{trip.name}</h1>
            {trip.startDate && (
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Stop timeline strip */}
      {trip.stops?.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-gold)', borderBottom: '1px solid var(--border-gold)', padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', maxWidth: 1200, margin: '0 auto', minWidth: 'max-content' }}>
            {trip.stops.map((stop, i) => (
              <React.Fragment key={stop.id}>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} style={{ textAlign: 'center', padding: '0 1rem' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--gold-bright)', margin: '0 auto 0.5rem', boxShadow: '0 0 12px rgba(212,175,106,0.5)' }} />
                  <div style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{stop.cityName}</div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stop.country}</div>
                </motion.div>
                {i < trip.stops.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--gold-bright), var(--gold-dim))', minWidth: 40, opacity: 0.4 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { icon: <MapPin size={18} color="var(--gold-bright)" />, label: 'Destinations', value: trip.stops?.length || 0 },
            { icon: <Clock size={18} color="var(--gold-bright)" />, label: 'Activities', value: allActivities.length },
            { 
              icon: (() => {
                const s = 18; const c = "var(--gold-bright)";
                if (trip.currency === 'EUR') return <Euro size={s} color={c} />;
                if (trip.currency === 'JPY') return <JapaneseYen size={s} color={c} />;
                if (trip.currency === 'INR') return <IndianRupee size={s} color={c} />;
                if (trip.currency === 'GBP') return <PoundSterling size={s} color={c} />;
                return <DollarSign size={s} color={c} />;
              })(), 
              label: 'Trip Budget', 
              value: formatCurrency(trip.totalBudget || 0, trip.currency) 
            },
            { 
              icon: (() => {
                const s = 18; const c = "var(--gold-bright)";
                if (trip.currency === 'EUR') return <Euro size={s} color={c} />;
                if (trip.currency === 'JPY') return <JapaneseYen size={s} color={c} />;
                if (trip.currency === 'INR') return <IndianRupee size={s} color={c} />;
                if (trip.currency === 'GBP') return <PoundSterling size={s} color={c} />;
                return <DollarSign size={s} color={c} />;
              })(), 
              label: 'Total Spent', 
              value: formatCurrency(totalSpent || 0, trip.currency) 
            },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {s.icon}
              <div>
                <div style={{ fontFamily: 'DM Mono', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Per-city sections */}
        {trip.stops?.map((stop, stopIdx) => (
          <motion.div key={stop.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: stopIdx * 0.1 }} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#D4AF6A,#A8895A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: '#080810', fontWeight: 600 }}>{stopIdx + 1}</span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 300 }}>{stop.cityName}</h2>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stop.country}</span>
            </div>
            {stop.activities?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stop.activities.map((act, i) => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-gold)', borderLeft: `3px solid ${CAT_COLORS[act.category] || 'var(--gold-dim)'}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {act.isAiSuggested && <span style={{ color: 'var(--gold-muted)', fontStyle: 'italic', fontSize: '0.78rem', marginRight: '0.4rem' }}>✦</span>}
                        {act.name}
                      </div>
                      {act.description && <div style={{ fontFamily: 'Outfit', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontStyle: 'italic' }}>{act.description}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'DM Mono', fontSize: '0.85rem', color: 'var(--gold-bright)' }}>${act.estimatedCost}</div>
                      <div style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.durationHours}h</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '3rem 0', borderTop: '1px solid var(--border-gold)' }}>
          <h2 style={{ fontStyle: 'italic', fontWeight: 300, marginBottom: '0.5rem' }}>Inspired by this journey?</h2>
          <p style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Plan your own with Roamio — powered by AI.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth" className="btn-gold" style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}>Start Planning ✈</a>
            <button onClick={copyLink} className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.9rem 1.75rem' }}>
              {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
