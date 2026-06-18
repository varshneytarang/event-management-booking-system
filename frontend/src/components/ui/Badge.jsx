import React from 'react';

const colors = {
  upcoming:  { bg: '#e0e7ff', color: '#4338ca' },
  ongoing:   { bg: '#d1fae5', color: '#065f46' },
  completed: { bg: '#f1f5f9', color: '#475569' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  confirmed: { bg: '#d1fae5', color: '#065f46' },
  Technology:{ bg: '#ede9fe', color: '#5b21b6' },
  Design:    { bg: '#fce7f3', color: '#9d174d' },
  Business:  { bg: '#fef3c7', color: '#92400e' },
  Community: { bg: '#d1fae5', color: '#065f46' },
  General:   { bg: '#f1f5f9', color: '#475569' },
};

export default function Badge({ label, style = {} }) {
  const c = colors[label] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '.4px',
        textTransform: 'uppercase',
        background: c.bg,
        color: c.color,
        ...style,
      }}
    >
      {label}
    </span>
  );
}
