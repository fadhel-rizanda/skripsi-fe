import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/assets/pawsitive-logo.png"
                alt="Pawsitive Logo"
                width={40}
                height={40}
              />
              <span className="font-bold text-2xl text-white">Pawsitive</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Connecting loving families with pets in need. Making adoption simple, joyful, and rewarding.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white" asChild>
                <Link href="#"><Facebook className="w-5 h-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white" asChild>
                <Link href="#"><Twitter className="w-5 h-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white" asChild>
                <Link href="#"><Instagram className="w-5 h-5" /></Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/pets">Find a Pet</Link>
              </Button>
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/#why-pawsitive">Why Pawsitive</Link>
              </Button>
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/#how-it-works">How It Works</Link>
              </Button>
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/community">Community</Link>
              </Button>
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/about">About Us</Link>
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Resources</h3>
            <div className="flex flex-col gap-2">
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/adoption-guide">Adoption Guide</Link>
              </Button>
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/pet-care">Pet Care Tips</Link>
              </Button>
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/faq">FAQs</Link>
              </Button>
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/blog">Blog</Link>
              </Button>
              <Button variant="link" className="h-auto p-0 text-gray-300 hover:text-green-500 font-normal justify-start" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Contact</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">123 Pet Street, Animal City, AC 12345</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">hello@pawsitive.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <Separator className="bg-gray-800 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 Pawsitive. All rights reserved.
          </p>
          {/* TODO: Update links when pages are ready */}
          <div className="flex gap-6 text-sm">
            <Button variant="link" className="h-auto p-0 text-gray-400 hover:text-green-500 text-sm font-normal" asChild>
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button variant="link" className="h-auto p-0 text-gray-400 hover:text-green-500 text-sm font-normal" asChild>
              <Link href="/terms">Terms of Service</Link>
            </Button>
            <Button variant="link" className="h-auto p-0 text-gray-400 hover:text-green-500 text-sm font-normal" asChild>
              <Link href="/cookies">Cookie Policy</Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}