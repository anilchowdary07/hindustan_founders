import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LinkedInTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface LinkedInTabsProps {
  tabs: LinkedInTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "underline" | "pills" | "buttons";
  scrollable?: boolean;
  fullWidth?: boolean;
}

/**
 * A tabs component that follows LinkedIn's mobile design
 * 
 * @example
 * <LinkedInTabs
 *   tabs={[
 *     { id: "all", label: "All" },
 *     { id: "people", label: "People" },
 *     { id: "jobs", label: "Jobs" }
 *   ]}
 *   activeTab="all"
 *   onChange={(tabId) => setActiveTab(tabId)}
 *   variant="underline"
 *   scrollable
 * />
 */
export function LinkedInTabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "underline",
  scrollable = true,
  fullWidth = false,
}: LinkedInTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // Check if scroll arrows should be shown
  useEffect(() => {
    if (scrollable && scrollRef.current) {
      const checkScroll = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current!;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
      };
      
      checkScroll();
      scrollRef.current.addEventListener("scroll", checkScroll);
      
      return () => {
        scrollRef.current?.removeEventListener("scroll", checkScroll);
      };
    }
  }, [scrollable, tabs]);
  
  // Scroll to active tab
  useEffect(() => {
    if (scrollable && scrollRef.current) {
      const activeTabElement = scrollRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
      
      if (activeTabElement) {
        const scrollContainer = scrollRef.current;
        const activeTabLeft = activeTabElement.offsetLeft;
        const activeTabWidth = activeTabElement.offsetWidth;
        const containerWidth = scrollContainer.clientWidth;
        const scrollLeft = scrollContainer.scrollLeft;
        
        // Center the active tab
        if (activeTabLeft < scrollLeft || activeTabLeft + activeTabWidth > scrollLeft + containerWidth) {
          scrollContainer.scrollTo({
            left: activeTabLeft - (containerWidth - activeTabWidth) / 2,
            behavior: "smooth",
          });
        }
      }
    }
  }, [activeTab, scrollable]);
  
  // Scroll left/right
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };
  
  // Variant-specific classes
  const getTabClasses = (isActive: boolean) => {
    const baseClasses = "flex items-center justify-center whitespace-nowrap transition-colors focus:outline-none";
    
    switch (variant) {
      case "pills":
        return cn(
          baseClasses,
          "px-4 py-1.5 rounded-full text-sm font-medium",
          isActive
            ? "bg-[#0A66C2] text-white"
            : "bg-[#EEF3F8] text-[#666666] hover:bg-[#DCE6F1]"
        );
      case "buttons":
        return cn(
          baseClasses,
          "px-4 py-1.5 text-sm font-medium border",
          isActive
            ? "border-[#0A66C2] text-[#0A66C2] bg-[#EEF3F8]"
            : "border-[#E0E0E0] text-[#666666] hover:bg-[#F3F2EF]"
        );
      case "underline":
      default:
        return cn(
          baseClasses,
          "px-3 py-2 text-sm font-medium border-b-2",
          isActive
            ? "border-[#0A66C2] text-[#0A66C2]"
            : "border-transparent text-[#666666] hover:text-[#191919] hover:border-[#E0E0E0]"
        );
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      {/* Scroll Arrows */}
      {scrollable && showLeftArrow && (
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-sm"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-[#666666]" />
        </button>
      )}
      
      {scrollable && showRightArrow && (
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-sm"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-[#666666]" />
        </button>
      )}
      
      {/* Tabs Container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex",
          scrollable ? "overflow-x-auto scrollbar-hide" : "overflow-x-hidden",
          variant === "underline" && "border-b border-[#E0E0E0]",
          variant === "buttons" && "space-x-2 p-1"
        )}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            data-tab-id={tab.id}
            className={cn(
              getTabClasses(activeTab === tab.id),
              fullWidth && "flex-1"
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-full text-xs",
                activeTab === tab.id
                  ? variant === "pills" ? "bg-white/20 text-white" : "bg-[#EEF3F8] text-[#0A66C2]"
                  : "bg-[#E0E0E0] text-[#666666]"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface LinkedInTabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function LinkedInTabPanel({
  id,
  activeTab,
  children,
  className,
}: LinkedInTabPanelProps) {
  const isActive = activeTab === id;
  
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!isActive}
      className={cn(
        isActive ? "block" : "hidden",
        className
      )}
    >
      {children}
    </div>
  );
}