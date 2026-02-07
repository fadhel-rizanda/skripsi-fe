"use client"

import { MenuIcon } from "lucide-react"
import { Icon } from "@iconify/react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="w-full bg-[#F6F8F6] shadow flex items-center px-4 sm:px-6 py-3 relative">
      {/* Mobile Menu Button */}
      <div className="md:hidden mr-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="hover:bg-gray-200 rounded p-2 transition-colors">
              <MenuIcon className="w-6 h-6 text-green-700" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Image
                  src="/assets/pawsitive-logo.png"
                  alt="Pawsitive Logo"
                  width={32}
                  height={32}
                />
                <span className="font-sans font-bold text-green-700 text-xl">Pawsitive</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              <Link 
                href="/find-pet" 
                className="font-sans hover:text-green-700 font-medium py-2 px-4 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setOpen(false)}
              >
                Find a Pet
              </Link>
              <Link 
                href="/adoption-process" 
                className="font-sans hover:text-green-700 font-medium py-2 px-4 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setOpen(false)}
              >
                Adoption Process
              </Link>
              <Link 
                href="/community" 
                className="font-sans hover:text-green-700 font-medium py-2 px-4 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setOpen(false)}
              >
                Community
              </Link>
              <Link 
                href="/chat" 
                className="font-sans hover:text-green-700 font-medium py-2 px-4 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setOpen(false)}
              >
                Chat
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="/assets/pawsitive-logo.png"
          alt="Pawsitive Logo"
          width={32}
          height={32}
          className="mr-2"
        />
        <span className="font-sans font-bold text-black text-xl sm:text-2xl">Pawsitive</span>
      </div>

      {/* Desktop Navigation - Centered */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
        <NavigationMenu>
          <NavigationMenuList className="gap-4 lg:gap-8">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/find-pet" className="font-sans hover:text-green-700 font-medium">Find a Pet</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/adoption-process" className="font-sans hover:text-green-700 font-medium">Adoption Process</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/community" className="font-sans hover:text-green-700 font-medium">Community</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/chat" className="font-sans hover:text-green-700 font-medium">Chat</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Right Icons */}
      <div className="flex justify-end items-center gap-2 sm:gap-4 ml-auto">
        <button aria-label="View notifications" className="hover:bg-gray-200 rounded-full p-1.5 sm:p-2 transition-colors">
          <Icon icon="heroicons:bell" className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
        </button>
        <button aria-label="View user profile" className="hover:bg-gray-200 rounded-full p-1 transition-colors">
          <Icon icon="heroicons:user-circle" className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
        </button>
      </div>
    </nav>
  );
}
