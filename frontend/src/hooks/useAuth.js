import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerApi, loginApi, logoutApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useRegister = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/events', { replace: true });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    },
  });
};

export const useLogin = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res, _, ctx) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ctx?.from || '/events', { replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearAuth();
      qc.clear();
      toast.success('Logged out');
      navigate('/login', { replace: true });
    },
  });
};
