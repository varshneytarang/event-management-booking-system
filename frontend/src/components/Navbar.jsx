import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/useAuth';
import Button from './ui/Button';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { mutate: logout, isPending } = useLogout();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkStyle = ({ isActive }) => ({
    fontSize: 14, fontWeight: 500,
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    padding: '7px 14px', borderRadius: 'var(--radius-sm)',
    background: isActive ? 'var(--primary-xlight)' : 'transparent',
    border: isActive ? '1px solid var(--primary-light)' : '1px solid transparent',
    transition: 'all .18s',
    letterSpacing: '.01em',
  });

  const hoverLink = (e) => {
    if (!e.currentTarget.style.background.includes('xlight')) {
      e.currentTarget.style.background = 'var(--bg-muted)';
      e.currentTarget.style.color = 'var(--text)';
    }
  };
  const leaveLink = (e) => {
    if (!e.currentTarget.style.background.includes('xlight')) {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--text-muted)';
    }
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: scrolled ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.75)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'rgba(229,231,235,.5)'}`,
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      transition: 'all .25s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--grad-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 2px 8px rgba(99,102,241,.35)',
          }}>🎟️</div>
          <span style={{
            fontSize: 18, fontWeight: 800, letterSpacing: '-.3px',
            background: 'var(--grad-brand)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>EventHub</span>
        </Link>

        {/* Center nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavLink to="/events" style={linkStyle} onMouseEnter={hoverLink} onMouseLeave={leaveLink}>
            Events
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/bookings" style={linkStyle} onMouseEnter={hoverLink} onMouseLeave={leaveLink}>
              My Bookings
            </NavLink>
          )}
        </div>

        {/* Right — auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              {/* Avatar pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 12px 6px 6px',
                background: 'var(--bg-muted)', borderRadius: 99,
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--grad-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </span>
                {isAdmin && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: '#92400e',
                    background: '#fef3c7', padding: '2px 6px',
                    borderRadius: 4, letterSpacing: '.5px', textTransform: 'uppercase',
                  }}>Admin</span>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => logout()} loading={isPending}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', padding: '7px 14px', borderRadius: 'var(--radius-sm)', transition: 'color .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                Sign in
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
