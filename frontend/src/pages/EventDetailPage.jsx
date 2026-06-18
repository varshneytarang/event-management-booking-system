import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getEvent } from '../api/events';
import { createBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getEvent(id);
        setEvent(data.data.event);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    setBooking(true);
    try {
      const { data } = await createBooking({ eventId: event.id, seatsBooked: seats });
      toast.success(`Booking confirmed! Ref: ${data.data.booking.bookingReference}`);
      // Refresh seat count
      const refreshed = await getEvent(id);
      setEvent(refreshed.data.data.event);
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <Spinner />;
  if (!event) return null;

  const availPct = event.totalSeats > 0 ? (event.availableSeats / event.totalSeats) * 100 : 0;
  const isSoldOut = event.availableSeats === 0;
  const canBook = event.status === 'upcoming' || event.status === 'ongoing';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none', fontSize: 14,
          color: 'var(--text-muted)', cursor: 'pointer',
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Back to Events
      </button>

      <div style={{
        background: '#fff', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)', overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        {/* Hero image */}
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            style={{ width: '100%', height: 340, objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--primary-light), #e0f2fe)',
            fontSize: 64,
          }}>
            🎉
          </div>
        )}

        <div style={{ padding: '36px 40px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Badge label={event.status} />
            <Badge label={event.category || 'General'} />
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20, lineHeight: 1.3 }}>
            {event.name}
          </h1>

          {/* Meta grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16, marginBottom: 28,
          }}>
            {[
              { icon: '📅', label: 'Date & Time', value: format(new Date(event.dateTime), 'MMMM d, yyyy · h:mm a') },
              { icon: '📍', label: 'Venue', value: event.venue },
              { icon: '🎫', label: 'Total Seats', value: event.totalSeats.toLocaleString() },
              { icon: '✅', label: 'Available', value: event.availableSeats.toLocaleString(), color: isSoldOut ? 'var(--danger)' : 'var(--success)' },
            ].map((item) => (
              <div key={item.label} style={{
                padding: '16px', background: 'var(--bg-muted)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '.4px', marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: item.color || 'var(--text)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Seat progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Seat availability</span>
              <span style={{ fontWeight: 700 }}>{Math.round(availPct)}% available</span>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${availPct}%`, borderRadius: 99,
                background: availPct < 20 ? 'var(--danger)' : availPct < 50 ? 'var(--warning)' : 'var(--success)',
                transition: 'width .4s',
              }} />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>About this event</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {event.description}
            </p>
          </div>

          {/* CTA */}
          {canBook && !isSoldOut ? (
            <Button size="lg" onClick={() => { if (!user) { navigate('/login'); } else { setModalOpen(true); } }}>
              🎟️ Book Seats
            </Button>
          ) : isSoldOut ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', background: 'var(--danger-light)',
              borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontWeight: 700,
            }}>
              😔 Sold Out
            </div>
          ) : (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', background: 'var(--bg-muted)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontWeight: 600,
            }}>
              Bookings not available
            </div>
          )}
        </div>
      </div>

      {/* Booking modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Book Seats">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: 16, background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{event.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {format(new Date(event.dateTime), 'MMM d, yyyy · h:mm a')} · {event.venue}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              Number of seats (max 10)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setSeats((s) => Math.max(1, s - 1))}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid var(--border)', background: '#fff',
                  fontSize: 18, cursor: 'pointer', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <span style={{ fontSize: 24, fontWeight: 800, minWidth: 32, textAlign: 'center' }}>
                {seats}
              </span>
              <button
                onClick={() => setSeats((s) => Math.min(Math.min(10, event.availableSeats), s + 1))}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid var(--border)', background: '#fff',
                  fontSize: 18, cursor: 'pointer', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {event.availableSeats} seat(s) remaining
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button onClick={handleBook} loading={booking} style={{ flex: 2 }}>
              Confirm {seats} seat{seats > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
