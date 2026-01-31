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
    <Card className="w-56 rounded-2xl overflow-hidden shadow bg-white flex flex-col p-0">
      <div className="w-full h-40 relative">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-t-2xl"
          sizes="224px"
          priority
        />
      </div>
      <CardContent className="p-3 flex-1 flex flex-col justify-end">
        <CardTitle className="text-lg mb-1 text-gray-900">{name}</CardTitle>
        <CardDescription className="text-sm text-gray-600">{type}, {age}</CardDescription>
      </CardContent>
    </Card>
  );
}
