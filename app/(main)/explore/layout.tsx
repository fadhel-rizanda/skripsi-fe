"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#E7F3E7] p-4 md:p-8 font-[family-name:var(--font-manrope)]">
        {children}
    </div>
  );
}

// Export the component as a named export to be used in pages
export function CommunityPageLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  const activeClass = "pb-3 border-b-2 border-green-600 text-green-700 font-semibold text-base whitespace-nowrap";
  const inactiveClass = "pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-base whitespace-nowrap transition-colors";

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardContent className="pt-8 pb-6 px-6 md:px-10 flex flex-col items-center">
        <h1 className="text-[36px] font-bold text-gray-900 mb-6 font-sans">Community Hub</h1>

        {/* Tabs */}
        <div className="flex w-full justify-center border-b border-gray-300 mb-8 overflow-x-auto">
          <div className="flex gap-8">
            <Link
              href="/explore/posts"
              className={isActive("/explore/posts") ? activeClass : inactiveClass}
            >
              All Posts
            </Link>
            <Link
              href="/explore/communities"
              className={isActive("/explore/communities") ? activeClass : inactiveClass}
            >
              All Communities
            </Link>
            <Link
              href="/explore/users"
              className={isActive("/explore/users") ? activeClass : inactiveClass}
            >
              All Users
            </Link>
          </div>
        </div>

        <p className="text-gray-500 text-center mb-6 text-[18px]">
          Connect with fellow pet lovers, share your stories, and get valuable advice.
        </p>

        {children}
      </CardContent>
    </Card>
  );
}
