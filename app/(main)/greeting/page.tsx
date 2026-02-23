"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import PersonalityForm from "@/components/greeting-page/PersonalityForm";
import PetExperiencesForm from "@/components/greeting-page/PetTypeForm";
import { toast } from "sonner";

export default function GreetingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [personality, setPersonality] = useState<string | null>(null);
  const [petType, setPetType] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!personality || !petType) {
      toast.error("Incomplete Form", {
        description: "Please complete all sections first."
      });
      return;
    }

    router.push("/find-pet");
  };

  // Redirect if not authenticated or not an adopter
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Check if user role is "adopter"
    if (session.user?.role?.name !== "adopter") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show error if user is not an adopter
  if (session?.user?.role?.name !== "adopter") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">This page is only for adopters.</p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tell us about yourself{" "}
            <span className="font-black">{session?.user?.name}</span>!
          </h1>

          <p className="text-xl text-gray-600">
            This will help us find the perfect companion for you.
          </p>
        </div>

        <section className="flex flex-col gap-10 justify-center">
          <PersonalityForm value={personality} onChange={setPersonality} />
          <PetExperiencesForm value={petType} onChange={setPetType} />

          <div className="flex items-center justify-between mt-6">
            <Button
              asChild
              className="py-6 bg-transparent hover:bg-transparent rounded-lg text-md text-black"
            >
              <Link href="/dashboard">Skip for now</Link>
            </Button>

            <Button
              onClick={handleSubmit}
              className="py-6 bg-green-500 hover:bg-green-600 rounded-lg text-md font-bold"
            >
              Save & Continue
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
