import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/\d/, 'Needs a number')
    .regex(/[^A-Za-z0-9]/, 'Needs a special character'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

export default function RegisterPage() {
  const { mutate: registerUser, isPending } = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = ({ name, email, password }) => registerUser({ name, email, password });
  const [wideScreen, setWideScreen] = useState(() => window.innerWidth >= 900);

  useEffect(() => {
    const handler = () => setWideScreen(window.innerWidth >= 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex' }}>
      {/* Left panel */}
      {wideScreen && (
      <div style={{
        flex: '1 1 42%',
        background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48,
      }}
      >
        <div style={{ position: 'absolute', top: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(139,92,246,.2)' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -40, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,.15)' }} />
        <div style={{ position: 'relative', color: '#fff', maxWidth: 320 }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🎉</div>
          <h2 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.25, marginBottom: 16, letterSpacing: '-.4px' }}>
            Start booking the events you love
          </h2>
          <p style={{ fontSize: 15, opacity: .7, lineHeight: 1.7 }}>
            Create your free account in seconds and unlock access to hundreds of events.
          </p>
          <div style={{
            marginTop: 36, padding: '20px 24px',
            background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,.12)',
          }}>
            <p style={{ fontSize: 13, opacity: .7, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>What you get</p>
            {['Browse all upcoming events', 'Book up to 10 seats per event', 'Manage & cancel bookings', 'Instant booking references'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#a5f3fc' }}>✦</span>
                <span style={{ fontSize: 13, opacity: .85 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Right panel — form */}
      <div style={{ flex: '1 1 58%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp .35s cubic-bezier(.16,1,.3,1) both' }}>
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, textDecoration: 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎟️</div>
              <span style={{ fontSize: 15, fontWeight: 800, background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EventHub</span>
            </Link>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.4px', marginBottom: 8 }}>Create your account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input id="name" label="Full name" type="text" placeholder="Jane Doe"
              autoComplete="name" error={errors.name?.message} {...register('name')} />
            <Input id="email" label="Email address" type="email" placeholder="you@example.com"
              autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Input id="password" label="Password" type="password"
              placeholder="Min 8 chars · upper · lower · number · symbol"
              hint="At least 8 characters with uppercase, lowercase, number, and symbol"
              autoComplete="new-password" error={errors.password?.message} {...register('password')} />
            <Input id="confirmPassword" label="Confirm password" type="password" placeholder="Repeat your password"
              autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <Button type="submit" fullWidth size="lg" loading={isPending} style={{ marginTop: 8 }}>
              Create my account
            </Button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--text-light)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Terms</span> and{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
