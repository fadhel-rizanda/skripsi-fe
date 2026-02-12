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

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function PetCard({ name, type, age, imageUrl, priority = false }: PetCardProps) {
  const hasValidImage = imageUrl && isValidUrl(imageUrl);

  return (
    <Card className="w-full rounded-lg overflow-hidden shadow bg-white flex flex-col p-0 h-full">
      <div className="w-full h-32 sm:h-36 md:h-36 lg:h-40 relative flex-shrink-0">
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
      </div>
      <CardContent className="p-2 sm:p-2.5 md:p-2.5 lg:p-3 flex flex-col justify-start gap-0.5 min-h-[3rem] sm:min-h-[3.5rem] md:min-h-[4rem] lg:min-h-[4.5rem]">
        <CardTitle className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-900 line-clamp-1">{name}</CardTitle>
        <CardDescription className="text-[10px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 line-clamp-1">{type}, {age}</CardDescription>
      </CardContent>
    </Card>
  );
}
