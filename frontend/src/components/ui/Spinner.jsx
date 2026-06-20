import React from 'react';

export default function Spinner({ size = 36, fullPage = false }) {
  const el = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 16 }}>
      <div style={{
        width: size, height: size,
        borderRadius: '50%',
        border: '3px solid var(--primary-light)',
        borderTopColor: 'var(--primary)',
        animation: 'spin .75s cubic-bezier(.6,.2,.4,.8) infinite',
      }} />
      <span style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 500 }}>Loading…</span>
    </div>
  );
  if (!fullPage) return el;
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {el}
    </div>
  );
}
