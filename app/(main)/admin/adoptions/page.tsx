"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdoptionFilter } from "@/components/filter/AdoptionFilter";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { Adoption } from "@/types/adoption";
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
import {
    AlertCircle,
    FileText,
    Hourglass,
    CalendarDays,
    HandHelping,
} from "lucide-react";
import { adoptionServices } from "@/services/adoptionServices";
import { petService } from "@/services/petServices";
import {parseColorCode} from "@/lib/color";

type DialogMode = "approve" | "reject" | null;
type ActionStatus = "idle" | "loading" | "success" | "error";

function StageIcon({ stage }: { stage: string }) {
    const s = stage?.toLowerCase() ?? "";
    if (s.includes("submitted"))  return <FileText className="w-4 h-4 text-gray-500 shrink-0" />;
    if (s.includes("reviewed"))   return <Hourglass className="w-4 h-4 text-gray-500 shrink-0" />;
    if (s.includes("meet"))       return <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />;
    if (s.includes("handover"))   return <HandHelping className="w-4 h-4 text-gray-500 shrink-0" />;
    return null;
}

function ColorBadge({ name, colorCode }: { name: string; colorCode?: string }) {
    const label = name?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "-";
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap border"
            style={parseColorCode(colorCode)}
        >
            {label}
        </span>
    );
}


function canAct(adoption: Adoption): boolean {
    const s = adoption.status?.name.toLowerCase() ?? "";
    return !["completed", "rejected"].includes(s);
}

