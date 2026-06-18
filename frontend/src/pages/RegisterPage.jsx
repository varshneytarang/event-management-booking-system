import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/\d/.test(form.password)) e.password = 'Password must contain at least one number';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
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
      const { data } = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      loginUser(data.data.user, data.data.token);
      toast.success('Account created! Welcome to EventHub.');
      navigate('/events');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
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
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Create an account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Join EventHub and start booking events
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input
            id="name" label="Full name" type="text"
            name="name" value={form.name}
            onChange={handleChange} error={errors.name}
            placeholder="Jane Doe" autoComplete="name"
          />
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
            placeholder="At least 6 chars with a number"
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword" label="Confirm password" type="password"
            name="confirmPassword" value={form.confirmPassword}
            onChange={handleChange} error={errors.confirmPassword}
            placeholder="••••••••" autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 4 }}>
            Create Account
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
