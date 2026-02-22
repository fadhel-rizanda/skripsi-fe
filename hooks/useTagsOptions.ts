import { useState, useEffect } from 'react';
import { generalService } from '@/services/generalServices';
import { useSession } from 'next-auth/react';

interface Tag {
    id: string;
    name: string;
    slug?: string;
}

export function useTagsOptions(type: string) {
    const { data: session, status } = useSession();
    const [options, setOptions] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        // Don't fetch if session is loading or no session
        if (status === 'loading') {
            return;
        }

        if (!session?.user?.accessToken) {
            console.warn('[useTagsOptions] No access token available');
            setIsLoading(false);
            setError('Not authenticated');
            return;
        }

        fetchTags();
    }, [page, search, type, session?.user?.accessToken, status]);

    const fetchTags = async () => {
        try {
            console.log(`[useTagsOptions] Fetching ${type} tags, page: ${page}, search: ${search}`);
            setIsLoading(true);
            setError(null);
            
            const data = await generalService.getTags(type, undefined, page, search);

            console.log(`[useTagsOptions] Received ${data?.length || 0} tags`, data);

            if (page === 1) {
                setOptions(data || []);
            } else {
                setOptions(prev => [...prev, ...(data || [])]);
            }

            // Check if there are more results (heuristic: if we got 10+ items, assume there's more)
            setHasMore((data?.length || 0) >= 10);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`[useTagsOptions] Error fetching ${type} tags:`, err);
            setError(errorMsg);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    return {
        options,
        isLoading,
        error,
        setSearch,
        loadMore,
        hasMore,
    };
}