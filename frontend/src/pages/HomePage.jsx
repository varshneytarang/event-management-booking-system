import React from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/EventCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { value: '50K+', label: 'Happy attendees' },
  { value: '1.2K', label: 'Events hosted' },
  { value: '200+', label: 'Cities worldwide' },
  { value: '98%', label: 'Satisfaction rate' },
];

const FEATURES = [
  { icon: '🔍', title: 'Smart Discovery', desc: 'Search and filter hundreds of events by category, date, venue, and availability — all in real time.' },
  { icon: '⚡', title: 'Instant Booking', desc: 'Secure your seats in seconds. A unique booking reference is generated immediately for every reservation.' },
  { icon: '🔒', title: 'Safe & Secure', desc: 'Industry-standard JWT authentication with refresh token rotation keeps your account safe.' },
  { icon: '🔄', title: 'Flexible Cancellation', desc: 'Plans change. Cancel any time and seats are instantly released back — no hassle, no friction.' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useEvents({ limit: 3, status: 'upcoming', sortBy: 'dateTime', order: 'asc' });
  const featured = data?.data?.events || [];

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        background: 'var(--grad-brand)',
        overflow: 'hidden',
        padding: '100px 24px 120px',
        textAlign: 'center',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 480, height: 480, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', animation: 'fadeUp .5s cubic-bezier(.16,1,.3,1) both' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,.25)',
            borderRadius: 99, padding: '6px 16px',
            fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.9)',
            marginBottom: 28,
          }}>
            <span style={{ fontSize: 10, background: '#fff', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4, fontWeight: 800, letterSpacing: '.5px' }}>NEW</span>
            Discover events near you →
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 900,
            lineHeight: 1.12, letterSpacing: '-1.5px',
            color: '#fff',
            marginBottom: 22,
          }}>
            Your next great<br />
            <span style={{ color: 'rgba(255,255,255,.85)' }}>experience starts here</span>
          </h1>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,.75)',
            marginBottom: 40, lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto 40px',
          }}>
            Discover, book, and manage events — from tech conferences to music festivals — all in one beautifully simple platform.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events">
              <Button size="xl" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 800, boxShadow: '0 8px 28px rgba(0,0,0,.18)' }}>
                Browse Events
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="xl" style={{ background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(8px)', color: '#fff', border: '1.5px solid rgba(255,255,255,.35)', boxShadow: 'none' }}>
                  Create free account
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Wave bottom */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, overflow: 'hidden', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 28px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              padding: '28px 24px', textAlign: 'center',
              borderRight: '1px solid var(--border)',
            }}>
              <div style={{
                fontSize: 28, fontWeight: 900, letterSpacing: '-1px',
                background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Why EventHub</p>
          <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, letterSpacing: '-.5px', marginBottom: 14 }}>Everything you need to book events</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            A complete event discovery and booking platform built for speed, reliability, and simplicity.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{
              padding: 28, background: '#fff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--grad-brand-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 18,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured events ───────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-muted)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Upcoming</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.3px' }}>Don't miss these events</h2>
            </div>
            <Link to="/events">
              <Button variant="ghost" size="sm">View all events →</Button>
            </Link>
          </div>
          {isLoading ? <Spinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
              {featured.map((e, i) => <EventCard key={e._id} event={e} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--grad-dark)', padding: '96px 28px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: -80, right: -40, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,.12)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, color: '#fff', letterSpacing: '-.5px', marginBottom: 16 }}>
              Ready to book your next experience?
            </h2>
            <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: 36, fontSize: 16, lineHeight: 1.7 }}>
              Join thousands of people discovering and booking amazing events every day.
            </p>
            <Link to="/register">
              <Button size="xl" style={{ background: 'var(--grad-brand)', boxShadow: '0 8px 28px rgba(99,102,241,.5)' }}>
                Get started — it's free
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        background: '#fff', borderTop: '1px solid var(--border)',
        padding: '28px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🎟️</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>EventHub</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>
          &copy; {new Date().getFullYear()} EventHub. Built with React &amp; Node.js.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Support'].map((l) => (
            <span key={l} style={{ fontSize: 13, color: 'var(--text-light)', cursor: 'pointer', transition: 'color .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-light)'; }}>
              {l}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
