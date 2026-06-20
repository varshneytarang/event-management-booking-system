import React from 'react';

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div style={{
      textAlign: 'center', padding: '72px 24px',
      background: '#fff', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--danger-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', fontSize: 24,
      }}>
        ⚠️
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Oops! Something went wrong</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: onRetry ? 24 : 0, maxWidth: 320, margin: '0 auto' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          marginTop: 20, padding: '9px 22px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', border: 'none',
          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 12px rgba(99,102,241,.3)',
          transition: 'opacity .15s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
