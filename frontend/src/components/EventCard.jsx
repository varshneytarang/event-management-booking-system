import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Badge from './ui/Badge';

export default function EventCard({ event }) {
  const availPct = event.totalSeats > 0
    ? (event.availableSeats / event.totalSeats) * 100
    : 0;

  const seatColor =
    availPct === 0 ? 'var(--danger)' :
    availPct < 20  ? 'var(--warning)' :
    'var(--success)';

  return (
    <Link
      to={`/events/${event.id}`}
      style={{ textDecoration: 'none' }}
      aria-label={`View details for ${event.name}`}
    >
      <article
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          transition: 'transform .18s, box-shadow .18s',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', paddingBottom: '52%', background: 'var(--bg-muted)' }}>
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--primary-light), #e0f2fe)',
              fontSize: 40,
            }}>
              🎉
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <Badge label={event.status} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge label={event.category || 'General'} />
          </div>

          <h3 style={{
            fontSize: 16, fontWeight: 700, color: 'var(--text)',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.name}
          </h3>

          <p style={{
            fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.description}
          </p>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              <span>📅</span>
              <span>{format(new Date(event.dateTime), 'MMM d, yyyy · h:mm a')}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              <span>📍</span>
              <span>{event.venue}</span>
            </div>

            {/* Seat bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Seats available</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: seatColor }}>
                  {event.availableSeats} / {event.totalSeats}
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${availPct}%`,
                  background: seatColor,
                  borderRadius: 99,
                  transition: 'width .3s',
                }} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
