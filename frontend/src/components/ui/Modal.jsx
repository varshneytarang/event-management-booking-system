import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 480 }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div role="dialog" aria-modal="true" aria-label={title}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>

      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,42,.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn .2s ease',
      }} />

      {/* Panel */}
      <div style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%', maxWidth,
        animation: 'scaleIn .25s cubic-bezier(.16,1,.3,1)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        {(title || subtitle) && (
          <div style={{
            padding: '24px 28px 0',
            borderBottom: subtitle ? 'none' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                {title && <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{title}</h2>}
                {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>}
              </div>
              <button onClick={onClose} aria-label="Close modal" style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--bg-muted)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)',
                flexShrink: 0, transition: 'background .15s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-muted)'; }}
              >×</button>
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: title || subtitle ? '20px 28px 28px' : '28px' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
