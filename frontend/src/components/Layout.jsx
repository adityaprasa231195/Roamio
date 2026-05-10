import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Map, Plus, User, LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, DEV_AUTH } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trips', label: 'My Trips', icon: Map },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (!DEV_AUTH) await signOut(auth);
      logout();
      navigate('/auth');
      toast.success('Signed out');
    } catch { toast.error('Sign-out failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Top nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(8,8,16,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-gold)',
        padding: '0 2rem', display: 'flex', alignItems: 'center', height: 64,
      }}>
        {/* Wordmark */}
        <Link to="/dashboard" style={{ textDecoration: 'none', marginRight: '3rem' }}>
          <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.6rem', fontWeight: 300, color: 'var(--gold-bright)', letterSpacing: '0.02em' }}>Roamio</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} style={{
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.85rem', borderRadius: 8,
                fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 500,
                color: active ? 'var(--gold-bright)' : 'var(--text-muted)',
                background: active ? 'var(--gold-glow)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/trips/new" className="btn-gold" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
            <Plus size={15} /> New Trip
          </Link>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-gold)', cursor: 'pointer' }}>
            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <button onClick={handleLogout} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* Page content */}
      <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Outlet />
      </motion.div>
    </div>
  );
}
