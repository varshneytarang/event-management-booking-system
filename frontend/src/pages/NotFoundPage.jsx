import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
      background: 'linear-gradient(180deg, var(--bg-muted) 0%, var(--bg) 60%)',
    }}>
      <div style={{ maxWidth: 480, animation: 'fadeUp .35s cubic-bezier(.16,1,.3,1) both' }}>
        {/* Illustration */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'var(--grad-brand-soft)',
          border: '2px solid var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px', fontSize: 44,
        }}>
          🗺️
        </div>

        <div style={{
          fontSize: 80, fontWeight: 900, letterSpacing: '-4px',
          background: 'var(--grad-brand)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1, marginBottom: 16,
        }}>
          404
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, letterSpacing: '-.3px' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 36, fontSize: 15 }}>
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => navigate(-1)} variant="secondary">
            ← Go back
          </Button>
          <Link to="/events">
            <Button size="lg">Browse Events</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
