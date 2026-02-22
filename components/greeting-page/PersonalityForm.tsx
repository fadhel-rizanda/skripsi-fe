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

export default function PersonalityForm({ value, onChange }: Props) {
  const {
    options: personalityTags,
    isLoading: isLoadingPersonalityTags,
    error,
    loadMore: loadMorePersonality,
    hasMore: hasMorePersonality,
  } = useTagsOptions("personality");

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-left">
          Personality
        </CardTitle>
        <CardDescription className="text-md text-left">
          What's your living situation?
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoadingPersonalityTags ? (
          <div className="text-center py-4 text-gray-500">
            Loading personality traits...
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Error loading tags: {error.message}
          </div>
        ) : personalityTags.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No personality traits available
          </div>
        ) : (
          <>
            <ToggleGroup type="single" value={value || ""} onValueChange={onChange}>
              <div className="flex flex-wrap gap-2">
                {personalityTags.map((tag) => (
                  <ToggleGroupItem
                    key={tag.id}
                    value={tag.id}
                    aria-label={tag.name}
                    className="px-4 py-2 rounded-full border border-gray-300 hover:bg-green-50"
                  >
                    {tag.name}
                  </ToggleGroupItem>
                ))}
              </div>
            </ToggleGroup>

            {hasMorePersonality && (
              <button
                onClick={loadMorePersonality}
                className="mt-4 text-green-600 hover:text-green-700 font-semibold"
              >
                Load More
              </button>
            )}

            <Textarea placeholder="Describe your personality" className="mt-4" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
