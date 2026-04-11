"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityFilter } from "@/components/filter/CommunityFilter";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { communityService } from "@/services/communityService";
import { Community } from "@/types/community";
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
import { AlertCircle } from "lucide-react";
import {parseColorCode} from "@/lib/color";

type DialogMode = "takedown" | "restore" | null;
type ActionStatus = "idle" | "loading" | "success" | "error";

export default function AdminCommunitiesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("");

    const [communities, setCommunities] = useState<Community[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [actionOpen, setActionOpen] = useState(false);
    const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");

    const fetchCommunities = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await communityService.getCommunities({
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                tag_id: selectedTag || undefined,
            });
            setCommunities(response.data);
            setTotal(response.total || response.data.length);
        } catch (error) {
            console.error("Failed to fetch communities:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage, searchQuery, selectedTag]);

    useEffect(() => {
        fetchCommunities();
    }, [fetchCommunities]);

    const openConfirmDialog = (community: Community, mode: DialogMode) => {
        setSelectedCommunity(community);
        setDialogMode(mode);
        setConfirmOpen(true);
    };

    const handleConfirmYes = () => {
        setConfirmOpen(false);
        setNotesOpen(true);
    };

    const handleNotesSubmit = async (notes: string) => {
        if (!selectedCommunity || !dialogMode) return;
        const currentMode = dialogMode;
        setNotesOpen(false);
        setActionStatus("loading");
        setActionOpen(true);

        try {
            if (currentMode === "takedown") {
                await communityService.takedownCommunity(selectedCommunity.id, notes);
            } else {
                await communityService.restoreCommunity(selectedCommunity.id, notes);
            }
            setActionStatus("success");
            fetchCommunities();
        } catch (error) {
            console.error("Action failed:", error);
            setActionStatus("error");
        }
    };

    const handleActionClose = () => {
        setActionOpen(false);
        setActionStatus("idle");
        setSelectedCommunity(null);
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

    const formatAddress = (community: Community) => {
        const parts = [
            community.address?.district?.name,
            community.address?.regency?.name,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : community.address?.street || "-";
    };

    return (
        <div className="min-h-[calc(100vh-64px)] w-full bg-[#E7F3E7] px-4 py-6 sm:px-6 sm:py-10 md:px-12 md:py-12">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl sm:text-[2rem] font-bold text-gray-900 tracking-tight">Communities</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor all communities.</p>
                </div>

                <CommunityFilter
                    onSearchChange={handleSearchChange}
                    onTagChange={handleTagChange}
                />

                <Card className="overflow-hidden border-none shadow-sm rounded-xl bg-white py-2 flex flex-col">
                    <div className="overflow-x-auto min-h-75">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">COMMUNITY ID</th>
                                <th className="px-4 py-3">NAME</th>
                                <th className="px-4 py-3">WEBSITE</th>
                                <th className="px-4 py-3">TAGS</th>
                                <th className="px-4 py-3">ADDRESS</th>
                                <th className="px-4 py-3">CREATED AT</th>
                                <th className="px-4 py-3">ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        Loading communities...
                                    </td>
                                </tr>
                            ) : communities.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        No communities found.
                                    </td>
                                </tr>
                            ) : (
                                communities.map((community) => {
                                    const isActive = community.is_active;
                                    return (
                                        <tr key={community.id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* COMMUNITY ID */}
                                            <td className="px-4 py-3 text-gray-800 whitespace-nowrap text-xs font-mono">
                                                <a href={`/explore/communities/${community.id}`} className="text-blue-600 hover:underline">
                                                    {community.id}
                                                </a>
                                            </td>

                                            {/* NAME */}
                                            <td className="px-4 py-3 text-xs text-gray-800 max-w-40">
                                                    <span className="line-clamp-2 leading-snug font-medium">
                                                        {community.name || "-"}
                                                    </span>
                                            </td>
                                            {/* WEBSITE */}
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-36">
                                                {community.website ? (
                                                    <a
                                                        href={community.website.startsWith('http') ? community.website : `https://${community.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="truncate block hover:underline text-blue-500 max-w-32"
                                                    >
                                                        {community.website}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>

                                            {/* TAGS */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1 max-w-28">
                                                    {community.tags && community.tags.length > 0 ? (
                                                        community.tags.map((tag) => (
                                                            <Badge
                                                                key={tag.id}
                                                                variant="secondary"
                                                                className="border-none shadow-none font-medium px-2 py-0.5 text-[10px] capitalize"
                                                                style={parseColorCode(tag.color_code || "#E5E7EB")}
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* ADDRESS */}
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-36">
                                                    <span className="line-clamp-2 leading-snug">
                                                        {formatAddress(community)}
                                                    </span>
                                            </td>

                                            {/* CREATED AT */}
                                            <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                                                {new Date(community.created_at).toLocaleDateString("en-CA")}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {isActive ? (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-7 px-3 text-xs font-semibold rounded-md shadow-none hover:bg-red-600/90 text-white"
                                                        onClick={() => openConfirmDialog(community, "takedown")}
                                                    >
                                                        Terminate
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-3 text-xs font-semibold rounded-md shadow-none border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                        onClick={() => openConfirmDialog(community, "restore")}
                                                    >
                                                        Restore
                                                    </Button>
                                                )}
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
                        total={total}
                        per_page={perPage}
                        onPageChange={setCurrentPage}
                        onDataPerPageChange={(newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                        }}
                        itemLabel="Communities"
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
                                    ? "Are you sure want to terminate this community?"
                                    : "Are you sure want to restore this community?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild className="text-center text-sm text-gray-600 max-w-sm">
                                <div>
                                    {selectedCommunity && (
                                        <><strong>&ldquo;{selectedCommunity.name}&rdquo;</strong>{" "}</>
                                    )}
                                    {isTakedown
                                        ? "This action can't be undone. Please make sure you really want to proceed."
                                        : "This will restore the community and make it visible to users again."}
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
                            {isTakedown ? "Terminate" : "Restore"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Step 2 – Notes Dialog */}
            <NotesDialog
                open={notesOpen}
                onOpenChange={setNotesOpen}
                onConfirm={handleNotesSubmit}
                title={isTakedown ? "Reason for Termination" : "Reason for Restore"}
                placeholder={
                    isTakedown
                        ? "Reason for termination (required)..."
                        : "Reason for restore (required)..."
                }
                confirmText={isTakedown ? "Terminate" : "Restore"}
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
                title={isTakedown ? "Terminating community..." : "Restoring community..."}
                description={
                    isTakedown
                        ? "Please wait while we process the termination."
                        : "Please wait while we restore the community."
                }
                successTitle={isTakedown ? "Community Terminated" : "Community Restored"}
                successDescription={
                    isTakedown
                        ? `"${selectedCommunity?.name}" has been successfully terminated.`
                        : `"${selectedCommunity?.name}" has been successfully restored.`
                }
                errorTitle="Action Failed"
                errorDescription="An error occurred while processing the action. Please try again."
                confirmText={isTakedown ? "Terminate" : "Restore"}
                confirmVariant={isTakedown ? "destructive" : "default"}
            />
        </div>
    );
}