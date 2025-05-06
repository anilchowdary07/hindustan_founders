import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LinkedInButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

/**
 * A button component that follows LinkedIn's mobile design
 * 
 * @example
 * <LinkedInButton variant="primary" size="md">
 *   Connect
 * </LinkedInButton>
 */
export function LinkedInButton({
  className,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  icon,
  iconPosition = "left",
  rounded = "md",
  ...props
}: LinkedInButtonProps) {
  // Base classes
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none";
  
  // Variant classes
  const variantClasses = {
    primary: "bg-[#0A66C2] text-white hover:bg-[#004182] active:bg-[#00295C]",
    secondary: "bg-[#EEF3F8] text-[#0A66C2] hover:bg-[#DCE6F1] active:bg-[#C9D1DB]",
    outline: "bg-transparent text-[#0A66C2] border border-[#0A66C2] hover:bg-[#EEF3F8] active:bg-[#DCE6F1]",
    ghost: "bg-transparent text-[#666666] hover:bg-[#F3F2EF] active:bg-[#E6E9EC]",
    text: "bg-transparent text-[#0A66C2] hover:underline"
  };
  
  // Size classes
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5"
  };
  
  // Rounded classes
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  };
  
  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";
  
  // Disabled classes
  const disabledClasses = props.disabled ? "opacity-60 cursor-not-allowed" : "";
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        roundedClasses[rounded],
        widthClasses,
        disabledClasses,
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      
      {!isLoading && icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!isLoading && icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
}