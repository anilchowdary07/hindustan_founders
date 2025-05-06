import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export type EventType = 'conference' | 'webinar' | 'workshop' | 'networking' | 'hackathon' | 'other';
export type EventFormat = 'in-person' | 'virtual' | 'hybrid';

export interface EventLocation {
  address?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  virtualLink?: string;
}

export interface EventAttendee {
  id: string;
  userId: string;
  eventId: string;
  status: 'registered' | 'attended' | 'canceled';
  registeredAt: Date;
  name: string;
  email: string;
  profilePicture?: string;
  role?: string;
  company?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: EventType;
  format: EventFormat;
  location: EventLocation;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  coverImage?: string;
  capacity?: number;
  registeredCount: number;
  price?: number;
  currency?: string;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: EventType;
  format: EventFormat;
  location: EventLocation;
  coverImage?: File;
  capacity?: number;
  price?: number;
  currency?: string;
  tags: string[];
  isPublished: boolean;
}

export function useEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all events
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/events');
        return response || [];
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
    },
  });

  // Get events created by the current user
  const {
    data: myEvents,
    isLoading: isLoadingMyEvents,
    error: myEventsError,
    refetch: refetchMyEvents,
  } = useQuery({
    queryKey: ['events', 'my'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await apiRequest('GET', '/api/events/my');
        return response || [];
      } catch (error) {
        console.error('Error fetching my events:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get events the current user is attending
  const {
    data: attendingEvents,
    isLoading: isLoadingAttendingEvents,
    error: attendingEventsError,
    refetch: refetchAttendingEvents,
  } = useQuery({
    queryKey: ['events', 'attending'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await apiRequest('GET', '/api/events/attending');
        return response || [];
      } catch (error) {
        console.error('Error fetching attending events:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get a specific event
  const getEvent = useCallback((eventId: string) => {
    return useQuery({
      queryKey: ['events', eventId],
      queryFn: async () => {
        try {
          const response = await apiRequest('GET', `/api/events/${eventId}`);
          return response;
        } catch (error) {
          console.error(`Error fetching event ${eventId}:`, error);
          return null;
        }
      },
      enabled: !!eventId,
    });
  }, []);

  // Get attendees for a specific event
  const getEventAttendees = useCallback((eventId: string) => {
    return useQuery({
      queryKey: ['events', eventId, 'attendees'],
      queryFn: async () => {
        if (!user) return [];
        try {
          const response = await apiRequest('GET', `/api/events/${eventId}/attendees`);
          return response || [];
        } catch (error) {
          console.error(`Error fetching attendees for event ${eventId}:`, error);
          return [];
        }
      },
      enabled: !!user && !!eventId,
    });
  }, [user]);

  // Check if user is registered for an event
  const isRegistered = useCallback((eventId: string) => {
    if (!attendingEvents || !Array.isArray(attendingEvents)) return false;
    return attendingEvents.some(event => event.id === eventId);
  }, [attendingEvents]);

  // Create a new event
  const createEvent = useCallback(async (eventData: EventFormData) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create events',
        variant: 'destructive',
      });
      return null;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all event data
      Object.entries(eventData).forEach(([key, value]) => {
        if (key === 'coverImage' && value instanceof File) {
          formData.append('coverImage', value);
        } else if (key === 'location' || key === 'tags') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'startDate' || key === 'endDate') {
          formData.append(key, (value as Date).toISOString());
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Make API request
      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const result = await response.json();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my'] });
      
      toast({
        title: 'Event created',
        description: 'Your event has been created successfully',
      });
      
      return result;
    } catch (error) {
      console.error('Error creating event:', error);
      
      toast({
        title: 'Event creation failed',
        description: error instanceof Error ? error.message : 'Failed to create your event. Please try again.',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast, queryClient]);

  // Update an existing event
  const updateEvent = useCallback(async (eventId: string, eventData: Partial<EventFormData>) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to update events',
        variant: 'destructive',
      });
      return null;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all event data
      Object.entries(eventData).forEach(([key, value]) => {
        if (key === 'coverImage' && value instanceof File) {
          formData.append('coverImage', value);
        } else if (key === 'location' || key === 'tags') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'startDate' || key === 'endDate') {
          formData.append(key, (value as Date).toISOString());
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Make API request
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const result = await response.json();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      
      toast({
        title: 'Event updated',
        description: 'Your event has been updated successfully',
      });
      
      return result;
    } catch (error) {
      console.error('Error updating event:', error);
      
      toast({
        title: 'Event update failed',
        description: error instanceof Error ? error.message : 'Failed to update your event. Please try again.',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast, queryClient]);

  // Delete an event
  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('DELETE', `/api/events/${eventId}`);
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my'] });
      
      toast({
        title: 'Event deleted',
        description: 'Your event has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Failed to delete your event',
        variant: 'destructive',
      });
    },
  });

  // Register for an event
  const registerForEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('POST', `/api/events/${eventId}/register`);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables] });
      queryClient.invalidateQueries({ queryKey: ['events', 'attending'] });
      
      toast({
        title: 'Registration successful',
        description: 'You have successfully registered for this event',
      });
    },
    onError: (error) => {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Failed to register for this event',
        variant: 'destructive',
      });
    },
  });

  // Cancel registration for an event
  const cancelRegistration = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('DELETE', `/api/events/${eventId}/register`);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables] });
      queryClient.invalidateQueries({ queryKey: ['events', 'attending'] });
      
      toast({
        title: 'Registration canceled',
        description: 'Your registration for this event has been canceled',
      });
    },
    onError: (error) => {
      toast({
        title: 'Cancellation failed',
        description: error instanceof Error ? error.message : 'Failed to cancel your registration',
        variant: 'destructive',
      });
    },
  });

  // Export event to calendar
  const exportToCalendar = useCallback((event: Event, format: 'google' | 'outlook' | 'ical' = 'google') => {
    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(event.description);
    const location = encodeURIComponent(
      event.format === 'virtual' 
        ? event.location.virtualLink || 'Virtual Event'
        : `${event.location.address}, ${event.location.city}, ${event.location.country}`
    );
    const startDate = new Date(event.startDate).toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(event.endDate).toISOString().replace(/-|:|\.\d+/g, '');
    
    let calendarUrl = '';
    
    switch (format) {
      case 'google':
        calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}`;
        break;
      case 'outlook':
        calendarUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&startdt=${new Date(event.startDate).toISOString()}&enddt=${new Date(event.endDate).toISOString()}&location=${location}`;
        break;
      case 'ical':
        // For iCal, we would typically generate a .ics file
        // This is a simplified version that opens the default mail client
        calendarUrl = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${startDate}%0ADTEND:${endDate}%0ASUMMARY:${title}%0ADESCRIPTION:${description}%0ALOCATION:${location}%0AEND:VEVENT%0AEND:VCALENDAR`;
        break;
    }
    
    // Open the calendar URL in a new tab
    window.open(calendarUrl, '_blank');
  }, []);

  return {
    events,
    isLoadingEvents,
    eventsError,
    refetchEvents,
    myEvents,
    isLoadingMyEvents,
    myEventsError,
    refetchMyEvents,
    attendingEvents,
    isLoadingAttendingEvents,
    attendingEventsError,
    refetchAttendingEvents,
    getEvent,
    getEventAttendees,
    isRegistered,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    exportToCalendar,
    isSubmitting,
  };
}