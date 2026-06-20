import React, { useState } from 'react';

export default function Input({ label, error, id, hint, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: 13, fontWeight: 600,
          color: focused ? 'var(--primary)' : 'var(--text-muted)',
          transition: 'color .15s',
          letterSpacing: '.01em',
        }}>
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          padding: '11px 16px',
          border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: 14, outline: 'none',
          background: '#fff',
          color: 'var(--text)',
          boxShadow: focused
            ? error ? '0 0 0 3px rgba(220,38,38,.12)' : '0 0 0 3px rgba(99,102,241,.12)'
            : 'var(--shadow-xs)',
          transition: 'border-color .15s, box-shadow .15s',
          width: '100%',
        }}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {error}
        </span>
      )}
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{hint}</span>}
    </div>
  );
}
