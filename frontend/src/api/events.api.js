import api from './axios';

export const getEventsApi = (params) => api.get('/events', { params });
export const getEventApi = (id) => api.get(`/events/${id}`);

// Admin
export const createEventApi = (data) => api.post('/admin/events', data);
export const updateEventApi = (id, data) => api.put(`/admin/events/${id}`, data);
export const deleteEventApi = (id) => api.delete(`/admin/events/${id}`);
