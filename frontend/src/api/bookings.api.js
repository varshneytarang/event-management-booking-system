import api from './axios';

export const createBookingApi = (data) => api.post('/bookings', data);
export const getBookingsApi = () => api.get('/bookings');
export const cancelBookingApi = (id) => api.delete(`/bookings/${id}`);
