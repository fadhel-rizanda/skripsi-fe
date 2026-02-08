"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { petService } from "@/services/petServices";
import { PetDetail } from "@/types/pet";
import { ANIMAL_TYPES } from "@/lib/constants/pet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Heart,
  Calendar,
  Ruler,
  PawPrint,
  MessageCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function DetailPetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const petId = searchParams.get("id");

  const [pet, setPet] = useState<PetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adoptionLoading, setAdoptionLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchPetDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await petService.getPetById(petId!);
      setPet(response);
    } catch (error: unknown) {
      console.error("Failed to fetch pet details:", error);
      toast.error("Failed to load pet details");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    if (petId) {
      fetchPetDetail();
    } else {
      router.push("/find-pet");
    }
  }, [petId, router, fetchPetDetail]);

  const handleAdoption = async () => {
    if (!pet) return;

    try {
      setAdoptionLoading(true);
      await petService.adoptPet(petId!);
      toast.success("Adoption request sent successfully!");
      fetchPetDetail();
    } catch (error: unknown) {
      type ErrorWithResponse = {
        response?: { data?: { message?: string } };
      };

      const errorMessage =
        (typeof error === "object" &&
          error &&
          "response" in error &&
          (error as ErrorWithResponse).response?.data?.message) ||
        "Failed to send adoption request";

      toast.error(errorMessage);
      console.error(error);
    } finally {
      setAdoptionLoading(false);
    }
  };

  const getAnimalTypeName = (typeId: string) => {
    const animalType = ANIMAL_TYPES.find((type) => type.value === typeId);
    return animalType?.label || typeId;
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      ageYears--;
    }

    if (ageYears < 1) {
      const months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
      return `${months} month${months !== 1 ? "s" : ""}`;
    }

    return `${ageYears} year${ageYears !== 1 ? "s" : ""}`;
  };

  const nextImage = () => {
    if (pet && pet.profile_pictures.length > 0) {
      setSelectedImageIndex(
        (prev) => (prev + 1) % pet.profile_pictures.length
      );
    }
  };

  const prevImage = () => {
    if (pet && pet.profile_pictures.length > 0) {
      setSelectedImageIndex(
        (prev) =>
          (prev - 1 + pet.profile_pictures.length) %
          pet.profile_pictures.length
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Pet not found</h2>
        <p className="text-muted-foreground mb-4">
          The pet you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button onClick={() => router.push("/find-pet")}>
          Back to Find Pet
        </Button>
      </div>
    );
  }

  const currentImage =
    pet.profile_pictures.length > 0
      ? pet.profile_pictures[selectedImageIndex]?.public_url
      : null;

  return (
    <div className="min-h-screen bg-[#eaf5ea]">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
              {currentImage ? (
                <>
                  <Image
                    src={currentImage}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  {pet.profile_pictures.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PawPrint className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>

            {pet.profile_pictures.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {pet.profile_pictures.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-16 w-16 flex-none rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-transparent hover:border-green-300"
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={image.public_url}
                        alt={`${pet.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Card className="rounded-2xl shadow-xl border-0 bg-white/95">
            <CardContent className="p-6 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  {pet.name}
                </h1>
                {pet.about && (
                  <p className="text-slate-600 mt-4 leading-relaxed">
                    {pet.about}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  About {pet.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      <PawPrint className="h-4 w-4 text-green-600" />
                    </span>
                    <span>Species: {getAnimalTypeName(pet.type_of_animal_id)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </span>
                    <span>Age: {calculateAge(pet.date_of_birth)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      <Heart className="h-4 w-4 text-green-600" />
                    </span>
                    <span>Gender: {pet.gender}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      <PawPrint className="h-4 w-4 text-green-600" />
                    </span>
                    <span>Breed: {pet.breed}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      <Ruler className="h-4 w-4 text-green-600" />
                    </span>
                    <span>Size: {pet.size}</span>
                  </div>
                </div>
              </div>

              {pet.physique_tags && pet.physique_tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Physique
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pet.physique_tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pet.personality_tags && pet.personality_tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Personality
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pet.personality_tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pet.additional_records && pet.additional_records.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Additional Records
                  </h3>
                  <div className="space-y-2">
                    {pet.additional_records.map((record) => (
                      <a
                        key={record.id}
                        href={record.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                      >
                        <span className="text-sm text-slate-700 truncate">
                          {record.filename}
                        </span>
                        <span className="text-slate-400">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white shadow-md"
                  size="lg"
                  onClick={handleAdoption}
                  disabled={adoptionLoading}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  {adoptionLoading ? "Sending..." : "Adopt Me"}
                </Button>
                <Button
                  size="lg"
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat with Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
