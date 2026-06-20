import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Badge from './ui/Badge';

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
];

const ICONS = { Technology: '💻', Design: '🎨', Business: '📈', Community: '🤝', Music: '🎵', Sports: '⚽', General: '🎉' };

export default function EventCard({ event, index = 0 }) {
  const pct = event.totalSeats > 0 ? (event.availableSeats / event.totalSeats) * 100 : 0;
  const barColor = pct === 0 ? '#ef4444' : pct < 20 ? '#f59e0b' : '#10b981';
  const grad = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
  const icon = ICONS[event.category] || '🎉';

  return (
    <Link to={`/events/${event._id}`} aria-label={`View ${event.name}`} style={{ display: 'flex', height: '100%' }}>
      <article style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        height: '100%', width: '100%',
        display: 'flex', flexDirection: 'column',
        transition: 'transform .22s cubic-bezier(.16,1,.3,1), box-shadow .22s ease',
        cursor: 'pointer',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.12), 0 4px 12px rgba(99,102,241,.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}>

        {/* Image / placeholder */}
        <div style={{ position: 'relative', paddingBottom: '54%', flexShrink: 0 }}>
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
              {icon}
            </div>
          )}
          {/* Status chip */}
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <Badge label={event.status} showDot />
          </div>
          {/* Sold-out overlay */}
          {pct === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(0,0,0,.5)', padding: '6px 14px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>Sold Out</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <Badge label={event.category || 'General'} />

          <h3 style={{
            fontSize: 15, fontWeight: 700, lineHeight: 1.4,
            color: 'var(--text)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.name}
          </h3>

          <p style={{
            fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.description}
          </p>

          {/* Meta */}
          <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--bg-muted)', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ fontSize: 14 }}>📅</span>
              <span>{format(new Date(event.dateTime), 'MMM d, yyyy · h:mm a')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ fontSize: 14 }}>📍</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.venue}</span>
            </div>

            {/* Seat bar */}
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.4px' }}>Availability</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{event.availableSeats} left</span>
              </div>
              <div style={{ height: 5, background: 'var(--bg-muted)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${pct}%`,
                  background: pct > 50
                    ? `linear-gradient(90deg, #10b981, #34d399)`
                    : pct > 20
                    ? `linear-gradient(90deg, #f59e0b, #fbbf24)`
                    : `linear-gradient(90deg, #ef4444, #f87171)`,
                  transition: 'width .4s ease',
                }} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
