import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from '../api/bookings';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [filter, setFilter] = useState('all'); // all | confirmed | cancelled

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMyBookings();
      setBookings(data.data.bookings);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id);
      toast.success('Booking cancelled. Seats have been released.');
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = bookings.filter((b) => filter === 'all' || b.status === filter);
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

  const chipStyle = (active) => ({
    padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
    border: '1.5px solid',
    borderColor: active ? 'var(--primary)' : 'var(--border)',
    background: active ? 'var(--primary-light)' : '#fff',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    cursor: 'pointer',
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>My Bookings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage all your event bookings in one place</p>
      </div>

      {/* Stats */}
      {!loading && bookings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, marginBottom: 28,
        }}>
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'var(--primary)' },
            { label: 'Confirmed', value: confirmed, color: 'var(--success)' },
            { label: 'Cancelled', value: cancelled, color: 'var(--danger)' },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px 24px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'confirmed', 'cancelled'].map((f) => (
          <button key={f} style={chipStyle(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          background: '#fff', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎟️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            {filter === 'all' ? 'Start exploring events and make your first booking!' : ''}
          </p>
          {filter === 'all' && (
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={() => setCancelTarget(booking)}
            />
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking"
        maxWidth={420}
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.6 }}>
          Are you sure you want to cancel your booking for{' '}
          <strong style={{ color: 'var(--text)' }}>{cancelTarget?.event?.name}</strong>?
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          {cancelTarget?.seatsBooked} seat(s) will be released back to the event. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" onClick={() => setCancelTarget(null)} style={{ flex: 1 }}>
            Keep Booking
          </Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelling} style={{ flex: 1 }}>
            Yes, Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function BookingCard({ booking, onCancel }) {
  const event = booking.event;
  const isConfirmed = booking.status === 'confirmed';
  const isPast = event && new Date(event.dateTime) < new Date();

  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      opacity: booking.status === 'cancelled' ? 0.75 : 1,
    }}>
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Color bar */}
        <div style={{
          width: 5, flexShrink: 0,
          background: isConfirmed ? 'var(--success)' : 'var(--danger)',
        }} />

        <div style={{ padding: '20px 24px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge label={booking.status} />
                {event && <Badge label={event.category || 'General'} />}
              </div>

              <Link to={`/events/${event?.id}`} style={{ textDecoration: 'none' }}>
                <h3 style={{
                  fontSize: 16, fontWeight: 700, marginBottom: 8,
                  color: 'var(--text)',
                  ':hover': { color: 'var(--primary)' },
                }}>
                  {event?.name || 'Unknown Event'}
                </h3>
              </Link>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', fontSize: 13, color: 'var(--text-muted)' }}>
                {event && (
                  <span>📅 {format(new Date(event.dateTime), 'MMM d, yyyy · h:mm a')}</span>
                )}
                {event && <span>📍 {event.venue}</span>}
                <span>🎫 {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--bg-muted)', padding: '1px 8px', borderRadius: 4 }}>
                  {booking.bookingReference}
                </span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 8 }}>
                Booked {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                {booking.cancelledAt && ` · Cancelled ${format(new Date(booking.cancelledAt), 'MMM d, yyyy')}`}
              </div>
            </div>

            {/* Actions */}
            {isConfirmed && !isPast && event?.status !== 'cancelled' && (
              <Button variant="ghost" size="sm" onClick={onCancel}
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)', flexShrink: 0 }}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
