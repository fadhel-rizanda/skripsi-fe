"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {useSession} from "next-auth/react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

export default function Home() {
    const { data: session } = useSession()
    const faqData = [
        // General
        {
            q: "What is Pawsitive?",
            a: "Pawsitive is a platform that connects adopters and providers to ensure a safe, transparent, and structured pet adoption process, while also offering a community space for pet lovers."
        },
        {
            q: "Who can use this platform?",
            a: "Anyone can use Pawsitive — adopters, providers, and admins — each with different roles in managing and completing the adoption process."
        },
        {
            q: "Is Pawsitive free to use?",
            a: "Yes, creating an account and browsing pets on Pawsitive is completely free. There are no hidden fees for adopters going through the adoption process."
        },

        // Adoption Process
        {
            q: "How does the adoption process work?",
            a: "The process includes applying for adoption, scheduling and completing a meet & greet, submitting and approving requirements, scheduling handover, uploading evidence, and final approval by all parties until the adoption is completed."
        },
        {
            q: "What do I need to start adopting?",
            a: "You need to create and verify an account, choose a pet, submit an adoption request and wait for the provider to continue next process."
        },
        {
            q: "Can I apply for multiple pets at the same time?",
            a: "Yes, adopters can apply for multiple pets simultaneously. Each adoption process is independent and managed separately."
        },
        {
            q: "Can the adoption process be canceled or rejected?",
            a: "Yes, depending on the stage, either party can cancel the process. Open communication between both sides is always encouraged."
        },
        {
            q: "What happens after adoption is completed?",
            a: "The pet's status will be marked as adopted, ownership is transferred, and both parties can continue engaging in the community."
        },

        // Safety & Trust
        {
            q: "How is safety ensured during adoption?",
            a: "Pawsitive uses a structured multi-step process including verification, requirement validation, mutual approvals, and admin oversight to ensure every adoption is safe and responsible."
        },
        {
            q: "Will I get updates during the process?",
            a: "Yes, you will receive notifications for all important actions such as approvals, requirement updates, scheduling, and finalization."
        },

        // Support & Reporting
        {
            q: "How can I get support if I have issues?",
            a: "You can reach our support team anytime at pawsitivehub.site@gmail.com. We aim to respond as quickly as possible."
        },
        {
            q: "How can I report content on Pawsitive?",
            a: "Click the report button on the content you want to flag and fill out the form. Our moderation team will review the report and take appropriate action."
        },
    ];

    return (
        <>
            <main className="min-h-screen">

                {/* Hero Section */}
                <section id="hero" className="relative h-[100svh] min-h-[600px] w-full">
                    {/* Background Image */}
                    <Image
                        src="/assets/hero-bg.jpg"
                        alt="Happy dog"
                        fill
                        className="object-cover object-center"
                        priority
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-16">
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 md:mb-6 max-w-4xl tracking-tight leading-tight">
                            Find Your Perfect <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-yellow-300 drop-shadow-sm">
                                Companion
                            </span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-base sm:text-lg md:text-xl text-white/95 mb-8 md:mb-10 max-w-2xl font-light px-2">
                            Browse thousands of adoptable pets and start your journey to a lifetime of love and companionship.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <Button
                                className="text-base md:text-lg bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-full px-6 py-6 md:px-8 md:py-7 shadow-lg shadow-orange-500/30 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                                asChild
                            >
                                <Link href="/pets">Browse Pets Now</Link>
                            </Button>
                        </motion.div>

                        {/* Floating Glassmorphism Badge */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="absolute bottom-16 right-4 sm:right-8 md:bottom-24 md:right-16 flex items-center gap-3 md:gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 md:p-4 rounded-2xl shadow-2xl animate-bounce scale-[0.8] sm:scale-90 md:scale-100 origin-bottom-right" style={{ animationDuration: '3s' }}>
                            <div className="bg-green-500 text-white p-2.5 md:p-3 rounded-full shadow-lg shadow-green-500/30">
                                <Icon icon="mdi:paw" className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold text-sm md:text-base">Every match starts a new story.</p>
                            </div>
                        </motion.div>

                        {/* Secondary Floating Element */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="absolute top-24 left-4 sm:left-8 md:top-32 md:left-16 flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 md:p-3 rounded-full shadow-xl animate-pulse scale-[0.8] sm:scale-90 md:scale-100 origin-top-left" style={{ animationDuration: '4s' }}>
                            <div className="bg-red-400 text-white p-2 rounded-full">
                                <Icon icon="mdi:heart" className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <p className="text-white font-semibold pr-2 md:pr-3 text-xs md:text-base">Tiny Tails, Big Futures</p>
                        </motion.div>
                    </div>

                </section>

                {/* Why Pawsitive Section */}
                <section id="why-pawsitive" className="py-16 md:py-24 px-6 bg-gray-50">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
                                Why Adopt with Pawsitive Match?
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                                We&apos;re dedicated to making the adoption process simple, joyful, and rewarding for both you and your new best friend.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1: Save a Life */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 duration-300 border border-gray-100 group">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 mb-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}>
                                    <Icon icon="mdi:heart" className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Save a Life</h3>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                    Give a deserving animal a second chance and a loving forever home. You&apos;re not just getting a pet, you&apos;re saving a life.
                                </p>
                            </motion.div>

                            {/* Card 2: Find Your Best Friend */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 duration-300 border border-gray-100 group">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 mb-6 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}>
                                    <Icon icon="mdi:paw" className="w-10 h-10 text-orange-600" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Find Your Best Friend</h3>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                    Our detailed profiles and smart filters help you find a companion that perfectly matches your lifestyle and personality.
                                </p>
                            </motion.div>

                            {/* Card 3: Join a Community */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 duration-300 border border-gray-100 group">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 mb-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" style={{ borderRadius: '50% 50% 70% 30% / 30% 70% 30% 70%' }}>
                                    <Icon icon="mdi:account-group" className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Join a Community</h3>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                    Connect with a passionate community of pet lovers, share stories, and get support throughout your adoption journey.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-16 md:py-24 px-6 bg-white">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
                                How It Works
                            </h2>
                            <p className="text-base md:text-lg text-gray-600">
                                Adopting a pet is as easy as 1–2–3.
                            </p>
                        </motion.div>

                        <div className="relative">
                            {/* Connecting Line */}
                            <motion.div 
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                                className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gray-300 origin-left" 
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                                {/* Step 1: Browse Pets */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="text-center group cursor-default">
                                    <div className="relative inline-flex items-center justify-center w-28 h-28 bg-green-600 group-hover:bg-orange-500 rounded-full mb-6 z-10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-500/40">
                                        <span className="text-5xl font-bold text-white transition-transform duration-500 group-hover:-rotate-12">1</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-green-700 transition-colors duration-300">Browse Pets</h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                                        Explore our extensive listings of adorable, adoptable pets from shelters and rescues near you.
                                    </p>
                                </motion.div>

                                {/* Step 2: Apply to Adopt */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="text-center group cursor-default">
                                    <div className="relative inline-flex items-center justify-center w-28 h-28 bg-green-600 group-hover:bg-orange-500 rounded-full mb-6 z-10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-500/40 delay-100">
                                        <span className="text-5xl font-bold text-white transition-transform duration-500 group-hover:-rotate-12">2</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-green-700 transition-colors duration-300 delay-100">Apply to Adopt</h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 delay-100">
                                        Found a potential match? Fill out a simple online application to start the adoption process.
                                    </p>
                                </motion.div>

                                {/* Step 3: Welcome Home */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="text-center group cursor-default">
                                    <div className="relative inline-flex items-center justify-center w-28 h-28 bg-green-600 group-hover:bg-orange-500 rounded-full mb-6 z-10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-500/40 delay-200">
                                        <span className="text-5xl font-bold text-white transition-transform duration-500 group-hover:-rotate-12">3</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 group-hover:text-green-700 transition-colors duration-300 delay-200">Welcome Home</h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 delay-200">
                                        After approval, arrange a meet-and-greet and prepare to welcome your new furry family member home!
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Community Section */}
                <section id="community" className="py-16 md:py-24 px-6 bg-linear-to-br from-green-50 to-green-100">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
                                Join Our Community
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                                Connect with thousands of pet lovers, share experiences, get advice, and celebrate the joy of pet adoption together.
                            </p>
                        </motion.div>

                        {/* Community Highlights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {/* Community Preview Cards */}
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-md flex items-start gap-4"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                    <Icon icon="mdi:forum-outline" className="w-6 h-6 text-green-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1">A Space to Share & Learn</h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                        Our community forums are open to all ask questions, share adoption tips,
                                        or post a milestone. Whether you're preparing to adopt or already a proud
                                        pet parent, there's a place for you here.
                                    </p>
                                    <Link href="/explore/communities" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
                                        Explore Forums <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 shadow-md flex items-start gap-4"
                            >
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                    <Icon icon="mdi:heart-outline" className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1">Every Adoption Has a Story</h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                        The community is built on real experiences from the nervous first day
                                        to the moment it clicks. Share your journey and inspire the next
                                        person who's still deciding.
                                    </p>
                                    <Link href="/explore/posts" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                                        Share Your Story <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                                        <Icon icon="mdi:forum" className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-lg md:text-xl text-gray-900 mb-2 md:mb-3">Discussion Forums</h4>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">Ask questions and get advice from experienced pet owners. Active discussions on training, health, and more.</p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-linear-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center">
                                        <Icon icon="mdi:share" className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-lg md:text-xl text-gray-900 mb-2 md:mb-3">Share Stories</h4>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">Celebrate your adoption journey and inspire others. Share photos, milestones, and heartwarming moments.</p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-linear-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                                        <Icon icon="mdi:account-group" className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h4 className="font-bold text-lg md:text-xl text-gray-900 mb-2 md:mb-3">Connect with Others</h4>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">Build friendships with fellow pet lovers in your area. Join local meetups and playdate groups.</p>
                            </motion.div>
                        </div>

                        {/* CTA */}
                        {
                            !session?.accessToken && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center bg-white rounded-2xl p-6 md:p-8 shadow-lg">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Ready to Join the Conversation?</h3>
                                    <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Create your free account to access our community forums and connect with fellow pet lovers.</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                        <Button
                                            className="w-full sm:w-auto text-base md:text-lg bg-green-700 hover:bg-green-800 text-white font-bold rounded-full px-6 py-5 md:px-8 md:py-6"
                                            asChild
                                        >
                                            <Link href="/register">Sign Up Now</Link>
                                        </Button>
                                        <Button
                                            className="w-full sm:w-auto text-base md:text-lg bg-transparent hover:bg-gray-50 text-gray-900 font-bold rounded-full px-6 py-5 md:px-8 md:py-6 border-2 border-gray-300"
                                            asChild
                                        >
                                            <Link href="/login">Already a Member?</Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            )
                        }
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-16 md:py-24 px-6 bg-white">
                    <div className="container mx-auto max-w-4xl">

                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-base md:text-lg text-gray-600">
                                Everything you need to know about adopting with Pawsitive
                            </p>
                        </motion.div>

                        {/* FAQ Items */}
                        <div className="space-y-3">
                            <Accordion type="single" collapsible className="w-full">
                                {faqData.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <AccordionItem
                                            value={`item-${i}`}
                                            className="bg-gray-50 rounded-2xl px-6 mb-3 border-none hover:bg-gray-100 transition-all"
                                        >
                                            <AccordionTrigger className="font-semibold text-base md:text-lg text-gray-900 hover:no-underline py-5">
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-sm md:text-base text-gray-600 leading-relaxed pb-5">
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </motion.div>
                                ))}
                            </Accordion>
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="text-center mt-12 bg-green-50 rounded-3xl p-8 border border-green-200"
                        >
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                                Still have questions?
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 mb-6">
                                Explore the community or contact our support team anytime.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-5"
                                    asChild
                                >
                                    <Link href="/explore/communities">Visit Community</Link>
                                </Button>
                                <Button
                                    className="bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-full px-6 py-5 border-2 border-gray-300"
                                    asChild
                                >
                                    <Link href="mailto:pawsitivehub.site@gmail.com?subject=Pawsitive%20Support&body=Hello%20Pawsitive%20Team,">
                                        Contact Support
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>

                    </div>
                </section>

            </main>
        </>
    );
}