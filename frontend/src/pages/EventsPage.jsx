import React, { useState, useEffect, useCallback } from 'react';
import { getEvents } from '../api/events';
import EventCard from '../components/EventCard';
import Spinner from '../components/ui/Spinner';

const CATEGORIES = ['All', 'Technology', 'Design', 'Business', 'Community', 'General'];
const STATUSES = ['All', 'upcoming', 'ongoing', 'completed', 'cancelled'];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: 'All', status: 'All', page: 1 });
  const [searchInput, setSearchInput] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 9 };
      if (filters.search) params.search = filters.search;
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.status !== 'All') params.status = filters.status;

      const { data } = await getEvents(params);
      setEvents(data.data.events);
      setPagination(data.data.pagination);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const chipStyle = (active) => ({
    padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
    border: '1.5px solid',
    borderColor: active ? 'var(--primary)' : 'var(--border)',
    background: active ? 'var(--primary-light)' : '#fff',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    cursor: 'pointer', transition: 'all .15s',
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Discover Events</h1>
        <p style={{ color: 'var(--text-muted)' }}>Find and book your next experience</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="search"
            placeholder="Search events by name, venue..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%', padding: '11px 16px 11px 44px',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
              fontSize: 14, outline: 'none', background: '#fff',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
          />
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>CATEGORY</span>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setFilter('category', c)} style={chipStyle(filters.category === c)}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>STATUS</span>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter('status', s)} style={chipStyle(filters.status === s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔎</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No events found</h3>
          <p style={{ fontSize: 14 }}>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Showing {events.length} of {pagination?.total} events
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={filters.page <= 1}
                style={{
                  ...chipStyle(false),
                  opacity: filters.page <= 1 ? 0.4 : 1,
                  cursor: filters.page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  style={chipStyle(filters.page === p)}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={filters.page >= pagination.totalPages}
                style={{
                  ...chipStyle(false),
                  opacity: filters.page >= pagination.totalPages ? 0.4 : 1,
                  cursor: filters.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
