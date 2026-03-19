"use client"

import { signOut } from "next-auth/react"
import { UserProfile } from "@/types"
import { Icon } from "@iconify/react"
import Image from "next/image"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { isValidUrl } from "@/lib/utils"
import { useProfileStore } from "@/store/useProfileStore"

interface ProfileDropdownProps {
  user: UserProfile
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const avatarUrl = useProfileStore((s) => s.avatarUrl)
  const displayAvatar = avatarUrl ?? user.avatar
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          {displayAvatar && isValidUrl(displayAvatar) ? (
            <Image
              src={displayAvatar}
              alt={user.name}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-green-700 flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none truncate">
              {user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-green-700 font-medium mt-1 capitalize">
              {user.role.name}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <Icon icon="mdi:account" className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <Icon icon="mdi:logout" className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}