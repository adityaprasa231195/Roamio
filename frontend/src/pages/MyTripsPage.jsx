import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import api from '../api/client';
import TripCard from '../components/TripCard';
import AIPanel from '../components/AIPanel';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: 'all', label: 'All Trips' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'past', label: 'Past' },
];

function getStatus(trip) {
  const now = new Date();
  if (!trip.startDate) return 'draft';
  const start = new Date(trip.startDate);
  const end = trip.endDate ? new Date(trip.endDate) : null;
  if (start > now) return 'upcoming';
  if (end && end >= now) return 'ongoing';
  return 'past';
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/trips')
      .then(r => setTrips(r.data.trips || []))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setTrips(prev => prev.filter(t => t.id !== id));

  const filtered = trips.filter(t => {
    const matchFilter = filter === 'all' || getStatus(t) === filter;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.stops?.some(s => s.cityName.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.25rem' }}>My Journeys</h1>
          <p style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
        </div>
        <Link to="/trips/new" className="btn-gold"><Plus size={18} /> New Trip</Link>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search trips or cities..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '0.5rem 1rem', borderRadius: 99, border: '1px solid', cursor: 'pointer',
              fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s',
              borderColor: filter === f.key ? 'var(--gold-bright)' : 'var(--gold-dim)',
              background: filter === f.key ? 'var(--gold-glow)' : 'transparent',
              color: filter === f.key ? 'var(--gold-bright)' : 'var(--text-muted)',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Trip grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {trips.length === 0 ? 'Your first journey awaits.' : 'No trips match your filter.'}
          </div>
          {trips.length === 0 && <Link to="/trips/new" className="btn-gold">Start Planning →</Link>}
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <TripCard trip={trip} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}
      <AIPanel />
    </div>
  );
}
