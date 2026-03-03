"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { petService } from "@/services/petServices";
import { Pet } from "@/types/pet";
import { Tag as AnimalTag } from "@/types/general";
import { isValidUrl } from "@/lib/utils";
import { downloadAttachment } from "@/lib/attachment-helpers";
import { Attachment } from "@/types/attachment";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Heart,
  Ruler,
  PawPrint,
  MessageCircle,
  AlertCircle,
  Edit,
  Mars,
  Venus,
  Tag,
  Cake,
  FileText,
  Download,
  MapPin,
  Link2,
} from "lucide-react";
import { generalService } from "@/services/generalServices";
import { userService } from "@/services/userServices";
import ChatButton from "@/components/button/ChatButton";
// Edit form moved to separate page; navigation used instead of dialog

export default function DetailPetPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [adoptionLoading, setAdoptionLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // dialog state removed; navigation to edit page is used instead
  const [animalTypes, setAnimalTypes] = useState<AnimalTag[]>([]);

  const { data: session, update } = useSession();
  // Support both shapes: `session.user.role` can be a string or an object { name }
  const _role = session?.user?.role;
  const roleName = _role?.name;
  const isProvider = !!roleName && String(roleName).toLowerCase() === "provider";

  // Handler download khusus untuk additional record
  const handleDownload = async (attachment: Attachment) => {
    try {
      toast.info("Preparing download...");
      await downloadAttachment(attachment, (pct) => {
        console.log(`Downloading: ${pct}%`);
      });
      toast.success("Download started!");
    } catch (error: unknown) {
      console.error("Download failed:", error);
      type ErrorWithResponse = { response?: { status?: number } };
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as ErrorWithResponse).response?.status === 403
      ) {
        toast.error("Access denied. You do not have permission to download this file.");
      } else {
        toast.error("Failed to download file.");
      }
    }
  };

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
      router.push("/pets");
    }
  }, [petId, router, fetchPetDetail]);

  useEffect(() => {
    if (!pet) {
      setSelectedImageIndex(0);
      return;
    }
    const picsLen = (pet.profile_pictures ?? []).length;
    if (picsLen === 0) {
      setSelectedImageIndex(0);
    } else if (selectedImageIndex >= picsLen) {
      setSelectedImageIndex(0);
    }
  }, [pet, selectedImageIndex]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const types = await generalService.getAnimalTypes();
        if (mounted) setAnimalTypes(types);
      } catch (err) {
        console.error("Failed to load animal types", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAdoption = async () => {
    if (!pet) return;
    try {
      setAdoptionLoading(true);
      const response = await petService.adoptPet(petId!);
      const { channels } = await userService.userChannels();
      await update({ channels });
      toast.success("Adoption request sent successfully!");
      router.push(`/adoption/${response.data.id}`);
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

  const getAnimalTypeName = (typeId: string | number) => {
    const idStr = String(typeId);
    const found = animalTypes.find((t) => String(t.id) === idStr);
    return found ? found.name : idStr;
  };

  const renderGenderIcon = (gender?: string) => {
    if (!gender) return null; // Or use a generic icon like <Circle />
    const g = gender.toLowerCase();
    if (g.startsWith("m")) return <Mars className="h-4 w-4 text-green-600" />;
    if (g.startsWith("f")) return <Venus className="h-4 w-4 text-green-600" />;
    return null; // Or use a generic icon like <Circle />
  };

  if (loading) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 lg:max-w-7xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-4 sm:gap-x-6 md:gap-x-8 justify-center items-start">
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
        <Button onClick={() => router.push("/pets")}>
          Back to Find Pet
        </Button>
      </div>
    );
  }

  const currentImageRaw =
    (pet.profile_pictures ?? []).length > 0
      ? (pet.profile_pictures ?? [])[selectedImageIndex]?.public_url
      : null;
  const currentImage = isValidUrl(currentImageRaw ?? "") ? currentImageRaw : null;

  return (
    <div className="min-h-screen bg-[#eaf5ea]">
      <div className="w-full mx-auto px-4 lg:px-12 py-12 lg:max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 sm:gap-x-6 md:gap-x-8 justify-center items-start">
          <div className="space-y-4 w-full md:w-138 md:flex-none mx-auto md:mx-0">
            <div className="relative w-full h-96 md:h-auto md:aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
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
                  {/* Image navigation arrows removed */}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PawPrint className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>

            {(pet.profile_pictures ?? []).length > 1 && (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto justify-center md:justify-start px-2 md:px-0">
                {pet.profile_pictures?.map((image, index) => {
                  const thumbSrc = isValidUrl(image.public_url ?? "") ? image.public_url : null;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 flex-none rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === index
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-transparent hover:border-green-300"
                        }`}
                    >
                      <div className="relative w-full h-full">
                        {thumbSrc ? (
                          <Image
                            src={thumbSrc}
                            alt={`${pet.name} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="96px"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                            <PawPrint className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Card className="rounded-2xl shadow-xl border-0 bg-white/95 w-full md:w-138 md:flex-none mx-auto md:mx-0 p-8!">
            <CardContent className="space-y-6 text-base p-0!">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-[48px] font-bold text-slate-900">
                  {pet.name}
                </h1>
                {pet.about && (
                  <p className="text-slate-600 mt-4 leading-relaxed">
                    {pet.about}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900">
                  About {pet.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      <PawPrint className="h-4 w-4 text-green-600" />
                    </span>
                    <span>Species: {pet.type_of_animal_id ? getAnimalTypeName(pet.type_of_animal_id) : "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      <Cake className="h-4 w-4 text-green-600" />
                    </span>
                    <span>Age: {pet.age} {pet.age_unit}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      {renderGenderIcon(pet.gender)}
                    </span>
                    <span>Gender: {pet.gender}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="p-2 rounded-lg bg-green-100">
                      <Tag className="h-4 w-4 text-green-600" />
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
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-base"
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
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-base"
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
                    {pet.additional_records.map((record) => {
                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                        >
                          <div
                            className="flex items-center gap-3 flex-1 min-w-0"
                          >
                            <span className="text-slate-400 flex-none">
                              <FileText className="h-5 w-5 text-green-600" />
                            </span>
                            <span className="text-base text-slate-700 truncate">
                              {record.filename}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={e => {
                              e.preventDefault();
                              if (record?.id) handleDownload(record as Attachment);
                            }}
                            className={`text-slate-400 flex-none ml-2 ${!record?.id ? "opacity-50 cursor-not-allowed" : ""}`}
                            aria-label="Download file"
                            disabled={!record?.id}
                          >
                            <Download className="h-5 w-5 hover:text-green-700" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {pet.address && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">Address</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="p-2 rounded-lg bg-green-100 flex-none">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </span>
                      <span className="leading-relaxed break-words overflow-hidden">
                        {[
                          pet.address.street,
                          pet.address.district?.name,
                          pet.address.regency?.name,
                          pet.address.province?.name,
                          pet.address.zip_code,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>

                    {pet.address.link && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="p-2 rounded-lg bg-green-100 flex-none">
                          <Link2 className="h-4 w-4 text-green-600" />
                        </span>
                        <a
                          href={pet.address.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 font-medium underline underline-offset-2 break-all overflow-hidden"
                        >
                          View Location on Maps
                        </a>
                      </div>
                    )}

                    {pet.address.notes && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="p-2 rounded-lg bg-green-100 flex-none">
                          <FileText className="h-4 w-4 text-green-600" />
                        </span>
                        <span className="leading-relaxed italic break-words overflow-hidden">
                          {pet.address.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}



              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  className="bg-[#19E619] hover:bg-green-500 text-black shadow-md"
                  size="lg"
                  onClick={handleAdoption}
                  disabled={adoptionLoading}
                >
                  <Heart className="mr-2 h-5 w-5 text-black" />
                  {adoptionLoading ? "Sending..." : "Adopt Me"}
                </Button>
                {isProvider ? (
                  <Button
                    size="lg"
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800"
                    onClick={() => router.push(`/pets/${pet.id}/edit`)}
                  >
                    <Edit className="mr-2 h-5 w-5" />
                    Edit Information
                  </Button>
                ) : (
                  <ChatButton
                    targetUserId={pet.user_id}
                    label="Chat with Provider"
                    size="lg"
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800"
                    iconClassName="mr-2 h-5 w-5 text-slate-800"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
