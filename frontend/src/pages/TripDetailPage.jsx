import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Edit2, Share2, Globe, Euro, JapaneseYen, IndianRupee, PoundSterling, Wallet } from 'lucide-react';
import api from '../api/client';
import { getTripImage } from '../lib/cityImages';
import { formatCurrency } from '../lib/currencies';
import AIPanel from '../components/AIPanel';
import ShareModal from '../components/ShareModal';
import toast from 'react-hot-toast';

// Lazy-load heavy tab content
import ItineraryBuilder from './ItineraryBuilder';
import BudgetPage from './BudgetPage';
import PackingPage from './PackingPage';
import NotesPage from './NotesPage';

const TABS = ['Overview', 'Itinerary', 'Budget', 'Packing', 'Notes'];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    api.get(`/api/trips/${id}`)
      .then(r => setTrip(r.data.trip))
      .catch(() => { toast.error('Trip not found'); navigate('/trips'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="typing-dot" style={{ animationDelay: '0s' }} />
      <div className="typing-dot" style={{ animationDelay: '0.2s', marginLeft: 6 }} />
      <div className="typing-dot" style={{ animationDelay: '0.4s', marginLeft: 6 }} />
    </div>
  );

  const coverImg = getTripImage(trip, 'hero');
  const totalDays = trip?.startDate && trip?.endDate
    ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Hero banner */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img src={coverImg} alt={trip.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080810 0%, rgba(8,8,16,0.5) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontWeight: 300, color: 'var(--text-primary)', marginBottom: '0.5rem', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                  {trip.name}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {trip.startDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={13} color="var(--gold-muted)" />
                      {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                      {totalDays && <span style={{ color: 'var(--text-muted)' }}>({totalDays} days)</span>}
                    </span>
                  )}
                  {trip.stops?.length > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Outfit', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={13} color="var(--gold-muted)" />
                      {trip.stops.map(s => s.cityName).join(' · ')}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {trip.isPublic && trip.shareToken && (
                  <a href={`/shared/${trip.shareToken}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                    <Globe size={15} /> Public View
                  </a>
                )}
                <button onClick={() => setShareOpen(true)} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid var(--border-gold)', background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="tab-bar" style={{ borderBottom: 'none' }}>
            {TABS.map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {tab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { 
                label: 'Total Budget', 
                value: formatCurrency(trip.totalBudget || 0, trip.currency), 
                icon: (() => {
                  const s = 20; const c = "var(--gold-bright)";
                  if (trip.currency === 'EUR') return <Euro size={s} color={c} />;
                  if (trip.currency === 'JPY') return <JapaneseYen size={s} color={c} />;
                  if (trip.currency === 'INR') return <IndianRupee size={s} color={c} />;
                  if (trip.currency === 'GBP') return <PoundSterling size={s} color={c} />;
                  if (trip.currency === 'USD') return <DollarSign size={s} color={c} />;
                  // For other currencies (PKR, AED, THB, etc.), show the Wallet icon with currency code
                  return <Wallet size={s} color={c} />;
                })(), 
                sub: 'planned' 
              },
              { label: 'Destinations', value: trip.stops?.length || 0, icon: <MapPin size={20} color="var(--gold-bright)" />, sub: 'cities' },
              { label: 'Activities', value: trip.stops?.flatMap(s => s.activities)?.length || 0, icon: <Calendar size={20} color="var(--gold-bright)" />, sub: 'planned' },
              { label: 'Duration', value: totalDays ? `${totalDays} days` : '—', icon: <Calendar size={20} color="var(--gold-bright)" />, sub: 'trip length' },
            ].map(s => (
              <div key={s.label} className="card hover-glow" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
            {trip.description && (
              <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--gold-muted)', marginBottom: '0.5rem' }}>About this trip</div>
                <p style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{trip.description}</p>
              </div>
            )}
            <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--gold-muted)', marginBottom: '1rem' }}>Quick Actions</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => setTab('Itinerary')} className="btn-gold" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>Open Builder →</button>
                <button onClick={() => setTab('Budget')} className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>View Budget</button>
                <button onClick={() => setTab('Packing')} className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>Packing List</button>
              </div>
            </div>
          </div>
        )}
        {tab === 'Itinerary' && <ItineraryBuilder trip={trip} onUpdate={setTrip} />}
        {tab === 'Budget' && <BudgetPage trip={trip} />}
        {tab === 'Packing' && <PackingPage trip={trip} />}
        {tab === 'Notes' && <NotesPage trip={trip} />}
      </div>

      {shareOpen && <ShareModal trip={trip} onClose={() => setShareOpen(false)} />}
      <AIPanel trip={trip} />
    </div>
  );
}
