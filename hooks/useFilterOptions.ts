import {useState, useEffect} from "react";
import {generalService, Tag} from "@/services/generalServices";
import {Status} from "@/types/general";
import axios from "axios";
import {GetAllParams, UserProfile} from "@/types";

interface UseFilterOptionsResult<T> {
    options: T[];
    isLoading: boolean;
    error: Error | null;
    setSearch: (search: string) => void;
    setPage: (page: number) => void;
    loadMore: () => void;
    hasMore: boolean;
}

function useFilterOptions<T>(
    fetcher: (type: string, signal: AbortSignal, page: number, search?: string) => Promise<T[]>,
    type?: string,
    fetchOnMount: boolean = true
): UseFilterOptionsResult<T> {
    const [options, setOptions] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        if (!fetchOnMount || !type) return;

        const abortController = new AbortController();

        const fetchOptions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await fetcher(type, abortController.signal, page, search);

                if (page === 1) {
                    setOptions(data);
                } else {
                    setOptions(prev => [...prev, ...data]);
                }

                setHasMore(data.length > 0);
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
    }, [type, fetchOnMount, fetcher, search, page]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return {options, isLoading, error, setSearch, setPage, loadMore, hasMore};
}

export const useTagsOptions = (type?: string, fetchOnMount: boolean = true) =>
    useFilterOptions<Tag>(generalService.getTags, type, fetchOnMount);

export const useStatusesOptions = (type?: string, fetchOnMount: boolean = true) =>
    useFilterOptions<Status>(generalService.getStatuses, type, fetchOnMount);

export function useUsersOptions(fetchOnMount: boolean = true) {
    const [options, setOptions] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        if (!fetchOnMount) return;

        const abortController = new AbortController();

        const fetchOptions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await generalService.getUsers(
                        {
                            page,
                            search,
                        } as GetAllParams,
                        abortController.signal,
                    )
                ;

                if (page === 1) {
                    setOptions(data.map(user => ({...user, name: user.email})));
                } else {
                    setOptions(prev => [...prev, ...data.map(user => ({...user, name: user.email}))]);
                }

                setHasMore(data.length > 0);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();

        return () => abortController.abort();
    }, [fetchOnMount, search, page]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return {options, isLoading, error, setSearch, setPage, loadMore, hasMore};
}
