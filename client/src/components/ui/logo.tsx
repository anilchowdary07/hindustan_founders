import React from 'react';

export function Logo({ className = "", size = "medium" }: { className?: string, size?: "small" | "medium" | "large" }) {
  const sizeClass = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10"
  }[size];

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-primary ${sizeClass}`}
      >
        <path d="M2 22c1.25-1.25 2.5-2.5 3.5-4.5 1.34 1.34 3 2 5.5 2s4.16-.66 5.5-2c1 2 2.25 3.25 3.5 4.5" />
        <path d="M2 22c3.5-3.5 6-6.5 8-11.5" />
        <path d="M14 10.5c1.25 3.75 2.5 6.5 8 11.5" />
        <path d="M14.75 3C9.5 3.5 5.5 7.5 5 12.75" />
        <path d="M20 3c-1 4.5-4 8.5-7.5 10.5" />
      </svg>
      <span className="ml-2 font-bold text-primary">Hindustan Founders</span>
    </div>
  );
}

export function LogoIcon({ className = "", size = "medium" }: { className?: string, size?: "small" | "medium" | "large" }) {
  const sizeClass = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10"
  }[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-primary ${sizeClass} ${className}`}
    >
      <path d="M2 22c1.25-1.25 2.5-2.5 3.5-4.5 1.34 1.34 3 2 5.5 2s4.16-.66 5.5-2c1 2 2.25 3.25 3.5 4.5" />
      <path d="M2 22c3.5-3.5 6-6.5 8-11.5" />
      <path d="M14 10.5c1.25 3.75 2.5 6.5 8 11.5" />
      <path d="M14.75 3C9.5 3.5 5.5 7.5 5 12.75" />
      <path d="M20 3c-1 4.5-4 8.5-7.5 10.5" />
    </svg>
  );
}