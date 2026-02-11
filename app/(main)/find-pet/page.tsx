"use client";

import {useState, useEffect, useRef} from "react";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { PetFilterBar } from "@/components/filter/PetFilterBar";
import { PetCard } from "@/components/card/PetCard";
import { Pet, PetFilterState } from "@/types/pet";
import { petService } from "@/services/petServices";

export default function FindPetPage() {
  // State Management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pets, setPets] = useState<Pet[]>([]);
  
  // Total data dari database (bukan panjang array saat ini)
  const [totalData, setTotalData] = useState(0); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State untuk filter
  const [filters, setFilters] = useState<PetFilterState>({});
  const requestIdRef = useRef(0);

  useEffect(() => {
    const abortController = new AbortController();
    const currentRequestId = ++requestIdRef.current;
    
    async function fetchPets() {
      setLoading(true);
      setError("");
      
      try {
        const response = await petService.getPetsPublic({
          page,
          limit,
          ...filters
        }, abortController.signal);

        if (requestIdRef.current === currentRequestId) {
          setPets(Array.isArray(response.data) ? response.data : []);
          setTotalData(response.total || 0);
        }

      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error(err);
        setError("Failed to load pet data. Please try again later.");
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoading(false);
        }
      }
    }

    // Fetch dijalankan setiap kali page, limit, atau filters berubah
    fetchPets();
    
    // Cleanup: abort ongoing request if dependencies change
    return () => {
      abortController.abort();
    };
  }, [page, limit, filters]); 

  // Handler untuk mengubah filter (nanti dipassing ke PetFilterBar)
  const handleFilterChange = (newFilters: PetFilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset ke halaman 1 setiap kali filter berubah
  };

  return (
    // PERBAIKAN: Mengganti style inline dengan Tailwind arbitrary value
    <main className="mx-auto min-h-screen flex flex-col bg-[#E7F3E7]">
      <section className="mb-4 flex flex-col items-center w-full gap-4 px-4 mt-6">
        {/* Heading Section */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-sans text-3xl md:text-[48px] font-bold mb-2">Find Your New Best Friend</h2>
          <p className="font-sans text-base md:text-[18px] font-normal max-w-2xl mb-4 text-gray-700">
            Browse our adorable and adoptable pets. Your new companion is just a click
            away. Use the filters to find the perfect match for your family.
          </p>
        </div>

        {/* Filter Section */}
        <div className="w-full flex justify-center mb-2">
          <PetFilterBar onFilterChange={handleFilterChange} />
        </div>

        {/* Content Section */}
        <div className="w-full max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
          {loading && <div className="col-span-full text-lg font-medium text-gray-600 text-center font-sans">Loading pets...</div>}
          
          {error && <div className="col-span-full text-red-500 font-medium text-center font-sans">{error}</div>}
          
          {!loading && !error && pets.length === 0 && (
            <div className="col-span-full text-gray-500 italic text-center font-sans">No pets found with these filters.</div>
          )}

          {!loading && !error && pets.map((pet, index) => (
            <PetCard
              key={pet.id}
              name={pet.name}
              type={pet.type_of_animal_name}
              age={`${pet.age} ${pet.age_unit}`}
              imageUrl={pet.profile_picture}
              priority={index < 4}
            />
          ))}
        </div>
      </section>

      <footer className="mt-auto pb-8 pt-4">
        <PaginationBar
          current_page={page}
          total={totalData} // Gunakan total dari backend
          per_page={limit}
          onPageChange={setPage}
          onRowsPerPageChange={setLimit}
        />
      </footer>
    </main>
  );
}