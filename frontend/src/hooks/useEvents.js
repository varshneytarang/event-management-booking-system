import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getEventsApi, getEventApi } from '../api/events.api';

export const EVENTS_KEY = 'events';

export const useEvents = (params) =>
  useQuery({
    queryKey: [EVENTS_KEY, params],
    queryFn: () => getEventsApi(params).then((r) => r.data),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useEvent = (id) =>
  useQuery({
    queryKey: [EVENTS_KEY, id],
    queryFn: () => getEventApi(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 30_000,
  });
