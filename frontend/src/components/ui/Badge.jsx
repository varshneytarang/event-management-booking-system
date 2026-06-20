import React from 'react';

const MAP = {
  upcoming:    { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  ongoing:     { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  completed:   { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' },
  cancelled:   { bg: '#fff1f2', color: '#be123c', dot: '#f43f5e' },
  confirmed:   { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  Technology:  { bg: '#faf5ff', color: '#6d28d9', dot: '#8b5cf6' },
  Design:      { bg: '#fdf2f8', color: '#9d174d', dot: '#ec4899' },
  Business:    { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  Community:   { bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
  Music:       { bg: '#fdf2f8', color: '#9d174d', dot: '#ec4899' },
  Sports:      { bg: '#eff6ff', color: '#1e40af', dot: '#60a5fa' },
  General:     { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' },
  admin:       { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  user:        { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
};

export default function Badge({ label, showDot = false, style = {} }) {
  const c = MAP[label] || { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      letterSpacing: '.4px', textTransform: 'uppercase',
      background: c.bg, color: c.color,
      border: `1px solid ${c.bg === '#f8fafc' ? 'var(--border)' : 'transparent'}`,
      ...style,
    }}>
      {showDot && (
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      )}
      {label}
    </span>
  );
}