export default function AdminAdoptionsPage() {
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedProcess, setSelectedProcess] = useState("");

    const [adoptions, setAdoptions] = useState<Adoption[]>([]);
    const [totalAdoptions, setTotalAdoptions] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedAdoption, setSelectedAdoption] = useState<Adoption | null>(null);
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [actionOpen, setActionOpen] = useState(false);
    const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");

    const fetchAdoptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adoptionServices.getAllAdoptions({
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status_id: selectedStatus || undefined,
                stage_tag_id: selectedProcess || undefined,
            });
            setAdoptions(response.data);
            setTotalAdoptions(response.total || response.data.length);
        } catch (error) {
            console.error("Failed to fetch adoptions:", { currentPage, perPage, searchQuery, selectedStatus, selectedProcess, error });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage, searchQuery, selectedStatus, selectedProcess]);

    useEffect(() => {
        fetchAdoptions();
    }, [fetchAdoptions]);

    const openConfirmDialog = (adoption: Adoption, mode: DialogMode) => {
        setSelectedAdoption(adoption);
        setDialogMode(mode);
        setConfirmOpen(true);
    };

    const handleConfirmYes = () => {
        setConfirmOpen(false);
        if (dialogMode === "approve") {
            router.push(`/adoptions/${selectedAdoption?.id}`);
        } else {
            setNotesOpen(true);
        }
    };

    const handleNotesSubmit = async (notes: string) => {
        if (!selectedAdoption) return;
        setNotesOpen(false);
        setActionStatus("loading");
        setActionOpen(true);

        try {
            await petService.reject(selectedAdoption.pet.id, selectedAdoption.id);
            setActionStatus("success");
            fetchAdoptions();
        } catch (error) {
            console.error("Reject failed:", { adoptionId: selectedAdoption.id, error });
            setActionStatus("error");
        }
    };

    const handleActionClose = () => {
        setActionOpen(false);
        setActionStatus("idle");
        setSelectedAdoption(null);
        setDialogMode(null);
    };

    const handleSearchChange = useCallback((search: string) => {
        setSearchQuery(search);
        setCurrentPage(1);
    }, []);

    const handleStatusChange = useCallback((status: string) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    }, []);

    const handleProcessChange = useCallback((process: string) => {
        setSelectedProcess(process);
        setCurrentPage(1);
    }, []);

    const isApprove = dialogMode === "approve";

    const animalLabel = (a: Adoption) =>
        a.pet
            ? `${a.pet.name}${a.pet.type_of_animal_name ? ` (${a.pet.type_of_animal_name})` : ""}`
            : "-";

    return (
        <div className="min-h-[calc(100vh-64px)] w-full bg-[#E7F3E7] px-4 py-6 sm:px-6 sm:py-10 md:px-12 md:py-12">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl sm:text-[2rem] font-bold text-gray-900 tracking-tight">Adoption Applications</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor all adoption applications.</p>
                </div>

                <AdoptionFilter
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                    onProcessChange={handleProcessChange}
                />

                <Card className="overflow-hidden border-none shadow-sm rounded-xl bg-white py-2 flex flex-col">
                    <div className="overflow-x-auto min-h-75">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">APPLICATION ID</th>
                                <th className="px-4 py-3">ADOPTER</th>
                                <th className="px-4 py-3">PROVIDER</th>
                                <th className="px-4 py-3">ANIMAL</th>
                                <th className="px-4 py-3">STATUS</th>
                                <th className="px-4 py-3">CURRENT PROCESS</th>
                                <th className="px-4 py-3">JOINED AT</th>
                                <th className="px-4 py-3">ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        Loading adoptions...
                                    </td>
                                </tr>
                            ) : adoptions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        No adoption applications found.
                                    </td>
                                </tr>
                            ) : (
                                adoptions.map((adoption) => (
                                    <tr key={adoption.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* APPLICATION ID */}
                                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap text-xs font-mono">
                                            <a href={`/adoptions/${adoption.id}`} className="text-blue-600 hover:underline">
                                                {adoption.id}
                                            </a>
                                        </td>

                                        {/* USER (adopter) */}
                                        <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                                            <a href={`/profile/${adoption.adopter.id}`} className="text-blue-600 hover:underline">
                                                {adoption.adopter.name}
                                            </a>
                                        </td>

                                        {/* USER (PROVIDER) */}
                                        <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                                            <a href={`/profile/${adoption.provider.id}`} className="text-blue-600 hover:underline">
                                                {adoption.provider.name}
                                            </a>
                                        </td>

                                        {/* ANIMAL */}
                                        <td className="px-4 py-3 text-xs text-gray-800">
                                            <a href={`/pets/${adoption.pet.id}`}  className="text-blue-600 hover:underline">{animalLabel(adoption)}</a>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <ColorBadge
                                                name={adoption.status.name}
                                                colorCode={adoption.status.color_code || "#E5E7EB"}
                                            />
                                        </td>

                                        {/* CURRENT PROCESS (stage_tag) */}
                                        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <StageIcon stage={adoption.stage_tag?.name ?? ""} />
                                                <span>{adoption.stage_tag?.name ?? "-"}</span>
                                            </div>
                                        </td>

                                        {/* JOINED AT */}
                                        <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                                            {adoption.created_at
                                                ? new Date(adoption.created_at).toLocaleDateString("en-CA")
                                                : "-"}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {canAct(adoption) && (
                                                <div className="flex items-center gap-2">
                                                    {adoption.stage_tag?.name.toLowerCase() === "handover" && (
                                                        <Button
                                                            size="sm"
                                                            className="h-7 px-3 text-xs font-semibold rounded-md shadow-none bg-gray-800 hover:bg-gray-700 text-white"
                                                            onClick={() => openConfirmDialog(adoption, "approve")}
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-7 px-3 text-xs font-semibold rounded-md shadow-none hover:bg-red-600/90 text-white"
                                                        onClick={() => openConfirmDialog(adoption, "reject")}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="mt-2">
                    <PaginationBar
                        current_page={currentPage}
                        total={totalAdoptions}
                        per_page={perPage}
                        onPageChange={setCurrentPage}
                        onDataPerPageChange={(newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                        }}
                        itemLabel="Applications"
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
                                {isApprove
                                    ? "Are you sure want to approve this application?"
                                    : "Are you sure want to reject this application?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild className="text-center text-sm text-gray-600 max-w-sm">
                                <div>
                                    {selectedAdoption && (
                                        <><strong>&ldquo;{selectedAdoption.adopter.name} — {animalLabel(selectedAdoption)}&rdquo;</strong>{" "}</>
                                    )}
                                    {isApprove
                                        ? "This will move the application to the next stage."
                                        : "This action will reject the adoption application."}
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
                                isApprove
                                    ? "w-32 bg-gray-900 hover:bg-gray-800 text-white"
                                    : "w-32 bg-red-500 hover:bg-red-600 text-white"
                            }
                        >
                            {isApprove ? "Approve" : "Reject"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Notes Dialog (reject only) */}
            <NotesDialog
                open={notesOpen}
                onOpenChange={setNotesOpen}
                onConfirm={handleNotesSubmit}
                title="Reason for Rejection"
                placeholder="Reason for rejection (required)..."
                confirmText="Reject"
                confirmClassName="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl h-11 disabled:opacity-50"
            />

            {/* Action / Result Dialog (reject only) */}
            <ActionDialog
                open={actionOpen}
                onOpenChange={(open) => { if (!open) handleActionClose(); }}
                status={actionStatus}
                title="Rejecting application..."
                description="Please wait while we process the rejection."
                successTitle="Application Rejected"
                successDescription={`Application for "${selectedAdoption ? animalLabel(selectedAdoption) : "Pet"}" has been rejected.`}
                errorTitle="Action Failed"
                errorDescription="An error occurred while processing the action. Please try again."
                confirmText="Reject"
                confirmVariant="destructive"
            />
        </div>
    );
}