import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MyTripsPage from './pages/MyTripsPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import SharedTripPage from './pages/SharedTripPage';

function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore();
  if (!user && !token) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, token } = useAuthStore();
  if (user || token) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  // Init loading state
  useEffect(() => {
    // Allow a brief moment for persisted state to hydrate
    setTimeout(() => useAuthStore.getState().setLoading(false), 100);
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-gold)',
            fontFamily: 'Outfit',
            fontSize: '0.88rem',
          },
          success: { iconTheme: { primary: 'var(--gold-bright)', secondary: '#080810' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: '#F2EDE4' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/shared/:token" element={<SharedTripPage />} />

        {/* Protected routes with Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="trips" element={<MyTripsPage />} />
          <Route path="trips/new" element={<CreateTripPage />} />
          <Route path="trips/:id" element={<TripDetailPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
