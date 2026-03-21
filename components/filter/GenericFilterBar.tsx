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
    <div className={`w-full max-w-3xl mx-auto bg-white rounded-lg p-2 md:p-2.5 lg:p-3 flex flex-col md:flex-row flex-wrap gap-2 md:gap-2.5 lg:gap-3 items-stretch md:items-center overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch] shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
