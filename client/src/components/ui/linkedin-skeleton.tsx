import React from "react";
import { cn } from "@/lib/utils";

interface LinkedInSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  animation?: "pulse" | "wave" | "none";
  width?: string | number;
  height?: string | number;
}

/**
 * A skeleton loader component that follows LinkedIn's mobile design
 * 
 * @example
 * <LinkedInSkeleton variant="text" width="100%" height={20} />
 */
export function LinkedInSkeleton({
  className,
  variant = "text",
  animation = "pulse",
  width,
  height,
}: LinkedInSkeletonProps) {
  // Base classes
  const baseClasses = "bg-[#E0E0E0]";
  
  // Animation classes
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };
  
  // Variant classes
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-md",
  };
  
  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case "text":
        return { width: width || "100%", height: height || "1rem" };
      case "circular":
        return { width: width || "2.5rem", height: height || "2.5rem" };
      case "rectangular":
      case "rounded":
        return { width: width || "100%", height: height || "6rem" };
    }
  };
  
  const dimensions = getDefaultDimensions();
  
  return (
    <div
      className={cn(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * A skeleton loader for LinkedIn post cards
 */
export function LinkedInPostSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border border-[#E0E0E0] overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 flex items-start">
        <LinkedInSkeleton variant="circular" width={40} height={40} />
        <div className="ml-3 flex-1">
          <LinkedInSkeleton variant="text" width="60%" height={16} className="mb-2" />
          <LinkedInSkeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-3">
        <LinkedInSkeleton variant="text" width="100%" height={16} className="mb-2" />
        <LinkedInSkeleton variant="text" width="90%" height={16} className="mb-2" />
        <LinkedInSkeleton variant="text" width="80%" height={16} />
      </div>
      
      {/* Image */}
      <LinkedInSkeleton variant="rectangular" width="100%" height={200} />
      
      {/* Actions */}
      <div className="px-4 py-2 border-t border-[#E0E0E0] mt-2">
        <div className="flex justify-between">
          <LinkedInSkeleton variant="text" width="20%" height={12} />
          <LinkedInSkeleton variant="text" width="30%" height={12} />
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex border-t border-[#E0E0E0] mt-2">
        <div className="flex-1 p-3 flex justify-center">
          <LinkedInSkeleton variant="text" width="50%" height={14} />
        </div>
        <div className="flex-1 p-3 flex justify-center">
          <LinkedInSkeleton variant="text" width="50%" height={14} />
        </div>
        <div className="flex-1 p-3 flex justify-center">
          <LinkedInSkeleton variant="text" width="50%" height={14} />
        </div>
      </div>
    </div>
  );
}

/**
 * A skeleton loader for LinkedIn profile cards
 */
export function LinkedInProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border border-[#E0E0E0] overflow-hidden", className)}>
      {/* Cover Image */}
      <LinkedInSkeleton variant="rectangular" width="100%" height={80} />
      
      {/* Profile Info */}
      <div className="px-4 pt-4 pb-3 relative">
        <div className="absolute -top-12 left-4 border-4 border-white rounded-full">
          <LinkedInSkeleton variant="circular" width={72} height={72} />
        </div>
        
        <div className="mt-12">
          <LinkedInSkeleton variant="text" width="70%" height={20} className="mb-2" />
          <LinkedInSkeleton variant="text" width="90%" height={16} className="mb-3" />
          <LinkedInSkeleton variant="text" width="50%" height={14} />
        </div>
      </div>
      
      {/* Stats */}
      <div className="px-4 py-3 border-t border-[#E0E0E0]">
        <div className="flex justify-between mb-2">
          <LinkedInSkeleton variant="text" width="40%" height={14} />
          <LinkedInSkeleton variant="text" width="20%" height={14} />
        </div>
        <div className="flex justify-between">
          <LinkedInSkeleton variant="text" width="35%" height={14} />
          <LinkedInSkeleton variant="text" width="15%" height={14} />
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t border-[#E0E0E0] flex gap-2">
        <LinkedInSkeleton variant="rounded" width="50%" height={36} />
        <LinkedInSkeleton variant="rounded" width="50%" height={36} />
      </div>
    </div>
  );
}

/**
 * A skeleton loader for LinkedIn job cards
 */
export function LinkedInJobSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border border-[#E0E0E0] p-4", className)}>
      <div className="flex items-start">
        <LinkedInSkeleton variant="rounded" width={48} height={48} />
        
        <div className="ml-3 flex-1">
          <LinkedInSkeleton variant="text" width="70%" height={18} className="mb-2" />
          <LinkedInSkeleton variant="text" width="50%" height={14} className="mb-2" />
          <LinkedInSkeleton variant="text" width="40%" height={14} className="mb-3" />
          
          <div className="flex items-center gap-2 mb-3">
            <LinkedInSkeleton variant="text" width={60} height={12} />
            <LinkedInSkeleton variant="text" width={80} height={12} />
            <LinkedInSkeleton variant="text" width={70} height={12} />
          </div>
          
          <LinkedInSkeleton variant="text" width="30%" height={12} />
        </div>
      </div>
    </div>
  );
}