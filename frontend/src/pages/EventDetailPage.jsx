import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useEvent } from '../hooks/useEvents';
import { useCreateBooking } from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Modal from '../components/ui/Modal';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError, refetch } = useEvent(id);
  const { mutate: book, isPending: booking } = useCreateBooking();

  const [modalOpen, setModalOpen] = useState(false);
  const [seats, setSeats] = useState(1);

  const event = data?.data?.event;

  if (isLoading) return <Spinner fullPage />;
  if (isError || !event) return <ErrorMessage message="Event not found" onRetry={refetch} />;

  const pct = event.totalSeats > 0 ? (event.availableSeats / event.totalSeats) * 100 : 0;
  const canBook = ['upcoming', 'ongoing'].includes(event.status) && event.availableSeats > 0;

  const barGradient = pct > 50
    ? 'linear-gradient(90deg, #10b981, #34d399)'
    : pct > 20
    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
    : 'linear-gradient(90deg, #ef4444, #f87171)';

  const handleBook = () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: `/events/${id}` } }); return; }
    setModalOpen(true);
  };

  const handleConfirm = () => book({ eventId: event._id, seatsBooked: seats }, {
    onSuccess: () => { setModalOpen(false); refetch(); },
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/events" style={{ color: 'var(--text-muted)', transition: 'color .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
            Events
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{event.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          {/* Main card */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
            {/* Hero image */}
            <div style={{ position: 'relative', height: 360 }}>
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🎉</div>
              )}
              {/* Overlay gradient for text readability */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%)' }} />
              {/* Badges */}
              <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 8 }}>
                <Badge label={event.status} showDot />
                <Badge label={event.category || 'General'} />
              </div>
              {/* Title overlay */}
              <div style={{ position: 'absolute', bottom: 24, left: 32, right: 32 }}>
                <h1 style={{ fontSize: 'clamp(20px,3.5vw,30px)', fontWeight: 900, color: '#fff', lineHeight: 1.25, letterSpacing: '-.3px', textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>
                  {event.name}
                </h1>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '32px 36px' }}>
              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { icon: '📅', label: 'Date & Time', value: format(new Date(event.dateTime), 'MMMM d, yyyy'), sub: format(new Date(event.dateTime), 'h:mm a') },
                  { icon: '📍', label: 'Venue', value: event.venue },
                  { icon: '🎫', label: 'Total Seats', value: event.totalSeats.toLocaleString() },
                  { icon: '✅', label: 'Available', value: event.availableSeats.toLocaleString(), highlight: true },
                ].map((m) => (
                  <div key={m.label} style={{
                    padding: '16px 18px',
                    background: m.highlight && pct === 0 ? 'var(--danger-light)' : 'var(--bg-muted)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{m.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-light)', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: m.highlight && pct === 0 ? 'var(--danger)' : m.highlight ? 'var(--success)' : 'var(--text)' }}>
                      {m.value}
                    </div>
                    {m.sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</div>}
                  </div>
                ))}
              </div>

              {/* Seat availability */}
              <div style={{ marginBottom: 28, padding: '20px 22px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Seat availability</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {event.availableSeats} of {event.totalSeats} seats remaining ({Math.round(pct)}%)
                  </span>
                </div>
                <div style={{ height: 10, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barGradient, borderRadius: 99, transition: 'width .5s ease' }} />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>About this event</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.85, fontSize: 15 }}>{event.description}</p>
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                {canBook ? (
                  <Button size="lg" onClick={handleBook} style={{ minWidth: 180 }}>
                    🎟️ Book Seats
                  </Button>
                ) : pct === 0 ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', background: 'var(--danger-light)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontWeight: 700,
                  }}>
                    Sold Out
                  </div>
                ) : (
                  <div style={{ padding: '12px 24px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>
                    Bookings not available
                  </div>
                )}
                <Button variant="ghost" size="lg" onClick={() => navigate('/events')}>
                  ← Back to Events
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm your booking" subtitle={event.name}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Event summary */}
          <div style={{ padding: '14px 16px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
            📅 {format(new Date(event.dateTime), 'MMM d, yyyy · h:mm a')} &nbsp;·&nbsp; 📍 {event.venue}
          </div>

          {/* Seat picker */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
              Number of seats <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(max 10)</span>
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border)', overflow: 'hidden',
              width: 'fit-content',
            }}>
              {[
                { label: '−', action: () => setSeats((s) => Math.max(1, s - 1)) },
                null,
                { label: '+', action: () => setSeats((s) => Math.min(Math.min(10, event.availableSeats), s + 1)) },
              ].map((btn, i) => btn === null ? (
                <span key="val" style={{
                  fontSize: 20, fontWeight: 800, minWidth: 56, textAlign: 'center',
                  padding: '10px 0', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
                  background: '#fff',
                }}>
                  {seats}
                </span>
              ) : (
                <button key={btn.label} onClick={btn.action} style={{
                  width: 46, height: 46, background: 'none', border: 'none',
                  fontSize: 18, cursor: 'pointer', color: 'var(--text)',
                  fontWeight: 700, transition: 'background .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                  {btn.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 8 }}>
              {event.availableSeats} seat{event.availableSeats !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Summary line */}
          <div style={{ padding: '12px 16px', background: 'var(--primary-xlight)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-light)', fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)' }}>
            You're booking {seats} seat{seats > 1 ? 's' : ''} for <em>{event.name}</em>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button onClick={handleConfirm} loading={booking} style={{ flex: 2 }}>
              Confirm booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
