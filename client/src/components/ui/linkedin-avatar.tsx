import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle } from "lucide-react";

interface LinkedInAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
  verified?: boolean;
  status?: "online" | "away" | "offline" | "busy";
  statusPosition?: "top-right" | "bottom-right";
  onClick?: () => void;
}

/**
 * A avatar component that follows LinkedIn's mobile design
 * 
 * @example
 * <LinkedInAvatar 
 *   src="/path/to/image.jpg"
 *   alt="User Name"
 *   fallback="UN"
 *   size="md"
 *   verified
 * />
 */
export function LinkedInAvatar({
  src,
  alt = "",
  fallback,
  size = "md",
  className,
  fallbackClassName,
  verified = false,
  status,
  statusPosition = "bottom-right",
  onClick,
}: LinkedInAvatarProps) {
  // Size classes
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };
  
  // Status color classes
  const statusColorClasses = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
  };
  
  // Status position classes
  const statusPositionClasses = {
    "top-right": "-top-0.5 -right-0.5",
    "bottom-right": "-bottom-0.5 -right-0.5",
  };
  
  // Verified badge size based on avatar size
  const verifiedBadgeSize = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  };
  
  return (
    <div className="relative inline-block">
      <Avatar 
        className={cn(
          sizeClasses[size],
          "border border-[#E0E0E0]",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback 
          className={cn(
            "bg-[#0A66C2] text-white",
            fallbackClassName
          )}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>
      
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
          <CheckCircle className={cn(
            verifiedBadgeSize[size],
            "text-[#0A66C2]"
          )} />
        </div>
      )}
      
      {status && (
        <div 
          className={cn(
            "absolute w-2.5 h-2.5 rounded-full border-2 border-white",
            statusColorClasses[status],
            statusPositionClasses[statusPosition]
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}