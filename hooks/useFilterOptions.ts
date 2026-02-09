import { useState, useEffect } from "react";
import { generalService, Tag } from "@/services/generalServices";

interface UseFilterOptionsResult {
  options: Tag[];
  isLoading: boolean;
  error: Error | null;
}

export const useFilterOptions = (
  type?: string,
  fetchOnMount: boolean = true
): UseFilterOptionsResult => {
  const [options, setOptions] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fetchOnMount || !type) return;

    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await generalService.getTags(type);
        setOptions(data);
      } catch (err) {
        setError(err as Error);
        console.error(`Failed to fetch options for type ${type}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [type, fetchOnMount]);

  return { options, isLoading, error };
};
