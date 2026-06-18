import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api/events';
import EventCard from '../components/EventCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents({ limit: 3, status: 'upcoming' })
      .then(({ data }) => setFeatured(data.data.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)',
        color: '#fff', padding: '100px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎟️</div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 900, lineHeight: 1.15, marginBottom: 20,
            letterSpacing: '-1px',
          }}>
            Your next great experience starts here
          </h1>
          <p style={{ fontSize: 18, opacity: .85, marginBottom: 36, lineHeight: 1.6 }}>
            Discover, book, and manage events all in one place.
            From tech conferences to community meetups.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events">
              <Button size="lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 800 }}>
                Browse Events
              </Button>
            </Link>
            {!user && (
              <Link to="/register">
                <Button size="lg" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '2px solid rgba(255,255,255,.5)' }}>
                  Get Started Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 48 }}>
          Everything you need to manage events
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { icon: '🔍', title: 'Discover Events', desc: 'Browse hundreds of upcoming events filtered by category, date, and location.' },
            { icon: '⚡', title: 'Instant Booking', desc: 'Book seats in seconds. Your booking reference is generated immediately.' },
            { icon: '🔄', title: 'Easy Cancellation', desc: 'Plans change. Cancel any booking and seats are automatically released.' },
            { icon: '🎫', title: 'Booking History', desc: 'All your bookings in one place with full details and booking references.' },
          ].map((f) => (
            <div key={f.title} style={{
              padding: 28, background: '#fff',
              borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured events */}
      <section style={{ background: 'var(--bg-muted)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800 }}>Upcoming Events</h2>
            <Link to="/events">
              <Button variant="ghost">View all events →</Button>
            </Link>
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {featured.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      {!user && (
        <section style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          color: '#fff', padding: '80px 24px', textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Ready to get started?</h2>
          <p style={{ opacity: .7, marginBottom: 32, fontSize: 16 }}>
            Join thousands of people booking events every day.
          </p>
          <Link to="/register">
            <Button size="lg" style={{ background: 'var(--primary)', color: '#fff' }}>
              Create Free Account
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
