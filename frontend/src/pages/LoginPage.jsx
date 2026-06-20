import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const location = useLocation();
  const from = location.state?.from || '/events';
  const { mutate: login, isPending } = useLogin();
  const [wideScreen, setWideScreen] = useState(() => window.innerWidth >= 900);

  useEffect(() => {
    const handler = () => setWideScreen(window.innerWidth >= 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = (data) => login(data, { context: { from } });

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex',
    }}>
      {/* Left panel — brand */}
      {wideScreen && (
      <div style={{
        flex: '1 1 45%', display: 'flex',
        background: 'var(--grad-brand)',
        position: 'relative', overflow: 'hidden',
        alignItems: 'center', justifyContent: 'center',
        padding: 48,
      }}
      >
        <div style={{ position: 'absolute', top: -80, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'relative', color: '#fff', maxWidth: 340 }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🎟️</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-.5px' }}>
            Discover &amp; book events you'll love
          </h2>
          <p style={{ fontSize: 16, opacity: .75, lineHeight: 1.7 }}>
            Join thousands of people booking unforgettable experiences every day.
          </p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Instant booking confirmation', 'Easy seat cancellation', 'Secure JWT authentication'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</div>
                <span style={{ fontSize: 14, opacity: .85 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Right panel — form */}
      <div style={{
        flex: '1 1 55%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px',
        background: '#fff',
      }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp .35s cubic-bezier(.16,1,.3,1) both' }}>
          <div style={{ marginBottom: 36 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
              <span style={{ fontSize: 15, fontWeight: 800, background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EventHub</span>
            </Link>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.4px', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input id="email" label="Email address" type="email"
              placeholder="you@example.com" autoComplete="email"
              error={errors.email?.message} {...register('email')} />
            <Input id="password" label="Password" type="password"
              placeholder="Enter your password" autoComplete="current-password"
              error={errors.password?.message} {...register('password')} />
            <Button type="submit" fullWidth size="lg" loading={isPending} style={{ marginTop: 8 }}>
              Sign in to EventHub
            </Button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 20, padding: '14px 16px',
            background: 'var(--primary-xlight)',
            border: '1px solid var(--primary-light)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12.5, color: 'var(--primary-dark)', lineHeight: 1.7,
          }}>
            <strong>Demo user:</strong> demo@eventbooking.com / Demo1234!<br />
            <strong>Admin:</strong> admin@eventbooking.com / Admin123!
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
