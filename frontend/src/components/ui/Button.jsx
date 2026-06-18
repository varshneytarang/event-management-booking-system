import React from 'react';

const variants = {
  primary: { background: 'var(--primary)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--bg-muted)', color: 'var(--text)', border: '1px solid var(--border)' },
  danger: { background: 'var(--danger)', color: '#fff', border: 'none' },
  ghost: { background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  style = {},
  ...props
}) {
  const pad = size === 'sm' ? '7px 14px' : size === 'lg' ? '14px 28px' : '10px 20px';
  const fontSize = size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px';

  return (
    <button
      disabled={loading || props.disabled}
      style={{
        ...variants[variant],
        padding: pad,
        fontSize,
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        width: fullWidth ? '100%' : undefined,
        cursor: loading || props.disabled ? 'not-allowed':'allowed',
        opacity: loading || props.disabled ? 0.7 : 1,
        transition: 'opacity .15s, transform .1s, box-shadow .15s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...style,
      }}
      onMouseEnter={(e) => { if (!loading && !props.disabled) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={(e) => { if (!loading && !props.disabled) e.currentTarget.style.opacity = '1'; }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: 14, height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin .7s linear infinite',
          }}
        />
      )}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
