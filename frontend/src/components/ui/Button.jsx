import React from 'react';

const BASE = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontWeight: 600, letterSpacing: '.01em', cursor: 'pointer',
  border: 'none', outline: 'none',
  transition: 'all .2s cubic-bezier(.16,1,.3,1)',
  userSelect: 'none', whiteSpace: 'nowrap',
  position: 'relative', overflow: 'hidden',
};

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(99,102,241,.35)',
    border: 'none',
    '--hover-transform': 'translateY(-1px)',
    '--hover-shadow': '0 8px 20px rgba(99,102,241,.45)',
  },
  secondary: {
    background: '#fff',
    color: 'var(--text)',
    border: '1.5px solid var(--border)',
    boxShadow: 'var(--shadow-xs)',
    '--hover-transform': 'translateY(-1px)',
    '--hover-shadow': 'var(--shadow-sm)',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(220,38,38,.3)',
    border: 'none',
    '--hover-shadow': '0 8px 20px rgba(220,38,38,.4)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--primary)',
    border: '1.5px solid var(--primary)',
    boxShadow: 'none',
    '--hover-bg': 'var(--primary-xlight)',
  },
  ghostDanger: {
    background: 'transparent',
    color: 'var(--danger)',
    border: '1.5px solid #fca5a5',
    boxShadow: 'none',
    '--hover-bg': 'var(--danger-light)',
  },
  text: {
    background: 'transparent',
    color: 'var(--primary)',
    border: 'none',
    boxShadow: 'none',
    padding: '0 !important',
  },
};

const SIZES = {
  xs: { padding: '4px 10px',  fontSize: '12px', borderRadius: 'var(--radius-xs)' },
  sm: { padding: '7px 16px',  fontSize: '13px', borderRadius: 'var(--radius-sm)' },
  md: { padding: '10px 22px', fontSize: '14px', borderRadius: 'var(--radius-sm)' },
  lg: { padding: '13px 30px', fontSize: '15px', borderRadius: 'var(--radius-sm)' },
  xl: { padding: '16px 36px', fontSize: '16px', borderRadius: 'var(--radius)' },
};

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, fullWidth = false, style = {}, ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const disabled = loading || props.disabled;

  // Pull out CSS var hints (not valid inline style props)
  const { '--hover-transform': ht, '--hover-shadow': hs, '--hover-bg': hb, ...variantStyle } = v;

  const handleMouseEnter = (e) => {
    if (disabled) return;
    if (ht) e.currentTarget.style.transform = ht;
    if (hs) e.currentTarget.style.boxShadow = hs;
    if (hb) e.currentTarget.style.background = hb;
  };
  const handleMouseLeave = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = variantStyle.boxShadow || '';
    e.currentTarget.style.background = variantStyle.background || '';
  };

  return (
    <button
      disabled={disabled}
      style={{
        ...BASE,
        ...variantStyle,
        ...s,
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'translateY(0) scale(.98)'; }}
      onMouseUp={(e) => { if (!disabled) e.currentTarget.style.transform = ht || ''; }}
      {...props}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, flexShrink: 0,
          border: '2px solid currentColor', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin .65s linear infinite',
          display: 'inline-block',
        }} />
      )}
      {children}
    </button>
  );
}
