import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    fontSize: 14,
    fontWeight: 600,
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    background: isActive ? 'var(--primary-light)' : 'transparent',
    transition: 'color .15s, background .15s',
  });

  return (
    <nav
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontSize: 20, fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-.3px',
          }}
        >
          EventHub
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          <NavLink to="/events" style={linkStyle}>Events</NavLink>
          {user && <NavLink to="/bookings" style={linkStyle}>My Bookings</NavLink>}
        </div>

        {/* Auth actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <span style={{
                fontSize: 13, color: 'var(--text-muted)',
                maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '7px 16px', fontSize: 13, fontWeight: 600,
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)'; }}
                onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
                  padding: '7px 14px',
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  fontSize: 13, fontWeight: 600,
                  padding: '7px 16px',
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'opacity .15s',
                }}
                onMouseEnter={(e) => { e.target.style.opacity = '.88'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
