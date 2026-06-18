import React from 'react';

export default function Input({ label, error, id, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          padding: '10px 14px',
          border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: 14,
          outline: 'none',
          background: '#fff',
          color: 'var(--text)',
          transition: 'border-color .15s, box-shadow .15s',
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? 'var(--danger)' : 'var(--primary)';
          e.target.style.boxShadow = `0 0 0 3px ${error ? '#fee2e2' : 'var(--primary-light)'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}
