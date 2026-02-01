import { useEffect, useState } from "react";
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
}

export function PetCard({ name, type, age, imageUrl }: PetCardProps) {
  return (
    <Card className="w-full md:w-48 lg:w-56 rounded-xl md:rounded-2xl overflow-hidden shadow bg-white flex flex-row md:flex-col p-0">
      <div className="w-24 md:w-full h-20 md:h-36 lg:h-40 relative flex-shrink-0">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-l-xl md:rounded-l-none md:rounded-t-2xl"
          sizes="(max-width: 768px) 96px, (max-width: 1024px) 192px, 224px"
          priority
        />
      </div>
      <CardContent className="p-2 md:p-2.5 lg:p-3 flex-1 md:h-18 lg:h-20 flex flex-col justify-center md:justify-end">
        <CardTitle className="text-sm md:text-base lg:text-lg mb-0.5 md:mb-1 text-gray-900 line-clamp-1">{name}</CardTitle>
        <CardDescription className="text-xs md:text-xs lg:text-sm text-gray-600 line-clamp-1">{type}, {age}</CardDescription>
      </CardContent>
    </Card>
  );
}
