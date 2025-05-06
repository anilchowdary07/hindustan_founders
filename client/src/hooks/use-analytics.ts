import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export type TimeRange = '7days' | '30days' | '90days' | 'year' | 'all';

export interface AnalyticsData {
  profileViews: {
    total: number;
    change: number;
    data: Array<{ name: string; views: number }>;
  };
  connections: {
    total: number;
    change: number;
    data: Array<{ name: string; connections: number }>;
    breakdown: Array<{ name: string; value: number }>;
  };
  engagement: {
    rate: number;
    change: number;
    data: Array<{ name: string; rate: number }>;
    breakdown: Array<{ name: string; count: number }>;
  };
  content: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    data: Array<{ name: string; views: number; likes: number; comments: number }>;
  };
  events: {
    attended: number;
    upcoming: number;
    data: Array<{ name: string; count: number }>;
  };
}

export function useAnalytics(timeRange: TimeRange = '30days') {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch analytics data
  const { data, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/analytics?timeRange=${timeRange}`);
        return response;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Return mock data if API fails
        return getMockAnalyticsData(timeRange);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Export analytics data
  const exportAnalytics = async (format: 'csv' | 'pdf' = 'csv') => {
    setIsExporting(true);
    try {
      const response = await apiRequest('GET', `/api/analytics/export?timeRange=${timeRange}&format=${format}`, null, {
        responseType: 'blob',
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    exportAnalytics,
    isExporting,
  };
}

// Mock data function for fallback
function getMockAnalyticsData(timeRange: TimeRange): AnalyticsData {
  // Different data based on time range
  const multiplier = timeRange === '7days' ? 1 : 
                    timeRange === '30days' ? 4 : 
                    timeRange === '90days' ? 12 : 
                    timeRange === 'year' ? 52 : 60;
  
  return {
    profileViews: {
      total: 1248 * (multiplier / 4),
      change: 12.5,
      data: [
        { name: "Jan", views: 65 * multiplier / 4 },
        { name: "Feb", views: 59 * multiplier / 4 },
        { name: "Mar", views: 80 * multiplier / 4 },
        { name: "Apr", views: 81 * multiplier / 4 },
        { name: "May", views: 56 * multiplier / 4 },
        { name: "Jun", views: 55 * multiplier / 4 },
        { name: "Jul", views: 40 * multiplier / 4 },
        { name: "Aug", views: 70 * multiplier / 4 },
        { name: "Sep", views: 90 * multiplier / 4 },
        { name: "Oct", views: 110 * multiplier / 4 },
        { name: "Nov", views: 130 * multiplier / 4 },
        { name: "Dec", views: 150 * multiplier / 4 },
      ],
    },
    connections: {
      total: 32 * multiplier / 4,
      change: 8.2,
      data: [
        { name: "Week 1", connections: 5 * multiplier / 4 },
        { name: "Week 2", connections: 8 * multiplier / 4 },
        { name: "Week 3", connections: 7 * multiplier / 4 },
        { name: "Week 4", connections: 12 * multiplier / 4 },
      ],
      breakdown: [
        { name: "Founders", value: 45 },
        { name: "Investors", value: 20 },
        { name: "Mentors", value: 15 },
        { name: "Job Seekers", value: 10 },
        { name: "Others", value: 10 },
      ],
    },
    engagement: {
      rate: 18.7,
      change: -2.3,
      data: [
        { name: "Week 1", rate: 22 },
        { name: "Week 2", rate: 21 },
        { name: "Week 3", rate: 19 },
        { name: "Week 4", rate: 18.7 },
      ],
      breakdown: [
        { name: "Posts", count: 24 * multiplier / 4 },
        { name: "Comments", count: 67 * multiplier / 4 },
        { name: "Likes", count: 145 * multiplier / 4 },
        { name: "Shares", count: 12 * multiplier / 4 },
        { name: "Messages", count: 89 * multiplier / 4 },
      ],
    },
    content: {
      views: 3240 * multiplier / 4,
      likes: 567 * multiplier / 4,
      comments: 128 * multiplier / 4,
      shares: 45 * multiplier / 4,
      data: [
        { name: "Post 1", views: 340, likes: 45, comments: 12 },
        { name: "Post 2", views: 290, likes: 32, comments: 8 },
        { name: "Post 3", views: 580, likes: 78, comments: 24 },
        { name: "Post 4", views: 430, likes: 56, comments: 18 },
        { name: "Post 5", views: 670, likes: 89, comments: 32 },
      ],
    },
    events: {
      attended: 8 * multiplier / 4,
      upcoming: 3,
      data: [
        { name: "Networking", count: 4 * multiplier / 4 },
        { name: "Workshops", count: 2 * multiplier / 4 },
        { name: "Conferences", count: 1 * multiplier / 4 },
        { name: "Webinars", count: 3 * multiplier / 4 },
        { name: "Meetups", count: 1 * multiplier / 4 },
      ],
    },
  };
}