import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Sparkles, MapPin, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import TripCard from '../components/TripCard';
import AIPanel from '../components/AIPanel';
import { getCityImage } from '../lib/cityImages';
import toast from 'react-hot-toast';

const TRENDING_CITIES = [
  { name: 'Kyoto', country: 'Japan', flag: '🇯🇵', cost: '$$', img: 'kyoto,japan' },
  { name: 'Lisbon', country: 'Portugal', flag: '🇵🇹', cost: '$', img: 'lisbon,portugal' },
  { name: 'Bali', country: 'Indonesia', flag: '🇮🇩', cost: '$', img: 'bali' },
  { name: 'Santorini', country: 'Greece', flag: '🇬🇷', cost: '$$$', img: 'santorini,greece' },
  { name: 'Marrakech', country: 'Morocco', flag: '🇲🇦', cost: '$', img: 'marrakech' },
  { name: 'Prague', country: 'Czech Republic', flag: '🇨🇿', cost: '$', img: 'prague' },
  { name: 'Tokyo', country: 'Japan', flag: '🇯🇵', cost: '$$', img: 'tokyo' },
  { name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', cost: '$$$', img: 'amsterdam' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspiring, setInspiring] = useState(false);
  const [inspiration, setInspiration] = useState(null);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    api.get('/api/trips')
      .then(r => setTrips(r.data.trips || []))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Traveler';
  const upcoming = trips.filter(t => t.startDate && new Date(t.startDate) > new Date());
  const ongoing  = trips.filter(t => t.startDate && t.endDate && new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date());

  const handleInspireMe = async () => {
    setInspiring(true);
    setInspiration(null);
    try {
      const res = await fetch('/api/ai/inspire-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ interests: ['culture', 'food', 'architecture'] }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const d = JSON.parse(line.slice(6));
          if (d.type === 'delta') buffer += d.text;
          if (d.type === 'done') {
            try { setInspiration(JSON.parse(buffer)); } catch { setInspiration({ city: 'Lisbon', country: 'Portugal', tagline: buffer }); }
          }
        }
      }
    } catch { toast.error('AI inspiration failed'); }
    setInspiring(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Hero */}
      <div className="hero-gradient" style={{ padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--gold-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h1 style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {getGreeting()}, {firstName}.
            </h1>
            {ongoing.length > 0 && (
              <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
                ✈ Currently in {ongoing[0].stops?.[0]?.cityName || 'Transit'}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/trips/new" className="btn-gold">
                <Plus size={18} /> Plan New Trip
              </Link>
              <button className="btn-ghost" onClick={handleInspireMe} disabled={inspiring}>
                <Sparkles size={18} color="var(--gold-bright)" />
                {inspiring ? 'Thinking...' : 'Inspire Me'}
              </button>
            </div>
          </motion.div>

          {/* Inspiration card */}
          {inspiration && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginTop: '2rem', padding: '1.5rem', maxWidth: '500px', borderColor: 'var(--gold-dim)' }}>
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--gold-muted)', marginBottom: '0.5rem' }}>✦ AI Inspiration</div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', color: 'var(--gold-bright)', marginBottom: '0.25rem' }}>{inspiration.city}</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>{inspiration.tagline}</div>
              {inspiration.days?.map(d => (
                <div key={d.day} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--gold-muted)', marginBottom: '0.25rem' }}>Day {d.day} — {d.theme}</div>
                  {d.highlights?.map(h => <div key={h} style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.75rem' }}>· {h}</div>)}
                </div>
              ))}
              <button className="btn-gold" onClick={() => navigate('/trips/new')} style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>
                Plan This Trip →
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { icon: <MapPin size={20} color="var(--gold-bright)" />, label: 'Total Trips', value: trips.length },
            { icon: <Clock size={20} color="var(--gold-bright)" />, label: 'Upcoming', value: upcoming.length },
            { icon: <TrendingUp size={20} color="var(--gold-bright)" />, label: 'Cities Planned', value: trips.reduce((s, t) => s + (t.stops?.length || 0), 0) },
          ].map(stat => (
            <div key={stat.label} className="card hover-glow" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'DM Mono', fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent trips */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.8rem' }}>Your Journeys</h2>
            <Link to="/trips" className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>View All →</Link>
          </div>
          {loading ? (
            <div className="scroll-x" style={{ paddingBottom: '1rem' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ width: 280, height: 340, flexShrink: 0, borderRadius: 12 }} />)}
            </div>
          ) : trips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Your first journey awaits.</div>
              <Link to="/trips/new" className="btn-gold">Start Planning →</Link>
            </div>
          ) : (
            <div className="scroll-x" style={{ paddingBottom: '1rem' }}>
              {trips.slice(0, 6).map((trip, i) => (
                <motion.div key={trip.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} style={{ flexShrink: 0 }}>
                  <TripCard trip={trip} />
                </motion.div>
              ))}
              <div style={{ flexShrink: 0, width: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Link to="/trips/new" className="btn-ghost" style={{ flexDirection: 'column', gap: '0.5rem', height: '100%', width: '100%', borderRadius: 12, minHeight: 200 }}>
                  <Plus size={24} color="var(--gold-bright)" />
                  <span>New Trip</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Trending cities */}
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Trending Destinations</h2>
          <div className="scroll-x" style={{ paddingBottom: '1rem' }}>
            {TRENDING_CITIES.map((city, i) => (
              <motion.div key={city.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="hover-glow" style={{
                flexShrink: 0, width: 160, cursor: 'pointer', borderRadius: 10,
                overflow: 'hidden', border: '1px solid var(--border-gold)', background: 'var(--bg-surface)',
              }}>
                <div style={{ height: 100, backgroundImage: `url(${getCityImage(city.name)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,16,0.9) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{city.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{city.flag} {city.country}</span>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{city.cost}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AIPanel />
    </div>
  );
}
