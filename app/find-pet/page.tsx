"use client";

import { useState, useEffect } from "react";
// Pastikan path import ini benar
import { Navbar } from "@/components/navbar/Navbar";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { PetFilterBar } from "@/components/filter/PetFilterBar";
import { PetCard } from "@/components/card/PetCard";

type Pet = {
  id: string | number;
  name: string;
  type_of_animal_name: string;
  age: number | string;
  age_unit: string;
  profile_picture: string;
};

// Tambahan type untuk Filter (opsional, sesuaikan kebutuhan)
type FilterState = {
  type_of_animal_id?: string;
  age?: string;
  tag_personality_id?: string;
  search?: string;
};

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
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    async function fetchPets() {
      setLoading(true);
      setError("");
      
      try {
        // Kirim hanya param yang dibutuhkan backend
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (filters.age) queryParams.set("age", filters.age);
        if (filters.type_of_animal_id) queryParams.set("type_of_animal_id", filters.type_of_animal_id);
        if (filters.tag_personality_id) queryParams.set("tag_personality_id", filters.tag_personality_id);
        if (filters.search) queryParams.set("search", filters.search);

        const res = await fetch(`/api/pet?${queryParams}`);
        
        if (!res.ok) throw new Error("Failed to fetch pets");
        
        const responseJson = await res.json();
        
        // Gunakan total dari backend jika ada, fallback ke data.length
        setPets(Array.isArray(responseJson.data) ? responseJson.data : []);
        setTotalData(
          typeof responseJson.total === "number"
            ? responseJson.total
            : responseJson.meta?.total || responseJson.data.length || 0
        );

      } catch (err) {
        console.error(err);
        setError("Gagal memuat data hewan. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    }

    // Fetch dijalankan setiap kali page, limit, atau filters berubah
    fetchPets();
  }, [page, limit, filters]); 

  // Handler untuk mengubah filter (nanti dipassing ke PetFilterBar)
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset ke halaman 1 setiap kali filter berubah
  };

  return (
    // PERBAIKAN: Mengganti style inline dengan Tailwind arbitrary value
    <main className="mx-auto min-h-screen flex flex-col justify-between bg-[#E7F3E7]">
      
      <header className="sticky top-0 z-50 mb-6">
        <Navbar />
      </header>

      <section className="flex-1 mb-4 flex flex-col items-center w-full gap-4 px-4">
        {/* Heading Section */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-[48px] font-bold mb-2">Find Your New Best Friend</h2>
          <p className="text-base md:text-[18px] font-normal max-w-2xl mb-4 text-gray-700">
            Browse our adorable and adoptable pets. Your new companion is just a click
            away. Use the filters to find the perfect match for your family.
          </p>
        </div>

        {/* Filter Section */}
        <div className="w-full flex justify-center mb-2">
          <PetFilterBar onFilterChange={handleFilterChange} />
        </div>

        {/* Content Section */}
        <div className="w-full max-w-5xl mx-auto flex flex-wrap justify-center gap-6 min-h-[300px]">
          {loading && <div className="text-lg font-medium text-gray-600">Loading friends...</div>}
          
          {error && <div className="text-red-500 font-medium">{error}</div>}
          
          {!loading && !error && pets.length === 0 && (
            <div className="text-gray-500 italic">No pets found with these filters.</div>
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

      <footer className="pb-8 pt-4">
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