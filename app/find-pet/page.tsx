"use client";

import { useState } from "react";
import { PaginationBar } from "@/components/pagination/PaginationBar";

export default function FindPetPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // Contoh data statis, ganti dengan data dari API
  const total = 100;

  return (
    <main className="mx-auto py-8 min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#E7F3E7' }}>
      {/* Header */}
      <header className="mb-6"></header>

      {/* Body */}
      <section className="flex-1 mb-6 flex flex-col items-center justify-center">
        <h2 className="text-[48px] font-bold mb-2 text-center">Find Your New Best Friend</h2>
        <p className="text-[18px] font-normal text-center max-w-2xl mb-4">
          Browse our adorable and adoptable pets. Your new companion is just a click<br />
          away. Use the filters to find the perfect match for your family.
        </p>
        {/* Konten pencarian dan daftar hewan akan ditambahkan di sini */}
      </section>

      {/* Footer (Pagination) */}
      <footer>
        <PaginationBar
          current_page={page}
          total={total}
          per_page={limit}
          onPageChange={setPage}
          onRowsPerPageChange={setLimit}
        />
      </footer>
    </main>
  );
}
