import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LinkedInInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
  labelClassName?: string;
  inputContainerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  hintClassName?: string;
}

/**
 * A input component that follows LinkedIn's mobile design
 * 
 * @example
 * <LinkedInInput 
 *   label="Email" 
 *   placeholder="Enter your email"
 *   leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
 * />
 */
export const LinkedInInput = forwardRef<HTMLInputElement, LinkedInInputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      containerClassName,
      labelClassName,
      inputContainerClassName,
      inputClassName,
      errorClassName,
      hintClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              "block text-sm font-medium text-[#191919] mb-1.5",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <div
          className={cn(
            "relative rounded-md shadow-sm",
            inputContainerClassName
          )}
        >
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            className={cn(
              "block w-full rounded-md border-[#E0E0E0] shadow-sm",
              "focus:ring-[#0A66C2] focus:border-[#0A66C2] focus:outline-none",
              "placeholder:text-[#666666] text-[#191919]",
              "disabled:bg-[#F3F2EF] disabled:text-[#666666] disabled:cursor-not-allowed",
              error && "border-[#CC1016] focus:ring-[#CC1016] focus:border-[#CC1016]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              inputClassName
            )}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${props.id}-error`
                : hint
                ? `${props.id}-hint`
                : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div
              className={cn(
                "absolute inset-y-0 right-0 pr-3 flex items-center",
                onRightIconClick && "cursor-pointer"
              )}
              onClick={onRightIconClick}
            >
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p
            id={`${props.id}-error`}
            className={cn(
              "mt-1 text-xs text-[#CC1016]",
              errorClassName
            )}
          >
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p
            id={`${props.id}-hint`}
            className={cn(
              "mt-1 text-xs text-[#666666]",
              hintClassName
            )}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

LinkedInInput.displayName = "LinkedInInput";