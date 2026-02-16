"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Icon } from "@iconify/react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "./NotificationDropdown"
import { ProfileDropdown } from "./ProfileDropdown"
import { Skeleton } from "@/components/ui/skeleton"

interface MenuItem {
  href: string
  label: string
}

export function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Menu items berdasarkan role
  const getMenuItems = (): MenuItem[] => {
    if (!session?.user) {
      return [
        { href: "/find-pet", label: "Find a Pet" },
        { href: "/adoption-process", label: "Adoption Process" },
        { href: "/community", label: "Community" },
        { href: "/chat", label: "Chat" },
      ]
    }

    const roleName = session.user.role.name.toLowerCase()

    switch (roleName) {
      case "adopter":
        return [
          { href: "/find-pet", label: "Find a Pet" },
          { href: "/adoption-process", label: "Adoption Process" },
          { href: "/community", label: "Community" },
          { href: "/chat", label: "Chat" },
        ]

      case "provider":
        return [
          { href: "/find-pet", label: "Find a Pet" },
          { href: "/adoption-process", label: "Adoption Process" },
          { href: "/community", label: "Community" },
          { href: "/create-update-pet", label: "Submit Animal" },
          { href: "/chat", label: "Chat" },
        ]

      case "admin":
        return [
          { href: "/admin/users", label: "User" },
          { href: "/admin/adoption-process", label: "Adoption Process" },
          { href: "/admin/community", label: "Community" },
          { href: "/admin/pets", label: "Pet" },
          { href: "/admin/posts", label: "Post" },
          { href: "/admin/reports", label: "Report" },
        ]

      default:
        return [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/find-pet", label: "Find a Pet" },
          { href: "/community", label: "Community" },
        ]
    }
  }

  const menuItems = getMenuItems()

  return (
    <nav className="w-full shadow sticky top-0 z-50 bg-white">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/pawsitive-logo.png"
              alt="Pawsitive Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="font-bold text-green-700 text-xl md:text-2xl">
              Pawsitive
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden lg:flex flex-1 justify-center">
          {status === "loading" ? (
            <div className="flex gap-6 xl:gap-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-24" />
              ))}
            </div>
          ) : (
            <NavigationMenu>
              <NavigationMenuList className="flex gap-6 xl:gap-8 w-auto">
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className="whitespace-nowrap hover:text-green-700 hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-medium transition-colors"
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        {/* Desktop Right side - Auth buttons or User menu */}
        <div className="hidden lg:flex gap-4 items-center">
          {status === "loading" ? (
            <>
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </>
          ) : status === "authenticated" && session?.user ? (
            <>
              <NotificationDropdown />
              <ProfileDropdown user={session.user} />
            </>
          ) : (
            <>
              <Button
                className="text-sm md:text-base bg-transparent hover:bg-gray-50 text-black font-bold rounded-full px-4 md:px-6"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>

              <Button
                className="text-sm md:text-base bg-green-700 hover:bg-green-800 text-white font-bold rounded-full px-4 md:px-6"
                asChild
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile - Right side icons + Hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          {status === "authenticated" && session?.user && (
            <>
              <NotificationDropdown />
              <ProfileDropdown user={session.user} />
            </>
          )}

          {/* Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <Icon icon="mdi:close" className="h-6 w-6" />
            ) : (
              <Icon icon="mdi:menu" className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Navigation Links */}
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 px-4 rounded-md hover:bg-gray-50 hover:text-green-700 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Auth Buttons (only show if not authenticated) */}
            {status !== "authenticated" && (
              <div className="pt-4 space-y-2 border-t">
                <Button
                  className="w-full bg-transparent hover:bg-gray-50 text-black font-bold rounded-full"
                  asChild
                >
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>

                <Button
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold rounded-full"
                  asChild
                >
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
