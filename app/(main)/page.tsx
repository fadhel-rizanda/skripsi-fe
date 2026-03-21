import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

export default function Home() {
    return (
        <>
            <main className="min-h-screen">

                {/* Hero Section */}
                <section id="hero" className="relative h-screen w-full">
                    {/* Background Image */}
                    <Image
                        src="/assets/hero-bg.jpg"
                        alt="Happy dog"
                        fill
                        className="object-cover"
                        priority
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-4xl">
                            Find Your Perfect Companion
                        </h1>
                        <p className="text-lg md:text-xl text-white mb-8 max-w-3xl">
                            Browse thousands of adoptable pets and start your journey to a lifetime of love and companionship.
                        </p>
                        <Button
                            className="text-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full px-8 py-6"
                            asChild
                        >
                            <Link href="/pets">Browse Pets Now</Link>
                        </Button>
                    </div>
                </section>

                {/* Why Pawsitive Section */}
                <section id="why-pawsitive" className="py-16 md:py-24 px-6 bg-gray-50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Why Adopt with Pawsitive Match?
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                We're dedicated to making the adoption process simple, joyful, and rewarding for both you and your new best friend.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1: Save a Life */}
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <Icon icon="mdi:heart" className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Save a Life</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Give a deserving animal a second chance and a loving forever home. You're not just getting a pet, you're saving a life.
                                </p>
                            </div>

                            {/* Card 2: Find Your Best Friend */}
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <Icon icon="mdi:paw" className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Your Best Friend</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Our detailed profiles and smart filters help you find a companion that perfectly matches your lifestyle and personality.
                                </p>
                            </div>

                            {/* Card 3: Join a Community */}
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <Icon icon="mdi:account-group" className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Join a Community</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Connect with a passionate community of pet lovers, share stories, and get support throughout your adoption journey.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-16 md:py-24 px-6 bg-white">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                How It Works
                            </h2>
                            <p className="text-lg text-gray-600">
                                Adopting a pet is as easy as 1–2–3.
                            </p>
                        </div>

                        <div className="relative">
                            {/* Connecting Line */}
                            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gray-300" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                                {/* Step 1: Browse Pets */}
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center w-28 h-28 bg-green-600 rounded-full mb-6 z-10">
                                        <span className="text-5xl font-bold text-white">1</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse Pets</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Explore our extensive listings of adorable, adoptable pets from shelters and rescues near you.
                                    </p>
                                </div>

                                {/* Step 2: Apply to Adopt */}
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center w-28 h-28 bg-green-600 rounded-full mb-6 z-10">
                                        <span className="text-5xl font-bold text-white">2</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Apply to Adopt</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Found a potential match? Fill out a simple online application to start the adoption process.
                                    </p>
                                </div>

                                {/* Step 3: Welcome Home */}
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center w-28 h-28 bg-green-600 rounded-full mb-6 z-10">
                                        <span className="text-5xl font-bold text-white">3</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome Home</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        After approval, arrange a meet-and-greet and prepare to welcome your new furry family member home!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Community Section */}
                <section id="community" className="py-16 md:py-24 px-6 bg-linear-to-br from-green-50 to-green-100">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Join Our Community
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Connect with thousands of pet lovers, share experiences, get advice, and celebrate the joy of pet adoption together.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {/* Community Preview Cards */}
                            <div className="bg-white rounded-2xl p-6 shadow-md">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center shrink-0">
                                        <Icon icon="mdi:account-group" className="w-6 h-6 text-green-700" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">First Time Adopter Tips</h3>
                                        <p className="text-sm text-gray-500 mb-2">Posted by Sarah M. • 2 hours ago</p>
                                        <p className="text-gray-700 mb-3">Just brought home my first rescue dog! Here are some tips that helped me prepare...</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Icon icon="message-circle" className="w-4 h-4" /> 24 replies</span>
                                            <span className="flex items-center gap-1"><Icon icon="thumb-up" className="w-4 h-4" /> 156 likes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-md">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center shrink-0">
                                        <Icon icon="mdi:share" className="w-6 h-6 text-orange-700" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">Success Stories</h3>
                                        <p className="text-sm text-gray-500 mb-2">Posted by Mike R. • 5 hours ago</p>
                                        <p className="text-gray-700 mb-3">One year ago today, I adopted Luna. She has completely changed my life for the better...</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><Icon icon="message-circle" className="w-4 h-4" /> 48 replies</span>
                                            <span className="flex items-center gap-1"><Icon icon="thumb-up" className="w-4 h-4" /> 320 likes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                                        <Icon icon="mdi:forum" className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-xl text-gray-900 mb-3">Discussion Forums</h4>
                                <p className="text-gray-600 leading-relaxed">Ask questions and get advice from experienced pet owners. Active discussions on training, health, and more.</p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-linear-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center">
                                        <Icon icon="mdi:share" className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-xl text-gray-900 mb-3">Share Stories</h4>
                                <p className="text-gray-600 leading-relaxed">Celebrate your adoption journey and inspire others. Share photos, milestones, and heartwarming moments.</p>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-linear-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                                        <Icon icon="mdi:account-group" className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-xl text-gray-900 mb-3">Connect with Others</h4>
                                <p className="text-gray-600 leading-relaxed">Build friendships with fellow pet lovers in your area. Join local meetups and playdate groups.</p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Join the Conversation?</h3>
                            <p className="text-gray-600 mb-6">Create your free account to access our community forums and connect with fellow pet lovers.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    className="text-lg bg-green-700 hover:bg-green-800 text-white font-bold rounded-full px-8 py-6"
                                    asChild
                                >
                                    <Link href="/register">Sign Up Now</Link>
                                </Button>
                                <Button
                                    className="text-lg bg-transparent hover:bg-gray-50 text-gray-900 font-bold rounded-full px-8 py-6 border-2 border-gray-300"
                                    asChild
                                >
                                    <Link href="/login">Already a Member? Login</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </>
    );
}