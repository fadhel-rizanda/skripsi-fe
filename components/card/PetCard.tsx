"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface PetCardProps {
  id: string | number;
  name: string;
  type: string;
  age: string;
  imageUrl: string;
  extraImages?: string[];
  priority?: boolean;
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function PetCard({ id, name, type, age, imageUrl, priority = false }: PetCardProps) {
  const hasValidImage = imageUrl && isValidUrl(imageUrl);
  const router = useRouter();

  const handleOpenDetail = () => {
    router.push(`/pets/${id}`);
  };

  return (
    <Card
      className="w-full rounded-lg overflow-hidden shadow bg-white flex flex-col p-0 gap-0 h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
      onClick={handleOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenDetail();
        }
      }}
    >
      <div className="w-full h-44 sm:h-48 md:h-52 lg:h-56 relative flex-shrink-0">
        {hasValidImage ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
        {/* Extra images badge removed as requested */}
      </div>
      <CardContent className="px-3 pt-2 pb-3 sm:px-3.5 sm:pt-2.5 sm:pb-3.5 md:px-4 md:pt-3 md:pb-4 flex flex-col justify-start gap-0.5">
        <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-900 line-clamp-1">{name}</CardTitle>
        <CardDescription className="text-[11px] sm:text-xs md:text-sm lg:text-sm text-gray-600 line-clamp-1">{type}, {age}</CardDescription>
      </CardContent>
    </Card>
  );
}
