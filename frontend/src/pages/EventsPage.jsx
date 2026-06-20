import React, { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/EventCard';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const CATEGORIES = ['All', 'Technology', 'Design', 'Business', 'Community', 'Music', 'Sports', 'General'];
const STATUSES   = ['All', 'upcoming', 'ongoing', 'completed', 'cancelled'];

export default function EventsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 9, category: '', status: 'upcoming', search: '', sortBy: 'dateTime', order: 'asc' });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), 380);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== 'All'));
  const { data, isLoading, isError, refetch } = useEvents(params);

  const events = data?.data?.events || [];
  const meta   = data?.meta || {};

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  const chip = (active) => ({
    padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 500,
    border: '1.5px solid', cursor: 'pointer',
    transition: 'all .18s cubic-bezier(.16,1,.3,1)',
    borderColor: active ? 'var(--primary)' : 'var(--border)',
    background: active ? 'var(--primary)' : '#fff',
    color: active ? '#fff' : 'var(--text-muted)',
    boxShadow: active ? '0 2px 8px rgba(99,102,241,.25)' : 'none',
  });

  return (
    <div>
      {/* Page header */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-muted) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 28px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Events</p>
          <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, letterSpacing: '-.4px', marginBottom: 8 }}>Discover Events</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Find and book your next unforgettable experience</p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 520 }}>
            <div style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-light)', pointerEvents: 'none', fontSize: 16,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, venue, or description…"
              style={{
                width: '100%', padding: '12px 18px 12px 46px',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                fontSize: 14, outline: 'none', background: '#fff',
                boxShadow: 'var(--shadow-xs)',
                transition: 'border-color .15s, box-shadow .15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'var(--shadow-xs)'; }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 28px 64px' }}>
        {/* Filters */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '18px 20px',
          marginBottom: 28, boxShadow: 'var(--shadow-xs)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.8px', marginRight: 4, minWidth: 64 }}>Category</span>
            {CATEGORIES.map((c) => (
              <button key={c} style={chip(filters.category === c || (c === 'All' && !filters.category))}
                onClick={() => setFilter('category', c === 'All' ? '' : c)}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.8px', marginRight: 4, minWidth: 64 }}>Status</span>
            {STATUSES.map((s) => (
              <button key={s} style={chip(filters.status === s || (s === 'All' && !filters.status))}
                onClick={() => setFilter('status', s === 'All' ? '' : s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? <Spinner /> :
         isError   ? <ErrorMessage message="Failed to load events" onRetry={refetch} /> :
         events.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#fff', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>🔎</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No events found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Try adjusting your filters or search term</p>
          </div>
         ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{meta.total}</strong> event{meta.total !== 1 ? 's' : ''} found
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 24 }}>
              {events.map((e, i) => <EventCard key={e._id} event={e} index={i} />)}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 52 }}>
                <button onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} disabled={!meta.hasPrevPage}
                  style={{ ...chip(false), opacity: meta.hasPrevPage ? 1 : 0.35, cursor: meta.hasPrevPage ? 'pointer' : 'not-allowed', padding: '7px 16px' }}>
                  ← Prev
                </button>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setFilters((f) => ({ ...f, page: p }))} style={{ ...chip(filters.page === p), minWidth: 36, padding: '7px 10px' }}>{p}</button>
                  ))}
                </div>
                <button onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} disabled={!meta.hasNextPage}
                  style={{ ...chip(false), opacity: meta.hasNextPage ? 1 : 0.35, cursor: meta.hasNextPage ? 'pointer' : 'not-allowed', padding: '7px 16px' }}>
                  Next →
                </button>
              </div>
            )}
          </>
         )}
      </div>
    </div>
  );
}
