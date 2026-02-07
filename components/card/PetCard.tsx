import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";

interface PetCardProps {
  name: string;
  type: string;
  age: string;
  imageUrl: string;
  priority?: boolean;
}

export function PetCard({ name, type, age, imageUrl, priority = false }: PetCardProps) {
  return (
    <Card className="w-full rounded-lg overflow-hidden shadow bg-white flex flex-col p-0">
      <div className="w-full h-40 sm:h-36 md:h-36 lg:h-40 relative flex-shrink-0">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-t-lg"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />
      </div>
      <CardContent className="p-2 sm:p-2.5 md:p-2.5 lg:p-3 flex-1 h-[4.5rem] sm:h-[4.5rem] md:h-[4.5rem] lg:h-20 flex flex-col justify-end">
        <CardTitle className="text-sm sm:text-sm md:text-base lg:text-lg mb-0.5 sm:mb-0.5 md:mb-1 text-gray-900 line-clamp-1">{name}</CardTitle>
        <CardDescription className="text-xs sm:text-xs md:text-xs lg:text-sm text-gray-600 line-clamp-1">{type}, {age}</CardDescription>
      </CardContent>
    </Card>
  );
}
