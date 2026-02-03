"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { UserProfile } from "@/types"
import { Icon } from "@iconify/react";
import Image from "next/image"
import Link from "next/link"

interface ProfileDropdownProps {
  user: UserProfile
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-700"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-20 border">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-green-700 font-medium mt-1 capitalize">
                {user.role.name}
              </p>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Icon icon="mdi:account" className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Icon icon="mdi:settings" className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors w-full text-left text-red-600"
            >
              <Icon icon="mdi:logout" className="h-4 w-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}