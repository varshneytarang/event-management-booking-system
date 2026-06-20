import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/ui/Spinner';

import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import EventsPage      from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import BookingsPage    from './pages/BookingsPage';
import NotFoundPage    from './pages/NotFoundPage';

export default function App() {
  const { loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={52} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"        element={<HomePage />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events"  element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/bookings" element={
            <ProtectedRoute><BookingsPage /></ProtectedRoute>
          } />
          <Route path="/404"   element={<NotFoundPage />} />
          <Route path="*"      element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
}
