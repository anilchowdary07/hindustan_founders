import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './use-debounce';

export type SearchResult = {
  id: string | number;
  type: 'user' | 'job' | 'event' | 'group' | 'post' | 'article';
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  tags?: string[];
  date?: Date;
};

export type SavedSearch = {
  id: string;
  query: string;
  filters: Record<string, any>;
  createdAt: Date;
};

export type SearchFilters = {
  type?: string[];
  location?: string;
  date?: { from?: Date; to?: Date };
  tags?: string[];
  category?: string;
  [key: string]: any;
};

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const savedSearchesData = localStorage.getItem('savedSearches');
      if (savedSearchesData) {
        const parsedData = JSON.parse(savedSearchesData);
        setSavedSearches(parsedData.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        })));
      }

      const recentSearchesData = localStorage.getItem('recentSearches');
      if (recentSearchesData) {
        setRecentSearches(JSON.parse(recentSearchesData));
      }
    } catch (err) {
      console.error('Error loading saved searches:', err);
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Save saved searches to localStorage
  useEffect(() => {
    if (savedSearches.length > 0) {
      localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    }
  }, [savedSearches]);

  // Generate search suggestions based on query
  useEffect(() => {
    if (debouncedQuery.length > 1) {
      // In a real app, this would be an API call
      // For now, we'll generate some mock suggestions
      const mockSuggestions = generateMockSuggestions(debouncedQuery);
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Perform search when query or filters change
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      performSearch(debouncedQuery, filters);
      
      // Add to recent searches if not already there
      if (!recentSearches.includes(debouncedQuery)) {
        const updatedRecentSearches = [debouncedQuery, ...recentSearches.slice(0, 9)];
        setRecentSearches(updatedRecentSearches);
      }
    }
  }, [debouncedQuery, filters]);

  // Mock function to generate search suggestions
  const generateMockSuggestions = (query: string): string[] => {
    const commonTerms = [
      'startup', 'funding', 'venture capital', 'pitch deck', 
      'networking', 'investors', 'entrepreneurship', 'business model',
      'product launch', 'marketing strategy', 'tech startup',
      'seed funding', 'angel investors', 'series A', 'MVP'
    ];
    
    return commonTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  };

  // Mock function to perform search
  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock results based on query and filters
      const mockResults = generateMockResults(searchQuery, searchFilters);
      setResults(mockResults);
      
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    }
  };

  // Mock function to generate search results
  const generateMockResults = (searchQuery: string, searchFilters: SearchFilters): SearchResult[] => {
    const allResults: SearchResult[] = [
      {
        id: 1,
        type: 'user',
        title: 'Rahul Sharma',
        description: 'Founder & CEO at TechInnovate',
        url: '/profile/rahul-sharma',
        imageUrl: '/avatars/rahul.jpg',
        tags: ['tech', 'startup', 'ai']
      },
      {
        id: 2,
        type: 'user',
        title: 'Priya Patel',
        description: 'Angel Investor | Former CTO at CloudScale',
        url: '/profile/priya-patel',
        imageUrl: '/avatars/priya.jpg',
        tags: ['investor', 'tech', 'saas']
      },
      {
        id: 3,
        type: 'job',
        title: 'Senior Full Stack Developer',
        description: 'TechInnovate is looking for a senior developer to join our growing team.',
        url: '/jobs/senior-full-stack-developer',
        date: new Date('2023-11-15'),
        tags: ['tech', 'remote', 'full-time']
      },
      {
        id: 4,
        type: 'event',
        title: 'Startup Funding Masterclass',
        description: 'Learn how to secure funding for your startup from experienced VCs.',
        url: '/events/startup-funding-masterclass',
        date: new Date('2023-12-10'),
        imageUrl: '/events/funding-masterclass.jpg',
        tags: ['funding', 'workshop', 'networking']
      },
      {
        id: 5,
        type: 'group',
        title: 'Bangalore Tech Founders',
        description: 'A community of tech founders in Bangalore sharing experiences and opportunities.',
        url: '/groups/bangalore-tech-founders',
        imageUrl: '/groups/bangalore-tech.jpg',
        tags: ['bangalore', 'tech', 'networking']
      },
      {
        id: 6,
        type: 'article',
        title: 'How to Create the Perfect Pitch Deck',
        description: 'A comprehensive guide to creating a pitch deck that will impress investors.',
        url: '/resources/perfect-pitch-deck',
        date: new Date('2023-10-05'),
        imageUrl: '/articles/pitch-deck.jpg',
        tags: ['pitch', 'funding', 'guide']
      },
      {
        id: 7,
        type: 'post',
        title: 'Looking for co-founder with technical background',
        description: 'I have a promising idea in the fintech space and looking for a technical co-founder.',
        url: '/posts/looking-for-cofounder',
        date: new Date('2023-11-20'),
        tags: ['co-founder', 'fintech', 'startup']
      },
      {
        id: 8,
        type: 'job',
        title: 'Marketing Director',
        description: 'Growing startup seeking an experienced Marketing Director to lead our team.',
        url: '/jobs/marketing-director',
        date: new Date('2023-11-18'),
        tags: ['marketing', 'leadership', 'full-time']
      },
      {
        id: 9,
        type: 'event',
        title: 'AI in Business: Practical Applications',
        description: 'A workshop on implementing AI solutions in your business.',
        url: '/events/ai-in-business',
        date: new Date('2023-12-15'),
        imageUrl: '/events/ai-workshop.jpg',
        tags: ['ai', 'workshop', 'tech']
      },
      {
        id: 10,
        type: 'article',
        title: 'Navigating the Funding Landscape in 2023',
        description: 'An overview of the current funding environment for startups.',
        url: '/resources/funding-landscape-2023',
        date: new Date('2023-09-28'),
        imageUrl: '/articles/funding-landscape.jpg',
        tags: ['funding', 'venture-capital', 'startup']
      }
    ];
    
    // Filter results based on search query
    let filteredResults = allResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (result.description && result.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (result.tags && result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    
    // Apply additional filters
    if (searchFilters.type && searchFilters.type.length > 0) {
      filteredResults = filteredResults.filter(result => 
        searchFilters.type!.includes(result.type)
      );
    }
    
    if (searchFilters.tags && searchFilters.tags.length > 0) {
      filteredResults = filteredResults.filter(result => 
        result.tags && result.tags.some(tag => searchFilters.tags!.includes(tag))
      );
    }
    
    if (searchFilters.date && (searchFilters.date.from || searchFilters.date.to)) {
      filteredResults = filteredResults.filter(result => {
        if (!result.date) return false;
        
        const resultDate = new Date(result.date);
        let matches = true;
        
        if (searchFilters.date!.from) {
          matches = matches && resultDate >= new Date(searchFilters.date!.from!);
        }
        
        if (searchFilters.date!.to) {
          matches = matches && resultDate <= new Date(searchFilters.date!.to!);
        }
        
        return matches;
      });
    }
    
    return filteredResults;
  };

  // Save current search
  const saveSearch = useCallback(() => {
    if (query.trim()) {
      const newSavedSearch: SavedSearch = {
        id: Date.now().toString(),
        query: query,
        filters: filters,
        createdAt: new Date()
      };
      
      setSavedSearches(prev => [newSavedSearch, ...prev]);
      
      return newSavedSearch.id;
    }
    return null;
  }, [query, filters]);

  // Delete saved search
  const deleteSavedSearch = useCallback((id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  // Apply a saved search
  const applySavedSearch = useCallback((id: string) => {
    const savedSearch = savedSearches.find(search => search.id === id);
    if (savedSearch) {
      setQuery(savedSearch.query);
      setFilters(savedSearch.filters);
      return true;
    }
    return false;
  }, [savedSearches]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    suggestions,
    isLoading,
    error,
    savedSearches,
    recentSearches,
    saveSearch,
    deleteSavedSearch,
    clearRecentSearches,
    applySavedSearch,
    performSearch
  };
}