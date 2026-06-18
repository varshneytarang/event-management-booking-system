import api from './axios';

export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings');
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);
