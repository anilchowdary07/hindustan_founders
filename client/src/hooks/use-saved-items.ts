import { useState, useEffect, useCallback } from 'react';

export type SavedItemType = 'post' | 'job' | 'article' | 'event' | 'profile' | 'group';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  date?: Date;
  tags?: string[];
  savedAt: Date;
}

export function useSavedItems() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load saved items from localStorage
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedItemsData = localStorage.getItem('savedItems');
      if (savedItemsData) {
        const parsedData = JSON.parse(savedItemsData);
        setSavedItems(parsedData.map((item: any) => ({
          ...item,
          savedAt: new Date(item.savedAt),
          date: item.date ? new Date(item.date) : undefined
        })));
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading saved items:', err);
      setIsLoading(false);
    }
  }, []);
  
  // Save items to localStorage whenever they change
  useEffect(() => {
    // Always save to localStorage, even if empty (to clear previous data)
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
  }, [savedItems]);
  
  // Check if an item is saved
  const isItemSaved = useCallback((id: string) => {
    return savedItems.some(item => item.id === id);
  }, [savedItems]);
  
  // Save an item
  const saveItem = useCallback((item: Omit<SavedItem, 'savedAt'>) => {
    if (!isItemSaved(item.id)) {
      const newItem: SavedItem = {
        ...item,
        savedAt: new Date()
      };
      
      setSavedItems(prev => [newItem, ...prev]);
      return true;
    }
    return false;
  }, [isItemSaved]);
  
  // Remove a saved item
  const removeItem = useCallback((id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  // Clear all saved items
  const clearAllItems = useCallback(() => {
    setSavedItems([]);
    localStorage.removeItem('savedItems');
  }, []);
  
  // Get saved items by type
  const getItemsByType = useCallback((type: SavedItemType) => {
    return savedItems.filter(item => item.type === type);
  }, [savedItems]);
  
  // Get all saved item types with counts
  const getItemTypeCounts = useCallback(() => {
    const counts: Record<SavedItemType, number> = {
      post: 0,
      job: 0,
      article: 0,
      event: 0,
      profile: 0,
      group: 0
    };
    
    savedItems.forEach(item => {
      counts[item.type]++;
    });
    
    return counts;
  }, [savedItems]);
  
  return {
    savedItems,
    isLoading,
    isItemSaved,
    saveItem,
    removeItem,
    clearAllItems,
    getItemsByType,
    getItemTypeCounts
  };
}