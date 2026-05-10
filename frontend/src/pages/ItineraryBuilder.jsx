import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Sparkles, GripVertical, Trash2, MapPin, Clock, DollarSign, X, RefreshCw, Pencil } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import toast from 'react-hot-toast';

// Custom gold map pin
function createGoldPin(number) {
  return L.divIcon({
    html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#D4AF6A,#A8895A);transform:rotate(-45deg);border:2px solid rgba(212,175,106,0.5);box-shadow:0 0 16px rgba(212,175,106,0.4);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#080810;font-family:DM Mono;font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${number}</span></div>`,
    className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -36],
  });
}

function MapUpdater({ stops }) {
  const map = useMap();
  useEffect(() => {
    const valid = stops.filter(s => s.latitude && s.longitude);
    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [stops, map]);
  return null;
}

function SortableStop({ stop, index, active, onSelect, onDelete, onAddActivity, onDeleteActivity }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const style = {
    transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="card"
        onClick={() => onSelect(stop.id)}
        style={{
          marginBottom: '0.75rem', padding: '1rem',
          borderLeft: active === stop.id ? '3px solid var(--gold-bright)' : '3px solid transparent',
          cursor: 'pointer', transition: 'border-color 0.2s',
          background: active === stop.id ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--gold-dim)', flexShrink: 0 }}>
            <GripVertical size={16} />
          </div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#D4AF6A,#A8895A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: '#080810', fontWeight: 600 }}>{index + 1}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stop.cityName}</div>
            {stop.country && <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stop.country}</div>}
          </div>
          <button onClick={e => { e.stopPropagation(); onDelete(stop.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, padding: 4 }}>
            <Trash2 size={14} />
          </button>
        </div>
        {active === stop.id && stop.activities?.length > 0 && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-gold)' }}>
            {stop.activities.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid rgba(212,175,106,0.06)' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1 }}>
                  {a.isAiSuggested && <span style={{ color: 'var(--gold-muted)', fontStyle: 'italic', fontSize: '0.7rem' }}>✦ </span>}
                  {a.name}
                  {a.description && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>{a.description}</span>}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--gold-bright)' }}>${a.estimatedCost}</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.durationHours}h</span>
                  <button onClick={e => { e.stopPropagation(); onDeleteActivity(stop.id, a.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, opacity: 0.5 }} title="Remove activity">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={e => { e.stopPropagation(); onAddActivity(stop.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-muted)', fontFamily: 'Outfit', fontSize: '0.78rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={13} /> Add Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ItineraryBuilder({ trip, onUpdate }) {
  const [stops, setStops] = useState(trip?.stops || []);
  const [activeStop, setActiveStop] = useState(null);
  const [addingStop, setAddingStop] = useState(false);
  const [addingActivity, setAddingActivity] = useState(null); // stopId
  const [aiLoading, setAiLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [newStop, setNewStop] = useState({ cityName: '', country: '', latitude: '', longitude: '' });
  const [newAct, setNewAct] = useState({ name: '', category: 'sightseeing', estimatedCost: '', durationHours: '' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const mapPositions = stops.filter(s => s.latitude && s.longitude).map(s => [s.latitude, s.longitude]);

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = stops.findIndex(s => s.id === active.id);
    const newIdx = stops.findIndex(s => s.id === over.id);
    const reordered = arrayMove(stops, oldIdx, newIdx).map((s, i) => ({ ...s, stopOrder: i }));
    setStops(reordered);
    try {
      await api.patch('/api/stops/reorder', { stops: reordered.map(s => ({ id: s.id, order: s.stopOrder })) });
    } catch { toast.error('Failed to reorder stops'); }
  };

  const handleAddStop = async () => {
    if (!newStop.cityName) return;
    try {
      const { data } = await api.post(`/api/trips/${trip.id}/stops`, {
        ...newStop,
        latitude: parseFloat(newStop.latitude) || null,
        longitude: parseFloat(newStop.longitude) || null,
      });
      setStops(prev => [...prev, data.stop]);
      setNewStop({ cityName: '', country: '', latitude: '', longitude: '' });
      setAddingStop(false);
      setActiveStop(data.stop.id);
      toast.success(`${data.stop.cityName} added! ✈`);
    } catch { toast.error('Failed to add stop'); }
  };

  const handleDeleteStop = async (stopId) => {
    if (!confirm('Remove this stop?')) return;
    try {
      await api.delete(`/api/stops/${stopId}`);
      setStops(prev => prev.filter(s => s.id !== stopId));
      if (activeStop === stopId) setActiveStop(null);
    } catch { toast.error('Failed to delete stop'); }
  };

  const handleAddActivity = async (stopId) => {
    if (!newAct.name) return;
    try {
      const { data } = await api.post(`/api/stops/${stopId}/activities`, {
        ...newAct, estimatedCost: parseFloat(newAct.estimatedCost) || 0,
        durationHours: parseFloat(newAct.durationHours) || 1,
      });
      setStops(prev => prev.map(s => s.id === stopId ? { ...s, activities: [...(s.activities || []), data.activity] } : s));
      setNewAct({ name: '', category: 'sightseeing', estimatedCost: '', durationHours: '' });
      setAddingActivity(null);
    } catch { toast.error('Failed to add activity'); }
  };

  const handleAISuggest = async (stopId) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;
    setAiLoading(stopId);
    try {
      const res = await fetch('/api/ai/suggest-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ city: stop.cityName, budget: trip.totalBudget / Math.max(1, stops.length) / 3, days: 3 }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n').filter(l => l.startsWith('data: '))) {
          const d = JSON.parse(line.slice(6));
          if (d.type === 'delta') buffer += d.text;
          if (d.type === 'done') {
            try {
              const acts = JSON.parse(buffer);
              for (const act of acts.slice(0, 3)) {
                const { data } = await api.post(`/api/stops/${stopId}/activities`, { ...act, isAiSuggested: true });
                setStops(prev => prev.map(s => s.id === stopId ? { ...s, activities: [...(s.activities || []), data.activity] } : s));
              }
              toast.success('3 AI activities added! ✦');
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch { toast.error('AI suggestion failed'); }
    setAiLoading(null);
  };

  const handleDeleteActivity = async (stopId, activityId) => {
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, activities: s.activities.filter(a => a.id !== activityId) } : s));
    try { await api.delete(`/api/activities/${activityId}`); }
    catch { toast.error('Failed to delete activity'); }
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate itinerary? This will replace all current stops and activities.')) return;
    setRegenerating(true);
    try {
      const city = stops[0]?.cityName || trip.name;
      const { data } = await api.post(`/api/trips/${trip.id}/auto-generate`, { city });
      setStops(data.trip.stops || []);
      setActiveStop(null);
      toast.success('Itinerary regenerated! ✦');
      onUpdate?.();
    } catch { toast.error('Failed to regenerate'); }
    setRegenerating(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', minHeight: 600 }}>
      {/* Left — Stop timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Stops · {stops.length}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleRegenerate} disabled={regenerating} className="btn-ghost" style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}>
              <RefreshCw size={12} className={regenerating ? 'spin' : ''} /> {regenerating ? 'Regenerating...' : '✦ Regenerate'}
            </button>
            <button onClick={() => setAddingStop(true)} className="btn-gold" style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}>
              <Plus size={14} /> Add Stop
            </button>
          </div>
        </div>

        {/* Add stop form */}
        <AnimatePresence>
          {addingStop && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="card" style={{ padding: '1rem', marginBottom: '0.5rem', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input className="input" placeholder="City name *" value={newStop.cityName} onChange={e => setNewStop(p => ({ ...p, cityName: e.target.value }))} style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }} />
                <input className="input" placeholder="Country" value={newStop.country} onChange={e => setNewStop(p => ({ ...p, country: e.target.value }))} style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input className="input" placeholder="Lat (e.g. 48.85)" value={newStop.latitude} onChange={e => setNewStop(p => ({ ...p, latitude: e.target.value }))} style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem' }} />
                  <input className="input" placeholder="Lng (e.g. 2.35)" value={newStop.longitude} onChange={e => setNewStop(p => ({ ...p, longitude: e.target.value }))} style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-gold" onClick={handleAddStop} style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem', justifyContent: 'center' }}>Add</button>
                  <button className="btn-ghost" onClick={() => setAddingStop(false)} style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem', justifyContent: 'center' }}>Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sortable stop list */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {stops.map((stop, i) => (
              <div key={stop.id}>
                <SortableStop stop={stop} index={i} active={activeStop} onSelect={setActiveStop} onDelete={handleDeleteStop} onAddActivity={() => setAddingActivity(stop.id)} onDeleteActivity={handleDeleteActivity} />
                {activeStop === stop.id && (
                  <div style={{ paddingLeft: '1rem', paddingBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setAddingActivity(stop.id)} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                      <Plus size={12} /> Activity
                    </button>
                    <button onClick={() => handleAISuggest(stop.id)} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }} disabled={aiLoading === stop.id}>
                      <Sparkles size={12} color="var(--gold-bright)" />
                      {aiLoading === stop.id ? 'Asking AI...' : '✦ AI Suggest'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </SortableContext>
        </DndContext>

        {/* Add activity form */}
        <AnimatePresence>
          {addingActivity && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="card" style={{ padding: '1rem' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--gold-muted)', marginBottom: '0.75rem' }}>Add Activity to {stops.find(s => s.id === addingActivity)?.cityName}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input className="input" placeholder="Activity name *" value={newAct.name} onChange={e => setNewAct(p => ({ ...p, name: e.target.value }))} style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }} />
                <select className="input" value={newAct.category} onChange={e => setNewAct(p => ({ ...p, category: e.target.value }))} style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}>
                  {['sightseeing','food','adventure','culture','shopping','transport'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input className="input" type="number" placeholder="Cost ($)" value={newAct.estimatedCost} onChange={e => setNewAct(p => ({ ...p, estimatedCost: e.target.value }))} style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }} />
                  <input className="input" type="number" placeholder="Hours" value={newAct.durationHours} onChange={e => setNewAct(p => ({ ...p, durationHours: e.target.value }))} style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-gold" onClick={() => handleAddActivity(addingActivity)} style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem', justifyContent: 'center' }}>Add</button>
                  <button className="btn-ghost" onClick={() => setAddingActivity(null)} style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem', justifyContent: 'center' }}>Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {stops.length === 0 && !addingStop && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontFamily: 'Outfit', fontSize: '0.85rem' }}>
            <MapPin size={24} color="var(--gold-dim)" style={{ marginBottom: '0.5rem' }} />
            <div>Add your first stop to start building your itinerary.</div>
          </div>
        )}
      </div>

      {/* Right — Map */}
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-gold)', minHeight: 500, position: 'relative' }}>
        {typeof window !== 'undefined' && (
          <MapContainer
            center={mapPositions.length > 0 ? mapPositions[0] : [20, 0]}
            zoom={mapPositions.length > 0 ? 5 : 2}
            style={{ height: '100%', minHeight: 500, background: 'var(--bg-base)' }}
            zoomControl={true}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {mapPositions.length > 1 && (
              <Polyline
                positions={mapPositions}
                pathOptions={{ color: '#D4AF6A', weight: 2, opacity: 0.7, dashArray: '8, 8' }}
              />
            )}
            {stops.filter(s => s.latitude && s.longitude).map((stop, i) => (
              <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={createGoldPin(i + 1)}>
                <Popup>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: '#333' }}>
                    <strong>{stop.cityName}</strong>
                    {stop.activities?.length > 0 && <div>{stop.activities.length} activities planned</div>}
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapUpdater stops={stops} />
          </MapContainer>
        )}
        {mapPositions.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 500 }}>
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(8,8,16,0.85)', borderRadius: 12, border: '1px solid var(--border-gold)' }}>
              <div style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--text-muted)' }}>Add stops with coordinates to see your route.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
