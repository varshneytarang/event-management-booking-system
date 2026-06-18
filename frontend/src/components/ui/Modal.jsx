import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,.45)',
          backdropFilter: 'blur(4px)',
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth,
          padding: 32,
          animation: 'modalIn .2s ease',
        }}
      >
        {title && (
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{title}</h2>
        )}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none',
            fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ×
        </button>
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-12px) scale(.97); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>,
    document.body
  );
}
