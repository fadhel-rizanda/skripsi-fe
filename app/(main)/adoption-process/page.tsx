"use client";

import {useState, useEffect, useRef} from "react";
import {PaginationBar} from "@/components/pagination/PaginationBar";
import {AdoptionCard} from "@/components/card/AdoptionCard";
import {Adoption} from "@/types/adoption";
import {adoptionServices} from "@/services/adoptionServices";
import {AdoptionFilterBar} from "@/components/filter/AdoptionFilterBar";
import {AdoptionFilterState} from "@/types";

export default function AdoptionsPage() {
    // Pagination
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState<number | undefined>(undefined);

    // Data
    const [adoptions, setAdoptions] = useState<Adoption[]>([]);
    const [totalData, setTotalData] = useState(0);

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter
    const [filters, setFilters] = useState<AdoptionFilterState>({});
    const requestIdRef = useRef(0);

    useEffect(() => {
        const abortController = new AbortController();
        const currentRequestId = ++requestIdRef.current;

        async function fetchAdoptions() {
            setLoading(true);
            setError("");

            try {
                const response = await adoptionServices.getAllAdoptions(
                    {page: page, per_page: perPage, ...filters},
                    abortController.signal
                );

                if (requestIdRef.current === currentRequestId) {
                    setAdoptions(Array.isArray(response.data) ? response.data : []);
                    setTotalData(response.total || 0);
                    if (typeof response.per_page === 'number' && perPage === undefined) setPerPage(response.per_page);
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;

                if (requestIdRef.current === currentRequestId) {
                    console.error(err);
                    setError("Failed to load adoption-process. Please try again later.");
                }
            } finally {
                if (requestIdRef.current === currentRequestId) {
                    setLoading(false);
                }
            }
        }

        fetchAdoptions().then(r => r);

        return () => {
            abortController.abort();
        };
    }, [page, perPage, filters]);

    const handleFilterChange = (newFilters: AdoptionFilterState) => {
        setFilters(newFilters);
        setPage(1);
    };

    return (
        <main className="mx-auto min-h-screen flex flex-col bg-[#E7F3E7]">
            <section className="mb-4 flex flex-col items-center w-full gap-4 px-4 mt-6">

                {/* Heading */}
                <div className="flex flex-col items-center text-center">
                    <h2 className="font-sans text-3xl md:text-[48px] font-bold mb-2">
                        Adoption Records
                    </h2>
                    <p className="font-sans text-base md:text-[18px] font-normal max-w-2xl mb-4 text-gray-700">
                        View and track all adoption processes including their current stage,
                        status, provider, and adopter information.
                    </p>
                </div>

                {/* Filter Section */}
                <div className="w-full flex justify-center mb-2">
                    <AdoptionFilterBar onFilterChange={handleFilterChange} />
                </div>

                {/* Content */}
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">

                    {loading && (
                        <div className="text-lg font-medium text-gray-600 text-center font-sans">
                            Loading adoptions...
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 font-medium text-center font-sans">
                            {error}
                        </div>
                    )}

                    {!loading && !error && adoptions.length === 0 && (
                        <div className="text-gray-500 italic text-center font-sans">
                            No adoptions found.
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        adoptions.map((adoption) => (
                            <AdoptionCard key={adoption.id} adoption={adoption}/>
                        ))}
                </div>
            </section>

            {/* Pagination */}
            <footer className="mt-auto pb-8 pt-4">
                <PaginationBar
                    current_page={page}
                    total={totalData}
                    per_page={perPage ?? 15}
                    onPageChange={setPage}
                    onDataPerPageChange={setPerPage}
                    dataPerPageOptions={[15, 25, 50, 100]}
                />
            </footer>
        </main>
    );
}
