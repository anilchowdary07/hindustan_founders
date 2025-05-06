import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, X, ArrowLeft } from "lucide-react";
import { LinkedInAvatar } from "./linkedin-avatar";

interface SearchResult {
  id: string;
  type: "user" | "company" | "group" | "job" | "event" | "post";
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

interface LinkedInSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  results?: SearchResult[];
  isLoading?: boolean;
  className?: string;
  fullScreen?: boolean;
  onClose?: () => void;
}

/**
 * A search component that follows LinkedIn's mobile design
 * 
 * @example
 * <LinkedInSearch 
 *   placeholder="Search"
 *   onSearch={(query) => console.log(query)}
 *   results={[
 *     { id: "1", type: "user", title: "John Doe", subtitle: "Software Engineer", imageUrl: "/path/to/avatar.jpg" }
 *   ]}
 * />
 */
export function LinkedInSearch({
  placeholder = "Search",
  onSearch,
  onResultClick,
  results = [],
  isLoading = false,
  className,
  fullScreen = false,
  onClose,
}: LinkedInSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when fullScreen mode is activated
  useEffect(() => {
    if (fullScreen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [fullScreen]);
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // Optional: Add debounce for live search
  };
  
  // Clear search input
  const handleClear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Render result icon based on type
  const renderResultIcon = (result: SearchResult) => {
    if (result.type === "user") {
      return (
        <LinkedInAvatar
          src={result.imageUrl}
          alt={result.title}
          fallback={result.title.substring(0, 2).toUpperCase()}
          size="sm"
        />
      );
    }
    
    // For other types, you can add specific icons
    return (
      <div className="h-8 w-8 bg-[#EEF3F8] rounded-md flex items-center justify-center">
        <span className="text-[#0A66C2] text-xs font-medium">
          {result.type.substring(0, 1).toUpperCase()}
        </span>
      </div>
    );
  };
  
  // Full screen search component
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Search Header */}
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center">
          <button
            className="mr-3 text-[#666666]"
            onClick={onClose}
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full py-2 pl-8 pr-8 bg-[#EEF3F8] rounded-full text-[#191919] placeholder:text-[#666666] focus:outline-none"
              aria-label={placeholder}
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
            
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-[#666666]"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
        
        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0A66C2]"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  className="w-full px-4 py-2 flex items-center hover:bg-[#F3F2EF] transition-colors"
                  onClick={() => onResultClick && onResultClick(result)}
                >
                  {renderResultIcon(result)}
                  
                  <div className="ml-3 text-left">
                    <div className="text-sm font-medium text-[#191919]">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-[#666666]">{result.subtitle}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[#666666]">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="px-4 py-4">
              <h3 className="text-sm font-medium text-[#191919] mb-2">Recent Searches</h3>
              <p className="text-xs text-[#666666]">Your recent searches will appear here</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Inline search component
  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full py-2 pl-8 pr-8 bg-[#EEF3F8] rounded-full text-[#191919] placeholder:text-[#666666] focus:outline-none"
          aria-label={placeholder}
        />
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-[#666666]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
      
      {/* Dropdown Results */}
      {isFocused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-[#E0E0E0] z-10 max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-4 py-2 flex items-center hover:bg-[#F3F2EF] transition-colors"
              onClick={() => onResultClick && onResultClick(result)}
            >
              {renderResultIcon(result)}
              
              <div className="ml-3 text-left">
                <div className="text-sm font-medium text-[#191919]">{result.title}</div>
                {result.subtitle && (
                  <div className="text-xs text-[#666666]">{result.subtitle}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}