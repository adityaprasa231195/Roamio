import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, TrendingDown, CheckCircle, Sparkles } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, getCurrencySymbol } from '../lib/currencies';
import toast from 'react-hot-toast';

const CAT_COLORS = {
  transport: '#A8895A', stay: '#D4AF6A', food: '#C9874A',
  activity: '#5A8AC9', other: '#5A5448',
};

const CATEGORIES = ['transport', 'stay', 'food', 'activity', 'other'];

const CustomTooltip = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 8, padding: '0.75rem 1rem' }}>
      <div style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{payload[0].name}</div>
      <div style={{ fontFamily: 'DM Mono', fontSize: '0.9rem', color: 'var(--gold-bright)' }}>{formatCurrency(payload[0].value, currency)}</div>
    </div>
  );
};

export default function BudgetPage({ trip }) {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'food', amount: '', label: '', date: '' });
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchBudget = () => {
    api.get(`/api/trips/${trip.id}/budget`)
      .then(r => setBudget(r.data))
      .catch(() => toast.error('Failed to load budget'))
      .finally(() => setLoading(false));
  };
  useEffect(fetchBudget, [trip.id]);

  const handleAddExpense = async () => {
    if (!form.amount || !form.label) { toast.error('Fill in amount and label'); return; }
    try {
      await api.post(`/api/trips/${trip.id}/expenses`, { ...form, amount: parseFloat(form.amount) });
      toast.success('Expense logged');
      setForm({ category: 'food', amount: '', label: '', date: '' });
      fetchBudget();
    } catch { toast.error('Failed to add expense'); }
  };

  const handleAIAdvice = async () => {
    setAiLoading(true);
    setAiAdvice('');
    try {
      const res = await fetch('/api/ai/budget-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ tripId: trip.id }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          const d = JSON.parse(line.slice(6));
          if (d.type === 'delta') { buf += d.text; setAiAdvice(buf); }
        }
      }
    } catch { toast.error('AI advice failed'); }
    setAiLoading(false);
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />;

  const pieData = CATEGORIES
    .filter(c => budget?.byCategory?.[c] > 0)
    .map(c => ({ name: c.charAt(0).toUpperCase() + c.slice(1), value: budget.byCategory[c] }));

  const barData = Object.entries(budget?.byDay || {}).map(([day, amount]) => ({ day: day.slice(5), amount }));
  const remaining = (budget?.totalBudget || 0) - (budget?.totalSpent || 0);

  const sym = getCurrencySymbol(trip.currency || 'USD');
  const cur = trip.currency || 'USD';

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Budget', value: formatCurrency(budget?.totalBudget || 0, cur), color: 'var(--gold-bright)' },
          { label: 'Total Spent', value: formatCurrency(budget?.totalSpent || 0, cur), color: 'var(--text-primary)' },
          { label: 'Remaining', value: formatCurrency(remaining, cur), color: remaining >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: 'Activities Est.', value: formatCurrency(budget?.activityTotal || 0, cur), color: 'var(--info)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'DM Mono', fontSize: '1.5rem', color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem' }}>
        {/* Donut */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', alignSelf: 'flex-start' }}>Spending by Category</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" animationDuration={800}>
                  {pieData.map((_, i) => <Cell key={i} fill={Object.values(CAT_COLORS)[i % 5]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip currency={cur} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontFamily: 'Outfit', fontSize: '0.85rem' }}>No expenses yet</div>}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: Object.values(CAT_COLORS)[i % 5] }} />
                <span style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart by day */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Daily Spending</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'DM Mono' }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'DM Mono' }} />
                <Tooltip content={<CustomTooltip currency={cur} />} />
                {budget?.dailyBudget && <ReferenceLine y={budget.dailyBudget} stroke="var(--danger)" strokeDasharray="4 4" />}
                <Bar dataKey="amount" fill="var(--gold-muted)" radius={[4, 4, 0, 0]}>
                  {barData.map((d, i) => (
                    <Cell key={i}
                      fill={budget?.overBudgetDays?.includes(Object.keys(budget.byDay)[i]) ? 'var(--danger)' : 'var(--gold-muted)'}
                      className={budget?.overBudgetDays?.includes(Object.keys(budget.byDay)[i]) ? 'danger-pulse' : ''}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontFamily: 'Outfit', fontSize: '0.85rem' }}>No expense data yet</div>}
        </div>
      </div>

      {/* Log expense + AI advice */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Log expense */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Log Expense</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input className="input" placeholder="Label (e.g. Hotel Paris)" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} style={{ fontSize: '0.85rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input className="input" type="number" placeholder={`Amount (${sym})`} value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={{ fontSize: '0.85rem' }} />
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ fontSize: '0.85rem' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ fontSize: '0.85rem' }} />
            <button className="btn-gold" onClick={handleAddExpense} style={{ justifyContent: 'center' }}>
              <Plus size={16} /> Log Expense
            </button>
          </div>
        </div>

        {/* AI Budget Advisor */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--gold-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--gold-bright)" />
              <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Budget Advisor</span>
            </div>
            <button onClick={handleAIAdvice} className="btn-ghost" disabled={aiLoading} style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}>
              {aiLoading ? 'Analyzing...' : 'Get Advice'}
            </button>
          </div>
          {aiLoading && !aiAdvice && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '0.5rem 0' }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          )}
          {aiAdvice ? (
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {(() => {
                try {
                  const parsed = JSON.parse(aiAdvice);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {parsed.verdict && <p style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-secondary)' }}>{parsed.verdict}</p>}
                      {parsed.warnings?.map((w, i) => <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--warning)', fontFamily: 'Outfit' }}><AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />{w}</div>)}
                      {parsed.tips?.map((t, i) => <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'Outfit' }}><TrendingDown size={14} style={{ flexShrink: 0, marginTop: 2 }} />{t}</div>)}
                      {parsed.greenFlags?.map((g, i) => <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--success)', fontFamily: 'Outfit' }}><CheckCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />{g}</div>)}
                    </div>
                  );
                } catch {
                  return <p className="ai-text">{aiAdvice}</p>;
                }
              })()}
            </div>
          ) : !aiLoading && (
            <p style={{ fontFamily: 'Outfit', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Click "Get Advice" to receive personalized budget insights from Claude AI.</p>
          )}
        </div>
      </div>
    </div>
  );
}
