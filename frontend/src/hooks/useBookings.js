import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookingsApi, createBookingApi, cancelBookingApi } from '../api/bookings.api';
import { EVENTS_KEY } from './useEvents';
import toast from 'react-hot-toast';

const BOOKINGS_KEY = 'bookings';

export const useBookings = () =>
  useQuery({
    queryKey: [BOOKINGS_KEY],
    queryFn: () => getBookingsApi().then((r) => r.data),
    staleTime: 15_000,
  });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBookingApi,
    onSuccess: (res) => {
      toast.success(`Booking confirmed! Ref: ${res.data.data.booking.bookingReference}`);
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      qc.invalidateQueries({ queryKey: [EVENTS_KEY] }); // refresh seat count
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Booking failed');
    },
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelBookingApi,
    onSuccess: () => {
      toast.success('Booking cancelled. Seats have been released.');
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      qc.invalidateQueries({ queryKey: [EVENTS_KEY] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    },
  });
};
