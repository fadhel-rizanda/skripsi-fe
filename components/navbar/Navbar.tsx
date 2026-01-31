import { BellIcon, UserCircleIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

export function Navbar() {
  return (
    <nav className="w-full bg-[#F6F8F6] shadow flex items-center px-6 py-3">
      <div className="flex items-center gap-2 flex-1">
        <Image
          src="/assets/pawsitive-logo.png"
          alt="Pawsitive Logo"
          width={32}
          height={32}
          className="mr-2"
        />
          <span className="font-bold text-green-700" style={{ fontSize: 24 }}>Pawsitive</span>
      </div>
      <div className="flex-1 flex justify-center">
        <NavigationMenu>
          <NavigationMenuList className="gap-8">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/find-pet" className="hover:text-green-700 font-medium">Find a Pet</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/adoption-process" className="hover:text-green-700 font-medium">Adoption Process</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/community" className="hover:text-green-700 font-medium">Community</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/chat" className="hover:text-green-700 font-medium">Chat</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
            <div className="flex-1 flex justify-end items-center gap-4">
              <button className="hover:bg-gray-200 rounded-full p-2 transition-colors">
                <BellIcon className="w-6 h-6 text-green-700" />
              </button>
              <button className="hover:bg-gray-200 rounded-full p-1 transition-colors">
                <UserCircleIcon className="w-8 h-8 text-green-700" />
              </button>
            </div>
    </nav>
  );
}
