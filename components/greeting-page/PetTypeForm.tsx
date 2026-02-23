"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { Textarea } from "@/components/ui/textarea";
import { useTagsOptions } from "@/hooks/useFilterOptions";

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function PetExperiencesForm({ value, onChange }: Props) {
  const {
    options: petExperienceTags,
    isLoading: isLoadingPetExperienceTags,
    error,
    loadMore: loadMorePetExperiences,
    hasMore: hasMorePetExperiences,
  } = useTagsOptions("type_of_animal");

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-left">
          Pet Type Preferences
        </CardTitle>
        <CardDescription className="text-md text-left">
          What type of animals you prefer to have experience with?
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoadingPetExperienceTags ? (
          <div className="text-center py-4 text-gray-500">
            Loading pet experiences...
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Error loading tags: {error.message}
          </div>
        ) : petExperienceTags.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No pet experiences available
          </div>
        ) : (
          <>
            <ToggleGroup
              type="single"
              value={value ?? undefined}
              onValueChange={(val) => onChange(val ?? null)}
              spacing={3}
              className="flex flex-wrap"
            >
              {petExperienceTags.map((tag) => (
                <ToggleGroupItem
                  key={String(tag.id)}
                  value={String(tag.id)}
                  aria-label={tag.name}
                >
                  {tag.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {hasMorePetExperiences && (
              <button
                onClick={loadMorePetExperiences}
                className="mt-4 text-green-600 hover:text-green-700 font-semibold"
              >
                Load More
              </button>
            )}

            <Textarea
              placeholder="Describe your pet experiences"
              className="mt-4"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
