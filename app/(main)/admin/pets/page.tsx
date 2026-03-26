"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PetFilter } from "@/components/filter/PetFilter";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { petService } from "@/services/petServices";
import { Pet } from "@/types/pet";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { NotesDialog } from "@/components/dialog/NotesDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, ImageOff } from "lucide-react";
import { isValidUrl } from "@/lib/utils";

type DialogMode = "takedown" | "restore" | null;
type ActionStatus = "idle" | "loading" | "success" | "error";

export default function AdminPetsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("");

    const [pets, setPets] = useState<Pet[]>([]);
    const [totalPets, setTotalPets] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);

    // Step 1 — Confirm dialog (simple yes/no)
    const [confirmOpen, setConfirmOpen] = useState(false);
    // Step 2 — Notes dialog (collect reason)
    const [notesOpen, setNotesOpen] = useState(false);
    // Step 3 — Action/Result dialog (loading → success/error)
    const [actionOpen, setActionOpen] = useState(false);
    const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");

    const fetchPets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await petService.getPetsPublic({
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                tag_id: selectedTag || undefined,
            });
            setPets(response.data);
            setTotalPets(response.total || response.data.length);
        } catch (error) {
            console.error("Failed to fetch pets with current parameters:", { currentPage, perPage, searchQuery, selectedTag, error });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage, searchQuery, selectedTag]);

    useEffect(() => {
        fetchPets();
    }, [fetchPets]);

    // Open Step 1
    const openConfirmDialog = (pet: Pet, mode: DialogMode) => {
        setSelectedPet(pet);
        setDialogMode(mode);
        setConfirmOpen(true);
    };

    // Step 1 → Step 2: user confirmed → open NotesDialog
    const handleConfirmYes = () => {
        setConfirmOpen(false);
        setNotesOpen(true);
    };

    // Step 2 → Step 3: notes submitted → run API → show ActionDialog result
    const handleNotesSubmit = async (notes: string) => {
        if (!selectedPet || !dialogMode) return;
        const currentMode = dialogMode;
        setNotesOpen(false);

        // Open action dialog in loading state
        setActionStatus("loading");
        setActionOpen(true);

        try {
            if (currentMode === "takedown") {
                await petService.takedownPet(selectedPet.id, notes);
            } else {
                await petService.restorePet(selectedPet.id, notes);
            }
            setActionStatus("success");
            fetchPets();
        } catch (error) {
            console.error("Action failed for pet:", { petId: selectedPet.id, mode: currentMode, error });
            setActionStatus("error");
        }
    };

    // Step 3 done — close and reset
    const handleActionClose = () => {
        setActionOpen(false);
        setActionStatus("idle");
        setSelectedPet(null);
        setDialogMode(null);
    };

    const handleSearchChange = useCallback((search: string) => {
        setSearchQuery(search);
        setCurrentPage(1);
    }, []);

    const handleTagChange = useCallback((tagId: string) => {
        setSelectedTag(tagId);
        setCurrentPage(1);
    }, []);

    const isTakedown = dialogMode === "takedown";

    return (
        <div className="min-h-[calc(100vh-64px)] w-full bg-[#E7F3E7] px-4 py-6 sm:px-6 sm:py-10 md:px-12 md:py-12">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl sm:text-[2rem] font-bold text-gray-900 tracking-tight">Pets</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor all animals.</p>
                </div>

                <PetFilter
                    onSearchChange={handleSearchChange}
                    onTagChange={handleTagChange}
                />

                <Card className="overflow-hidden border-none shadow-sm rounded-xl bg-white py-2 flex flex-col">
                    <div className="overflow-x-auto min-h-75">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">ANIMAL ID</th>
                                <th className="px-4 py-3">NAME</th>
                                <th className="px-4 py-3">BREED</th>
                                <th className="px-4 py-3">TAG</th>
                                <th className="px-4 py-3">PROVIDER ID</th>
                                <th className="px-4 py-3">CREATED AT</th>
                                <th className="px-4 py-3">ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        Loading pets...
                                    </td>
                                </tr>
                            ) : pets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        No pets found.
                                    </td>
                                </tr>
                            ) : (
                                pets.map((pet) => {
                                    const isActive = pet.is_active; // adjust based on actual active field
                                    const profilePic =
                                        pet.profile_pictures?.[0]?.public_url ?? pet.profile_picture;
                                    return (
                                        <tr key={pet.id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* ANIMAL ID */}
                                            <td className="px-4 py-3 text-gray-800 whitespace-nowrap text-xs font-mono">
                                                <a href={`/pets/${pet.id}`} className="text-blue-600 hover:underline">
                                                    {pet.id}
                                                </a>
                                            </td>

                                            {/* NAME */}
                                            <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {isValidUrl(profilePic ?? "") ? (
                                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0">
                                                            <Image
                                                                src={profilePic!}
                                                                alt={pet.name}
                                                                fill
                                                                sizes="32px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                                                            <ImageOff className="w-3 h-3 text-gray-300" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{pet.name}</span>
                                                </div>
                                            </td>

                                            {/* BREED */}
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                {pet.breed || "-"}
                                            </td>

                                            {/* TAG (type_of_animal) */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1 max-w-30">
                                                    {pet.physique_tags && pet.physique_tags.length > 0 ? (
                                                        pet.physique_tags.map((tag) => (
                                                            <Badge
                                                                key={tag.id}
                                                                variant="secondary"
                                                                className="bg-[#D1F2D6]/60 text-[#16A34A] hover:bg-[#D1F2D6]/80 border-none shadow-none font-medium px-2 py-0.5 text-[10px] capitalize"
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))
                                                    ) : pet.type_of_animal_name ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-[#D1F2D6]/60 text-[#16A34A] hover:bg-[#D1F2D6]/80 border-none shadow-none font-medium px-2 py-0.5 text-[10px] capitalize"
                                                        >
                                                            {pet.type_of_animal_name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* PROVIDER ID */}
                                            <td className="px-4 py-3 text-gray-800 whitespace-nowrap text-xs font-mono">
                                                <a href={`/users/${pet.user_id}`} className="text-blue-600 hover:underline">
                                                    {pet.user_id ? `${pet.user_id}` : "-"}
                                                </a>
                                            </td>

                                            {/* CREATED AT */}
                                            <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                                                {pet.created_at
                                                    ? new Date(pet.created_at).toLocaleDateString("en-CA")
                                                    : "-"}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {isActive && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="w-24 h-7 px-3 text-xs font-semibold rounded-md shadow-none hover:bg-red-600/90 text-white"
                                                            onClick={() => openConfirmDialog(pet, "takedown")}
                                                        >
                                                            Take down
                                                        </Button>
                                                    )}
                                                    {!isActive && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-24 h-7 px-3 text-xs font-semibold rounded-md shadow-none border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                            onClick={() => openConfirmDialog(pet, "restore")}
                                                        >
                                                            Restore
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="mt-2">
                    <PaginationBar
                        current_page={currentPage}
                        total={totalPets}
                        per_page={perPage}
                        onPageChange={setCurrentPage}
                        onDataPerPageChange={(newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Step 1 – Confirm Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="sm:max-w-md w-fit p-10">
                    <AlertDialogHeader>
                        <div className="items-center flex flex-col gap-4">
                            <AlertCircle className="h-10 w-10 text-gray-600" />
                            <AlertDialogTitle className="text-center text-xl font-semibold">
                                {isTakedown
                                    ? "Are you sure want to take down this pet?"
                                    : "Are you sure want to restore this pet?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild className="text-center text-sm text-gray-600 max-w-sm">
                                <div>
                                    {selectedPet && (
                                        <><strong>&ldquo;{selectedPet.name}&rdquo;</strong>{" "}</>
                                    )}
                                    {isTakedown
                                        ? "This action can't be undone. Please make sure you really want to proceed."
                                        : "This will restore the pet and make it visible to users again."}
                                </div>
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-2 mt-2">
                        <AlertDialogCancel className="w-32 border-red-500 text-red-500 hover:bg-red-50">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmYes}
                            className={
                                isTakedown
                                    ? "w-32 bg-red-500 hover:bg-red-600"
                                    : "w-32 bg-green-500 hover:bg-green-600 text-white"
                            }
                        >
                            {isTakedown ? "Take down" : "Restore"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Step 2 – Notes Dialog */}
            <NotesDialog
                open={notesOpen}
                onOpenChange={setNotesOpen}
                onConfirm={handleNotesSubmit}
                title={isTakedown ? "Reason for Takedown" : "Reason for Restore"}
                placeholder={
                    isTakedown
                        ? "Reason for takedown (required)..."
                        : "Reason for restore (required)..."
                }
                confirmText={isTakedown ? "Take down" : "Restore"}
                confirmClassName={
                    isTakedown
                        ? "bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl h-11 disabled:opacity-50"
                        : "bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl h-11 disabled:opacity-50"
                }
            />

            {/* Step 3 – Action / Result Dialog */}
            <ActionDialog
                open={actionOpen}
                onOpenChange={(open) => { if (!open) handleActionClose(); }}
                status={actionStatus}
                title={isTakedown ? "Taking down pet..." : "Restoring pet..."}
                description={
                    isTakedown
                        ? "Please wait while we process the takedown."
                        : "Please wait while we restore the pet."
                }
                successTitle={isTakedown ? "Pet Taken Down" : "Pet Restored"}
                successDescription={
                    isTakedown
                        ? `"${selectedPet?.name || "Pet"}" has been successfully taken down.`
                        : `"${selectedPet?.name || "Pet"}" has been successfully restored.`
                }
                errorTitle="Action Failed"
                errorDescription="An error occurred while processing the action. Please try again."
                confirmText={isTakedown ? "Take down" : "Restore"}
                confirmVariant={isTakedown ? "destructive" : "default"}
            />
        </div>
    );
}