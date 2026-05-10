import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, DEV_AUTH } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { AUTH_BG_IMAGE } from '../lib/cityImages';
import api from '../api/client';
import toast from 'react-hot-toast';

// Google 'G' logo SVG
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();

  const syncToBackend = async (firebaseUser, idToken) => {
    try {
      const { data } = await api.post('/api/auth/sync', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setUser(data.user);
    } catch {
      setUser({ id: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || name });
    }
  };

  // Dev bypass login — no Firebase needed
  const devLogin = async (asDemo = false) => {
    setLoading(true);
    try {
      const userId = asDemo ? 'demo-user-001' : `dev-${Date.now()}`;
      const devToken = asDemo ? 'demo' : `dev-${userId}`;
      setToken(devToken);
      const { data } = await api.post('/api/auth/sync', {}, {
        headers: { Authorization: `Bearer ${devToken}` },
      });
      setUser(data.user);
      toast.success(`Welcome${asDemo ? ', Alex Rivera' : ''}! 🌍`);
    } catch (err) {
      toast.error('Could not connect to backend. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let firebaseUser;
      if (mode === 'login') {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = cred.user;
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = cred.user;
      }
      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);
      await syncToBackend(firebaseUser, idToken);
      toast.success(mode === 'login' ? 'Welcome back! 🌍' : 'Account created! 🌍');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      await syncToBackend(result.user, idToken);
      toast.success('Signed in with Google! 🌍');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Left panel — animated gradient */}
      <div className="hero-gradient" style={{
        flex: 1, display: 'none', position: 'relative', overflow: 'hidden',
        flexDirection: 'column', justifyContent: 'flex-end', padding: '3rem',
      }}
        // Show on md+
        ref={el => { if (el) el.style.display = window.innerWidth >= 768 ? 'flex' : 'none'; }}
      >
        {/* Decorative city silhouette */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${AUTH_BG_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080810 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold-muted)', fontFamily: 'Outfit', fontWeight: 500, textTransform: 'uppercase', marginBottom: '1rem' }}>Est. 2025</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontWeight: 300, fontSize: '3.5rem', color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '1rem' }}>
            Every great journey<br />begins with a plan.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit', fontSize: '1rem', maxWidth: '380px' }}>
            AI-powered travel planning that thinks with you — from first inspiration to final day.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
            {[['20+', 'Destinations'], ['3', 'AI Features'], ['∞', 'Adventures']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'DM Mono', fontSize: '1.5rem', color: 'var(--gold-bright)' }}>{n}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div style={{
        flex: '0 0 min(100%, 480px)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '2.5rem', background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-gold)',
      }}>
        {/* Wordmark */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '2.8rem', fontWeight: 300, color: 'var(--gold-bright)', letterSpacing: '0.02em' }}>
            Roamio
          </div>
          <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
            Plan Smarter. Travel Better.
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', marginBottom: '2rem', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-gold)' }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s',
              background: mode === m ? 'linear-gradient(135deg, #D4AF6A, #A8895A)' : 'transparent',
              color: mode === m ? '#080810' : 'var(--text-muted)',
            }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: '2.75rem' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button className="btn-gold" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div className="divider" style={{ flex: 1 }} />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'Outfit', fontSize: '0.8rem' }}>or continue with</span>
          <div className="divider" style={{ flex: 1 }} />
        </div>

        <button className="btn-ghost" onClick={handleGoogle} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          <GoogleLogo />
          Continue with Google
        </button>

        <button className="btn-ghost" onClick={() => devLogin(false)} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', borderColor: 'rgba(212,175,106,0.2)' }}>
          <User size={16} color="var(--gold-muted)" />
          Continue as Guest
        </button>

        {/* Demo account hint */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Try the demo account</div>
          <button onClick={() => { setEmail('demo@roamio.com'); setPassword('demo1234'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-bright)', fontFamily: 'DM Mono', fontSize: '0.8rem' }}>
            demo@roamio.com / demo1234
          </button>
          <div style={{ marginTop: '0.5rem' }}>
            <button className="btn-ghost" onClick={() => devLogin(true)} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
              Quick Demo Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
