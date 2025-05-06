import React from "react";
import { cn } from "@/lib/utils";

interface LinkedInCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  noRoundedTop?: boolean;
  noRoundedBottom?: boolean;
  noBorder?: boolean;
}

/**
 * A card component that follows LinkedIn's mobile design
 * 
 * @example
 * <LinkedInCard>
 *   <LinkedInCardHeader>
 *     <h3>Card Title</h3>
 *   </LinkedInCardHeader>
 *   <LinkedInCardContent>
 *     <p>Card content</p>
 *   </LinkedInCardContent>
 *   <LinkedInCardFooter>
 *     <Button>Action</Button>
 *   </LinkedInCardFooter>
 * </LinkedInCard>
 */
export function LinkedInCard({
  className,
  children,
  noPadding = false,
  noRoundedTop = false,
  noRoundedBottom = false,
  noBorder = false,
  ...props
}: LinkedInCardProps) {
  return (
    <div
      className={cn(
        "bg-white",
        !noBorder && "border border-[#E0E0E0] md:border-[#E0E0E0]",
        !noRoundedTop && "rounded-t-lg",
        !noRoundedBottom && "rounded-b-lg",
        !noPadding && "p-0",
        "mb-2 md:mb-4 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface LinkedInCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noDivider?: boolean;
}

export function LinkedInCardHeader({
  className,
  children,
  noDivider = false,
  ...props
}: LinkedInCardHeaderProps) {
  return (
    <div
      className={cn(
        "px-4 py-3",
        !noDivider && "border-b border-[#E0E0E0]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface LinkedInCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function LinkedInCardContent({
  className,
  children,
  noPadding = false,
  ...props
}: LinkedInCardContentProps) {
  return (
    <div
      className={cn(
        !noPadding && "px-4 py-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface LinkedInCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noDivider?: boolean;
}

export function LinkedInCardFooter({
  className,
  children,
  noDivider = false,
  ...props
}: LinkedInCardFooterProps) {
  return (
    <div
      className={cn(
        "px-4 py-2",
        !noDivider && "border-t border-[#E0E0E0]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface LinkedInCardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function LinkedInCardActions({
  className,
  children,
  ...props
}: LinkedInCardActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-[#E0E0E0]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface LinkedInCardActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function LinkedInCardActionButton({
  className,
  children,
  icon,
  ...props
}: LinkedInCardActionButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center justify-center flex-1 py-3 text-[#666666] hover:bg-[#F3F2EF] transition-colors",
        "text-xs font-medium focus:outline-none",
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}