import Link from "next/link"
import Image from "next/image"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "../ui/button";

export function NavbarLandingPage() {
  return (
    <nav className="w-full shadow flex items-center px-6 py-3 sticky top-0 z-50 bg-white">
      <div className="flex items-center gap-2 flex-1">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/pawsitive-logo.png"
            alt="Pawsitive Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          <span className="font-bold text-green-700" style={{ fontSize: 24 }}>Pawsitive</span>
        </Link>
      </div>
      <div className="flex-1 flex justify-center">
        <NavigationMenu>
          <NavigationMenuList className="gap-8">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/#hero" className="hover:text-green-700 hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-medium transition-colors">
                  Find a Pet
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/#why-pawsitive" className="hover:text-green-700 hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-medium transition-colors">
                  Why Pawsitive
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/#how-it-works" className="hover:text-green-700 hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-medium transition-colors">
                  How it Works
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/#community" className="hover:text-green-700 hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent font-medium transition-colors">
                  Community
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
            
      <div className="flex gap-4 justify-end flex-1">
        <Button className="text-md bg-transparent hover:bg-gray-50 text-black font-bold rounded-full" asChild>
          <Link href="/login">Login</Link>
        </Button>

        <Button className="text-md bg-green-700 hover:bg-green-800 text-white font-bold rounded-full" asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    </nav>
  );
}