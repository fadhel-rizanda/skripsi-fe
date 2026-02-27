import React, { useState, useEffect } from "react";
import { generalService } from "@/services/generalServices";
import {District, Province, Regency, Status, Tag} from "@/types/general";
import axios from "axios";
import { GetAllParams, UserProfile } from "@/types";

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

    return { options, isLoading, error, setSearch, setPage, loadMore, hasMore };
}

export const useTagsOptions = (type?: string, fetchOnMount: boolean = true) =>
    useFilterOptions<Tag>(generalService.getTags, type, fetchOnMount);

export const useStatusesOptions = (type?: string, fetchOnMount: boolean = true) =>
    useFilterOptions<Status>(generalService.getStatuses, type, fetchOnMount);

const fetchRoles = (_: string, signal: AbortSignal, page: number, search?: string) =>
    generalService.getRoles(signal, page, search);

export const useRolesOptions = (fetchOnMount: boolean = true) => {
    const { options, ...rest } = useFilterOptions<{ id: string, name: string }>(
        fetchRoles,
        "roles", // a dummy type is passed to satisfy the hook signature, it is ignored in fetcher
        fetchOnMount
    );

    const capitalizedOptions = React.useMemo(() => options.map(role => ({
        ...role,
        name: role.name.charAt(0).toUpperCase() + role.name.slice(1)
    })), [options]);

    return { options: capitalizedOptions, ...rest };
}

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
                    setOptions(data.map(user => ({ ...user, name: user.email })));
                } else {
                    setOptions(prev => [...prev, ...data.map(user => ({ ...user, name: user.email }))]);
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

    return { options, isLoading, error, setSearch, setPage, loadMore, hasMore };
}

export function useProvincesOptions(fetchOnMount: boolean = true) {
    const [options, setOptions] = useState<Province[]>([]);
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
                const data = await generalService.getProvinces(
                    {
                        page,
                        search,
                    } as GetAllParams,
                    abortController.signal,
                )
                    ;

                if (page === 1) {
                    setOptions(data.map(province => ({ ...province, name: province.name })));
                } else {
                    setOptions(prev => [...prev, ...data.map(province => ({ ...province, name: province.name }))]);
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

    return { options, isLoading, error, setSearch, setPage, loadMore, hasMore };
}

export function useRegenciesOptions(provinceId: string, fetchOnMount: boolean = true) {
    const [options, setOptions] = useState<Regency[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        setOptions([]);
        setPage(1);
        setHasMore(true);
    }, [provinceId]);

    useEffect(() => {
        if (!fetchOnMount || !provinceId) {
            setOptions([]);
            return;
        }

        const abortController = new AbortController();

        const fetchOptions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await generalService.getRegencies(
                    provinceId,
                    { page, search } as GetAllParams,
                    abortController.signal,
                );

                const formattedData = data.map(regency => ({ ...regency, name: regency.name }));

                if (page === 1) {
                    setOptions(formattedData);
                } else {
                    setOptions(prev => [...prev, ...formattedData]);
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
    }, [fetchOnMount, search, page, provinceId]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return { options, isLoading, error, setSearch, setPage, loadMore, hasMore };
}

export function useDistrictsOptions(regencyId: string, fetchOnMount: boolean = true) {
    const [options, setOptions] = useState<District[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [search, setSearch] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        setOptions([]);
        setPage(1);
        setHasMore(true);
    }, [regencyId]);

    useEffect(() => {
        if (!fetchOnMount || !regencyId) {
            setOptions([]);
            return;
        }

        const abortController = new AbortController();

        const fetchOptions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await generalService.getDistricts(
                    regencyId,
                    {
                        page,
                        search,
                    } as GetAllParams,
                    abortController.signal,
                );

                const formattedData = data.map(district => ({ ...district, name: district.name }));

                if (page === 1) {
                    setOptions(formattedData);
                } else {
                    setOptions(prev => [...prev, ...formattedData]);
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

    }, [fetchOnMount, search, page, regencyId]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return { options, isLoading, error, setSearch, setPage, loadMore, hasMore };
}