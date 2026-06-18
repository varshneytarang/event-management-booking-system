import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const from = location.state?.from?.pathname || '/events';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.data.user, data.data.token);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const fieldErrs = {};
        err.response.data.errors.forEach(({ field, message }) => { fieldErrs[field] = message; });
        setErrors(fieldErrs);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)', padding: '40px 36px',
        width: '100%', maxWidth: 420,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎟️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Log in to your EventHub account
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input
            id="email" label="Email address" type="email"
            name="email" value={form.email}
            onChange={handleChange} error={errors.email}
            placeholder="you@example.com" autoComplete="email"
          />
          <Input
            id="password" label="Password" type="password"
            name="password" value={form.password}
            onChange={handleChange} error={errors.password}
            placeholder="••••••••" autoComplete="current-password"
          />

          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 4 }}>
            Sign In
          </Button>
        </form>

        {/* Demo credentials */}
        <div style={{
          marginTop: 20, padding: '12px 16px',
          background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)',
          fontSize: 12, color: 'var(--primary-dark)',
        }}>
          <strong>Demo:</strong> demo@events.com / Demo1234<br />
          <strong>Admin:</strong> admin@events.com / Admin123
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
