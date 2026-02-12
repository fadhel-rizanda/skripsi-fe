import { useState, useEffect } from "react";
import { generalService, Tag } from "@/services/generalServices";
import { Status } from "@/types/general";
import axios from "axios";

interface UseFilterOptionsResult<T> {
  options: T[];
  isLoading: boolean;
  error: Error | null;
}

function useFilterOptions<T>(
    fetcher: (type: string, signal: AbortSignal) => Promise<T[]>,
    type?: string,
    fetchOnMount: boolean = true
): UseFilterOptionsResult<T> {
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fetchOnMount || !type) return;

    const abortController = new AbortController();

    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetcher(type, abortController.signal);
        setOptions(data);
      } catch (err) {
        if (
            (err instanceof Error && err.name === "AbortError") ||
            axios.isCancel(err)
        ) {
          return;
        }
        setError(err as Error);
        console.error(`Failed to fetch options for type ${type}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();

    return () => {
      abortController.abort();
    };
  }, [type, fetchOnMount, fetcher]);

  return { options, isLoading, error };
}

export const useTagsOptions = (type?: string, fetchOnMount: boolean = true) =>
    useFilterOptions<Tag>(generalService.getTags, type, fetchOnMount);

export const useStatusesOptions = (type?: string, fetchOnMount: boolean = true) =>
    useFilterOptions<Status>(generalService.getStatuses, type, fetchOnMount);