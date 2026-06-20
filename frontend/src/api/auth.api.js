import api from './axios';

export const registerApi = (data) => api.post('/auth/register', data);
export const loginApi = (data) => api.post('/auth/login', data);
export const logoutApi = () => api.post('/auth/logout');
export const refreshTokenApi = () => api.post('/auth/refresh-token');
export const getMeApi = () => api.get('/auth/me');
