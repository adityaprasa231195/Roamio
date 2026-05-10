import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Sparkles, MapPin, Calendar, DollarSign } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { getCityImage } from '../lib/cityImages';
import { CURRENCIES, getCurrencyForCity, getCurrencySymbol, convertCurrency } from '../lib/currencies';
import toast from 'react-hot-toast';

const STEPS = ['Details', 'Destination', 'AI Suggestions'];

const POPULAR_DESTINATIONS = [
  { name: 'Paris', country: 'France', img: 'paris', cost: 180 },
  { name: 'Tokyo', country: 'Japan', img: 'tokyo', cost: 150 },
  { name: 'Bali', country: 'Indonesia', img: 'bali', cost: 80 },
  { name: 'Barcelona', country: 'Spain', img: 'barcelona', cost: 130 },
  { name: 'New York', country: 'USA', img: 'new-york', cost: 250 },
  { name: 'Kyoto', country: 'Japan', img: 'kyoto', cost: 120 },
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', startDate: '', endDate: '', totalBudget: '', coverCity: '', description: '', currency: 'USD',
  });

  const update = (k, v) => {
    // If currency is changed manually, convert the budget
    if (k === 'currency' && v !== form.currency) {
      const converted = convertCurrency(form.totalBudget, form.currency, v);
      setForm(p => ({ ...p, [k]: v, totalBudget: converted }));
      return;
    }

    setForm(p => ({ ...p, [k]: v }));

    // Auto-suggest and CONVERT currency when city changes
    if (k === 'coverCity' && v) {
      const suggested = getCurrencyForCity(v);
      if (suggested !== form.currency) {
        const converted = convertCurrency(form.totalBudget, form.currency, suggested);
        setForm(p => ({ ...p, [k]: v, currency: suggested, totalBudget: converted }));
        toast.success(`Budget converted to ${suggested}`, { icon: '💰' });
      }
    }
  };

  const fetchAiSuggestions = async () => {
    if (!form.coverCity) return;
    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const res = await fetch('/api/ai/suggest-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ city: form.coverCity, budget: parseInt(form.totalBudget) || 100, days: 3 }),
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
          try {
            const d = JSON.parse(line.slice(6));
            if (d.type === 'delta') buffer += d.text;
            if (d.type === 'done') {
              try {
                // Robust extraction: find the first '[' and last ']'
                const startIdx = buffer.indexOf('[');
                const endIdx = buffer.lastIndexOf(']');
                if (startIdx !== -1 && endIdx !== -1) {
                  const jsonStr = buffer.slice(startIdx, endIdx + 1);
                  const parsed = JSON.parse(jsonStr);
                  if (Array.isArray(parsed)) setAiSuggestions(parsed);
                } else {
                  // Fallback for objects or direct parse
                  const parsed = JSON.parse(buffer);
                  if (Array.isArray(parsed)) setAiSuggestions(parsed);
                }
              } catch (e) {
                console.error("Failed to parse AI buffer:", buffer);
              }
            }
          } catch (e) { /* partial line or parse error */ }
        }
      }
    } catch { toast.error('AI suggestions failed'); }
    setAiLoading(false);
  };

  const handleNext = async () => {
    if (step === 1 && form.coverCity) fetchAiSuggestions();
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    // Final submit — create trip, then auto-generate itinerary
    setGenerating(true);
    setGenStep(0);
    try {
      // Step 1: Create the trip
      setGenStep(1);
      const { data } = await api.post('/api/trips', {
        name: form.name || 'My Trip',
        description: form.description,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        totalBudget: parseFloat(form.totalBudget) || 0,
        currency: form.currency || 'USD',
        coverImage: form.coverCity ? getCityImage(form.coverCity, 'hero') : null,
      });

      // Step 2: Auto-generate itinerary with AI
      setGenStep(2);
      await new Promise(r => setTimeout(r, 600)); // brief pause for animation
      await api.post(`/api/trips/${data.trip.id}/auto-generate`, {
        city: form.coverCity || form.name,
        contextSuggestions: aiSuggestions,
      });

      // Step 3: Done!
      setGenStep(3);
      await new Promise(r => setTimeout(r, 500));
      toast.success('Trip & itinerary created! ✈');
      navigate(`/trips/${data.trip.id}`);
    } catch (err) {
      console.error('Trip creation error:', err);
      const msg = err.response?.data?.error || 'Failed to create trip. Please try again.';
      toast.error(msg);
      setGenerating(false);
    }
  };
  const GEN_STEPS = ['Creating your journey...', '✦ AI is building your itinerary...', 'Adding activities & packing list...', 'Your trip is ready!'];

  if (generating) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-base)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: 450 }}>
          {/* Animated sparkle ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            style={{ width: 80, height: 80, margin: '0 auto 2rem', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--gold-bright)', borderRightColor: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Sparkles size={28} color="var(--gold-bright)" />
          </motion.div>

          <h2 style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {form.coverCity || form.name}
          </h2>
          <p style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            Crafting your perfect itinerary...
          </p>

          {/* Progress steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {GEN_STEPS.map((label, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: genStep >= i ? 1 : 0.3, x: genStep >= i ? 0 : -20 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: genStep > i ? 'var(--gold-bright)' : genStep === i ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                  border: '2px solid var(--border-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                }}>
                  {genStep > i && <Check size={12} color="#080810" />}
                  {genStep === i && (
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-bright)' }} />
                  )}
                </div>
                <span style={{
                  fontFamily: 'Outfit', fontSize: '0.88rem',
                  color: genStep >= i ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: genStep === i ? 500 : 400,
                }}>{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-base)' }}>
      {/* Step indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${i < step ? 'var(--gold-bright)' : i === step ? 'var(--gold-bright)' : 'var(--gold-dim)'}`,
                background: i < step ? 'var(--gold-bright)' : i === step ? 'var(--gold-glow)' : 'transparent',
                transition: 'all 0.3s',
              }}>
                {i < step ? <Check size={16} color="#080810" /> : <span style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: i === step ? 'var(--gold-bright)' : 'var(--text-muted)' }}>{i + 1}</span>}
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: i === step ? 'var(--gold-bright)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 60, height: 1, background: i < step ? 'var(--gold-muted)' : 'var(--gold-dim)', marginBottom: '1.2rem', transition: 'background 0.3s' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="card" style={{ width: '100%', maxWidth: 560, padding: '2.5rem' }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

            {/* Step 0 — Details */}
            {step === 0 && (
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>Name Your Journey</h2>
                <p style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>Give your trip a name and set the dates.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Trip Name</label>
                    <input className="input" placeholder="e.g. Europe Summer 2025" value={form.name} onChange={e => update('name', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Start Date</label>
                      <input className="input" type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>End Date</label>
                      <input className="input" type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Budget</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontFamily: 'DM Mono', fontSize: '0.85rem' }}>{getCurrencySymbol(form.currency)}</span>
                        <input className="input" type="number" placeholder="2000" value={form.totalBudget} onChange={e => update('totalBudget', e.target.value)} style={{ paddingLeft: '2.75rem' }} />
                      </div>
                      <select
                        className="input"
                        value={form.currency}
                        onChange={e => update('currency', e.target.value)}
                        style={{ fontFamily: 'DM Mono', fontSize: '0.82rem', padding: '0.6rem 0.75rem', minWidth: 120, cursor: 'pointer', appearance: 'auto' }}
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.symbol}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — Cover city */}
            {step === 1 && (
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>Pick a Destination</h2>
                <p style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>Choose your first or main destination to set the cover photo.</p>
                <input className="input" placeholder="Enter destination" value={form.coverCity} onChange={e => update('coverCity', e.target.value)} style={{ marginBottom: '1.5rem' }} />
                {form.coverCity && (
                  <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem', height: 160, position: 'relative' }}>
                    <img src={getCityImage(form.coverCity)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,16,0.8) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'Cormorant Garamond', fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 400 }}>{form.coverCity}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Popular destinations</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {POPULAR_DESTINATIONS.map(d => (
                      <button key={d.name} onClick={() => update('coverCity', d.name)} style={{
                        padding: '0.6rem', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                        border: `1px solid ${form.coverCity === d.name ? 'var(--gold-bright)' : 'var(--border-gold)'}`,
                        background: form.coverCity === d.name ? 'var(--gold-glow)' : 'var(--bg-elevated)',
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ fontFamily: 'Outfit', fontSize: '0.82rem', color: form.coverCity === d.name ? 'var(--gold-bright)' : 'var(--text-primary)', fontWeight: 500 }}>{d.name}</div>
                        <div style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.country}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — AI suggestions */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={20} color="var(--gold-bright)" />
                  <h2 style={{ fontSize: '1.5rem' }}>AI Activity Suggestions</h2>
                </div>
                <p style={{ fontFamily: 'Outfit', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  {form.coverCity ? `Suggested activities for ${form.coverCity}:` : 'Add stops after creating your trip to get AI suggestions.'}
                </p>
                {aiLoading ? (
                  <div style={{ display: 'flex', gap: '6px', padding: '1rem', alignItems: 'center' }}>
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                    <span style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>AI is thinking...</span>
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 320, overflowY: 'auto' }}>
                    {aiSuggestions.map((act, i) => (
                      <div key={i} className="card-elevated" style={{ padding: '1rem', borderLeft: '3px solid var(--gold-dim)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <span style={{ fontFamily: 'Outfit', fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{act.name}</span>
                          <span style={{ fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--gold-bright)' }}>${act.estimatedCost}</span>
                        </div>
                        <div style={{ fontFamily: 'Outfit', fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{act.description}</div>
                        <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem' }}>
                          <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{act.category}</span>
                          <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{act.durationHours}h · {act.bestTimeOfDay}</span>
                          <span style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: 'var(--gold-muted)', fontStyle: 'italic' }}>✦ AI</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontFamily: 'Outfit', fontSize: '0.88rem' }}>
                    {form.coverCity ? 'No suggestions loaded. Create the trip and add stops to get AI suggestions.' : 'Select a destination in the previous step.'}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-gold)' }}>
          <button className="btn-ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/trips')} style={{ fontSize: '0.88rem', padding: '0.6rem 1.2rem' }}>
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <button className="btn-gold" onClick={handleNext} disabled={loading} style={{ fontSize: '0.88rem', padding: '0.6rem 1.5rem' }}>
            {loading ? 'Creating...' : step === STEPS.length - 1 ? 'Create Trip ✈' : 'Continue'}
            {step < STEPS.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
