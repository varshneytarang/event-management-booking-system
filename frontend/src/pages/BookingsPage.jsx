import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useBookings, useCancelBooking } from '../hooks/useBookings';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import Modal from '../components/ui/Modal';

export default function BookingsPage() {
  const { data, isLoading, isError, refetch } = useBookings();
  const { mutate: cancel, isPending: cancelling } = useCancelBooking();
  const [target, setTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  const bookings = data?.data?.bookings || [];
  const filtered  = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

  const chip = (active) => ({
    padding: '7px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600,
    border: '1.5px solid', cursor: 'pointer',
    transition: 'all .18s cubic-bezier(.16,1,.3,1)',
    borderColor: active ? 'var(--primary)' : 'var(--border)',
    background: active ? 'var(--primary)' : '#fff',
    color: active ? '#fff' : 'var(--text-muted)',
    boxShadow: active ? '0 2px 8px rgba(99,102,241,.25)' : 'none',
  });

  // cancel passes the booking _id string to the mutation
  const handleCancel = () =>
    cancel(target._id, { onSuccess: () => setTarget(null) });

  if (isLoading) return <Spinner fullPage />;
  if (isError)   return <ErrorMessage message="Failed to load bookings" onRetry={refetch} />;

  return (
    <div>
      {/* Page header */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-muted) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 28px 32px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Account</p>
          <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', fontWeight: 900, letterSpacing: '-.4px', marginBottom: 6 }}>My Bookings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Track and manage all your event reservations</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 28px 64px' }}>
        {/* Stats cards */}
        {bookings.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Bookings', value: bookings.length,       color: 'var(--primary)', bg: 'var(--primary-xlight)', border: 'var(--primary-light)' },
              { label: 'Confirmed',      value: confirmed,             color: 'var(--success)',  bg: '#f0fdf4',               border: '#bbf7d0' },
              { label: 'Cancelled',      value: cancelled,             color: 'var(--danger)',   bg: 'var(--danger-light)',   border: '#fecaca' },
            ].map((s) => (
              <div key={s.label} style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 'var(--radius-lg)',
                padding: '22px 24px',
              }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'all',       label: `All${bookings.length ? ` (${bookings.length})` : ''}` },
            { key: 'confirmed', label: `Confirmed${confirmed ? ` (${confirmed})` : ''}` },
            { key: 'cancelled', label: `Cancelled${cancelled ? ` (${cancelled})` : ''}` },
          ].map(({ key, label }) => (
            <button key={key} style={chip(filter === key)} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#fff', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--primary-xlight)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
            }}>🎟️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: filter === 'all' ? 24 : 0 }}>
              {filter === 'all' ? 'Start exploring events and make your first booking.' : ''}
            </p>
            {filter === 'all' && (
              <Link to="/events"><Button>Browse Events</Button></Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((b) => (
              <BookingCard key={b._id} booking={b} onCancel={() => setTarget(b)} />
            ))}
          </div>
        )}

        {/* Cancel confirmation modal */}
        <Modal
          open={!!target}
          onClose={() => setTarget(null)}
          title="Cancel this booking?"
          subtitle={target?.eventId?.name}
          maxWidth={440}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Warning box */}
            <div style={{
              padding: '14px 16px',
              background: 'var(--danger-light)',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13, color: '#991b1b', lineHeight: 1.6,
            }}>
              <strong>{target?.seatsBooked} seat{target?.seatsBooked > 1 ? 's' : ''}</strong> will be released back to the event.
              This action <strong>cannot be undone</strong>.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setTarget(null)} style={{ flex: 1 }}>
                Keep booking
              </Button>
              <Button variant="danger" onClick={handleCancel} loading={cancelling} style={{ flex: 1 }}>
                Cancel booking
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel }) {
  const event = booking.eventId; // populated by backend
  const isConfirmed = booking.status === 'confirmed';
  const isPast      = event && new Date(event.dateTime) < new Date();
  const canCancel   = isConfirmed && !isPast && event?.status !== 'cancelled';

  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      opacity: isConfirmed ? 1 : 0.68,
      transition: 'box-shadow .18s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div style={{ display: 'flex' }}>
        {/* Status accent bar */}
        <div style={{
          width: 5, flexShrink: 0,
          background: isConfirmed
            ? 'linear-gradient(180deg, #10b981, #059669)'
            : 'linear-gradient(180deg, #ef4444, #dc2626)',
        }} />

        <div style={{ padding: '20px 24px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge label={booking.status} showDot />
                {event && <Badge label={event.category || 'General'} />}
                {isPast && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Past event</span>
                )}
              </div>

              {/* Event name */}
              <Link
                to={`/events/${event?._id}`}
                style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 10, lineHeight: 1.3 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
              >
                {event?.name || 'Unknown Event'}
              </Link>

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 18px', fontSize: 13, color: 'var(--text-muted)' }}>
                {event && (
                  <span>📅 {format(new Date(event.dateTime), 'MMM d, yyyy · h:mm a')}</span>
                )}
                {event && <span>📍 {event.venue}</span>}
                <span>🎫 {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
              </div>

              {/* Footer row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 10, alignItems: 'center' }}>
                <code style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  background: 'var(--bg-muted)', color: 'var(--text-muted)',
                  padding: '3px 8px', borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)',
                }}>
                  {booking.bookingReference}
                </code>
                <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                  Booked {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                </span>
                {booking.cancelledAt && (
                  <span style={{ fontSize: 12, color: 'var(--danger)' }}>
                    · Cancelled {format(new Date(booking.cancelledAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>

            {/* Cancel button */}
            {canCancel && (
              <Button
                variant="ghostDanger"
                size="sm"
                onClick={onCancel}
                style={{ flexShrink: 0, alignSelf: 'flex-start' }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
