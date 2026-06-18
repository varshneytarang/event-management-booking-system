import React from 'react';

export default function Spinner({ size = 40, color = 'var(--primary)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid var(--border)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
