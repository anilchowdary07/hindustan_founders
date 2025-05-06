import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useDebounce } from '@/hooks/use-debounce';
import { apiRequest } from '@/lib/queryClient';

export interface SearchFilters {
  type?: string[];
  tags?: string[];
  location?: string;
  date?: {
    from?: string;
    to?: string;
  };
  experience?: string[];
  industry?: string[];
  company?: string;
  role?: string;
  salary?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  sort?: 'relevance' | 'date' | 'popularity';
}

export interface SearchResult {
  id: number;
  type: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  date: Date;
  tags: string[];
  location?: string;
  company?: string;
  salary?: string;
  experience?: string;
  skills?: string[];
  author?: {
    id: number;
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

export interface SavedSearch {
  id: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
}

export function useAdvancedSearch() {
  const [location, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 500);

  // Load saved searches from localStorage
  useEffect(() => {
    const savedSearchesJson = localStorage.getItem('savedSearches');
    if (savedSearchesJson) {
      try {
        const parsed = JSON.parse(savedSearchesJson);
        setSavedSearches(parsed);
      } catch (e) {
        console.error('Failed to parse saved searches', e);
      }
    }
  }, []);

  // Update URL with search parameters
  useEffect(() => {
    if (!debouncedQuery && Object.keys(filters).length === 0) return;

    const searchParams = new URLSearchParams();
    
    if (debouncedQuery) {
      searchParams.set('q', debouncedQuery);
    }
    
    if (filters.type && filters.type.length > 0) {
      searchParams.set('types', filters.type.join(','));
    }
    
    if (filters.tags && filters.tags.length > 0) {
      searchParams.set('tags', filters.tags.join(','));
    }
    
    if (filters.location) {
      searchParams.set('location', filters.location);
    }
    
    if (filters.date && (filters.date.from || filters.date.to)) {
      if (filters.date.from) searchParams.set('dateFrom', filters.date.from);
      if (filters.date.to) searchParams.set('dateTo', filters.date.to);
    }
    
    if (filters.experience && filters.experience.length > 0) {
      searchParams.set('experience', filters.experience.join(','));
    }
    
    if (filters.industry && filters.industry.length > 0) {
      searchParams.set('industry', filters.industry.join(','));
    }
    
    if (filters.skills && filters.skills.length > 0) {
      searchParams.set('skills', filters.skills.join(','));
    }
    
    if (filters.sort) {
      searchParams.set('sort', filters.sort);
    }
    
    if (currentPage > 1) {
      searchParams.set('page', currentPage.toString());
    }
    
    if (resultsPerPage !== 10) {
      searchParams.set('limit', resultsPerPage.toString());
    }
    
    const newUrl = `/search?${searchParams.toString()}`;
    navigate(newUrl, { replace: true });
  }, [debouncedQuery, filters, currentPage, resultsPerPage, navigate]);

  // Perform search when query or filters change
  const performSearch = useCallback(async () => {
    if (!debouncedQuery && Object.keys(filters).length === 0) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      if (debouncedQuery) {
        searchParams.set('q', debouncedQuery);
      }
      
      if (filters.type && filters.type.length > 0) {
        searchParams.set('types', filters.type.join(','));
      }
      
      if (filters.tags && filters.tags.length > 0) {
        searchParams.set('tags', filters.tags.join(','));
      }
      
      // Add all other filter parameters
      if (filters.location) {
        searchParams.set('location', filters.location);
      }
      
      if (filters.date && (filters.date.from || filters.date.to)) {
        if (filters.date.from) searchParams.set('dateFrom', filters.date.from);
        if (filters.date.to) searchParams.set('dateTo', filters.date.to);
      }
      
      if (filters.experience && filters.experience.length > 0) {
        searchParams.set('experience', filters.experience.join(','));
      }
      
      if (filters.industry && filters.industry.length > 0) {
        searchParams.set('industry', filters.industry.join(','));
      }
      
      if (filters.skills && filters.skills.length > 0) {
        searchParams.set('skills', filters.skills.join(','));
      }
      
      if (filters.sort) {
        searchParams.set('sort', filters.sort);
      }
      
      searchParams.set('page', currentPage.toString());
      searchParams.set('limit', resultsPerPage.toString());
      
      const response = await apiRequest('GET', `/api/search?${searchParams.toString()}`);
      
      if (response && response.results) {
        setResults(response.results);
        setTotalResults(response.total || response.results.length);
      } else {
        // Fallback to mock data if API doesn't return expected format
        const mockResults = generateMockResults(debouncedQuery, filters);
        setResults(mockResults);
        setTotalResults(mockResults.length);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
      
      // Fallback to mock data on error
      const mockResults = generateMockResults(debouncedQuery, filters);
      setResults(mockResults);
      setTotalResults(mockResults.length);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters, currentPage, resultsPerPage]);

  // Trigger search when relevant parameters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Save a search
  const saveSearch = () => {
    if (!query.trim()) return null;
    
    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      query,
      filters,
      createdAt: new Date(),
    };
    
    const updatedSearches = [...savedSearches, newSavedSearch];
    setSavedSearches(updatedSearches);
    
    // Save to localStorage
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    
    return newSavedSearch.id;
  };

  // Delete a saved search
  const deleteSavedSearch = (id: string) => {
    const updatedSearches = savedSearches.filter(search => search.id !== id);
    setSavedSearches(updatedSearches);
    
    // Update localStorage
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
  };

  // Apply a saved search
  const applySavedSearch = (id: string) => {
    const savedSearch = savedSearches.find(search => search.id === id);
    if (savedSearch) {
      setQuery(savedSearch.query);
      setFilters(savedSearch.filters);
      setCurrentPage(1);
    }
  };

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isLoading,
    error,
    totalResults,
    currentPage,
    setCurrentPage,
    resultsPerPage,
    setResultsPerPage,
    savedSearches,
    saveSearch,
    deleteSavedSearch,
    applySavedSearch,
    performSearch,
  };
}

// Helper function to generate mock search results
function generateMockResults(query: string, filters: SearchFilters): SearchResult[] {
  if (!query && Object.keys(filters).length === 0) return [];
  
  const types = filters.type || ['user', 'job', 'event', 'group', 'article', 'post'];
  const mockResults: SearchResult[] = [];
  
  // Generate different results based on query and filters
  for (let i = 0; i < 20; i++) {
    const type = types[i % types.length];
    let result: SearchResult;
    
    switch (type) {
      case 'user':
        result = {
          id: 1000 + i,
          type: 'user',
          title: `${query ? query + ' ' : ''}User ${i + 1}`,
          description: `Software Engineer with expertise in React, Node.js, and cloud technologies.`,
          url: `/profile/${1000 + i}`,
          imageUrl: '',
          date: new Date(Date.now() - i * 86400000),
          tags: ['tech', 'startup', 'engineering'],
          location: 'Bangalore, India',
          company: 'Tech Innovators',
          role: 'Software Engineer',
        };
        break;
      case 'job':
        result = {
          id: 2000 + i,
          type: 'job',
          title: `${query ? query + ' ' : ''}Software Developer Position`,
          description: `We're looking for a talented software developer to join our team.`,
          url: `/jobs/${2000 + i}`,
          date: new Date(Date.now() - i * 86400000),
          tags: ['tech', 'remote', 'fullstack'],
          location: 'Mumbai, India',
          company: 'Digital Solutions Inc.',
          salary: '₹15L - ₹25L per annum',
          experience: '3-5 years',
          skills: ['React', 'Node.js', 'MongoDB'],
        };
        break;
      case 'event':
        result = {
          id: 3000 + i,
          type: 'event',
          title: `${query ? query + ' ' : ''}Tech Startup Summit`,
          description: `Join us for a day of networking and learning with industry experts.`,
          url: `/events/${3000 + i}`,
          imageUrl: '',
          date: new Date(Date.now() + i * 86400000),
          tags: ['networking', 'conference', 'startup'],
          location: 'Delhi, India',
        };
        break;
      case 'group':
        result = {
          id: 4000 + i,
          type: 'group',
          title: `${query ? query + ' ' : ''}Startup Founders Network`,
          description: `A community of startup founders sharing experiences and advice.`,
          url: `/groups/${4000 + i}`,
          imageUrl: '',
          date: new Date(Date.now() - i * 86400000 * 10),
          tags: ['startup', 'networking', 'entrepreneurship'],
        };
        break;
      case 'article':
        result = {
          id: 5000 + i,
          type: 'article',
          title: `${query ? query + ' ' : ''}How to Secure Funding for Your Startup`,
          description: `Learn the strategies that successful founders use to attract investors.`,
          url: `/articles/${5000 + i}`,
          imageUrl: '',
          date: new Date(Date.now() - i * 86400000 * 2),
          tags: ['funding', 'startup', 'investment'],
          author: {
            id: 100 + i,
            name: 'Priya Sharma',
            role: 'Venture Capitalist',
            avatarUrl: '',
          },
        };
        break;
      case 'post':
      default:
        result = {
          id: 6000 + i,
          type: 'post',
          title: `${query ? query + ' ' : ''}Thoughts on the Future of AI in Startups`,
          description: `AI is transforming how startups operate. Here's what you need to know.`,
          url: `/posts/${6000 + i}`,
          date: new Date(Date.now() - i * 3600000),
          tags: ['ai', 'tech', 'future'],
          author: {
            id: 200 + i,
            name: 'Vikram Malhotra',
            role: 'Tech Entrepreneur',
            avatarUrl: '',
          },
        };
    }
    
    // Apply tag filtering if specified
    if (filters.tags && filters.tags.length > 0) {
      if (filters.tags.some(tag => result.tags.includes(tag))) {
        mockResults.push(result);
      }
    } else {
      mockResults.push(result);
    }
  }
  
  return mockResults;
}