import { ReactNode } from "react";

interface GenericFilterBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Generic wrapper component for filter bars
 * Provides consistent styling and layout
 */
export function GenericFilterBar({
  children,
  className = "",
}: GenericFilterBarProps) {
  return (
    <div className={`w-full max-w-3xl mx-auto bg-white rounded-lg p-2 sm:p-3 flex flex-row flex-nowrap gap-2 sm:gap-3 items-center overflow-x-auto overflow-y-hidden shadow-sm border border-gray-200 scrollbar-hide [-webkit-overflow-scrolling:touch] ${className}`}>
      {children}
    </div>
  );
}
