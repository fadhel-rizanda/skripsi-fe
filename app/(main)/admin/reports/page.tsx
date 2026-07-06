"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportFilterBar } from "@/components/filter/ReportFilterBar";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { reportServices } from "@/services/reportServices";
import { Report } from "@/types/general";
import { UserProfile } from "@/types/user";
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
import { userService } from "@/services/userServices";
import { postService } from "@/services/postServices";
import { communityService } from "@/services/communityService";
import { petService } from "@/services/petServices";

type ActionStatus = "idle" | "loading" | "success" | "error";
type DialogMode = "takedown" | "restore";

async function dispatchTakedown(referenceType: string, referenceId: string, notes: string) {
    switch (referenceType.toUpperCase()) {
        case "USER":      return userService.deactivateUser(referenceId, notes);
        case "POST":      return postService.takedownPost(referenceId, notes);
        case "COMMUNITY": return communityService.takedownCommunity(referenceId, notes);
        case "PETS":      return petService.takedownPet(referenceId, notes);
        default:
            throw new Error(`Unsupported reference type for takedown: ${referenceType}`);
    }
}

async function dispatchRestore(referenceType: string, referenceId: string, notes: string) {
    switch (referenceType.toUpperCase()) {
        case "USER":      return userService.activateUser(referenceId, notes);
        case "POST":      return postService.restorePost(referenceId, notes);
        case "COMMUNITY": return communityService.restoreCommunity(referenceId, notes);
        case "PETS":      return petService.restorePet(referenceId, notes);
    }
}

function getReferenceHref(referenceType: string, referenceId: string) {
    switch (referenceType.toUpperCase()) {
        case "USER":      return `/users/${referenceId}`;
        case "POST":      return `/posts/${referenceId}`;
        case "COMMUNITY": return `/explore/communities/${referenceId}`;
        case "PETS":      return `/pets/${referenceId}`;
        case "ADOPTION":      return `/adoptions/${referenceId}`;
        default:          return null;
    }
}

function getUserId(user: string | UserProfile | undefined) {
    if (!user) return null;
    if (typeof user === "string") return user;
    return user.id;
}

function getUserDisplay(user: string | UserProfile | undefined) {
    if (!user) return "-";
    if (typeof user === "string") return `#${user}`;
    return user.name || `#${user.id}`;
}

export default function AdminReportsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedTag, setSelectedTag] = useState("");

    const [reports, setReports] = useState<Report[]>([]);
    const [totalReports, setTotalReports] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [dialogMode, setDialogMode] = useState<DialogMode>("takedown");

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [actionOpen, setActionOpen] = useState(false);
    const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await reportServices.getReports({
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                reference_type: selectedModel || undefined,
                tag_id: selectedTag || undefined,
            });
            setReports(response.data);
            setTotalReports(response.total || response.data.length);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
            console.error("Failed to fetch reports:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage, searchQuery, selectedModel, selectedTag]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const openConfirmDialog = (report: Report, mode: DialogMode) => {
        setSelectedReport(report);
        setDialogMode(mode);
        setConfirmOpen(true);
    };

    const handleConfirmYes = () => {
        setConfirmOpen(false);
        setNotesOpen(true);
    };

    const handleNotesSubmit = async (notes: string) => {
        if (!selectedReport) return;
        setNotesOpen(false);
        setActionStatus("loading");
        setActionOpen(true);

        try {
            if (dialogMode === "takedown") {
                await dispatchTakedown(selectedReport.reference_type, selectedReport.reference_id, notes);
            } else {
                await dispatchRestore(selectedReport.reference_type, selectedReport.reference_id, notes);
            }
            setActionStatus("success");
            fetchReports();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred";
            console.error("Action failed:", errorMessage);
            setActionStatus("error");
        }
    };

    const handleActionClose = () => {
        setActionOpen(false);
        setActionStatus("idle");
        setSelectedReport(null);
    };

    const handleSearchChange = useCallback((search: string) => {
        setSearchQuery(search);
        setCurrentPage(1);
    }, []);

    const handleModelChange = useCallback((model: string) => {
        setSelectedModel(model);
        setCurrentPage(1);
    }, []);

    const handleTagChange = useCallback((tagId: string) => {
        setSelectedTag(tagId);
        setCurrentPage(1);
    }, []);

    const isTakedown = dialogMode === "takedown";
    const referenceType = selectedReport?.reference_type ?? "";
    const referenceLabel = referenceType
        ? referenceType.charAt(0).toUpperCase() + referenceType.slice(1).toLowerCase()
        : "Content";

    return (
        <div className="min-h-[calc(100vh-64px)] w-full bg-[#E7F3E7] px-4 py-6 sm:px-6 sm:py-10 md:px-12 md:py-12">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl sm:text-[2rem] font-bold text-gray-900 tracking-tight">Reports</h1>
                    <p className="text-gray-500 mt-1">Manage and take action on user-submitted reports.</p>
                </div>

                <ReportFilterBar
                    onSearchChange={handleSearchChange}
                    onModelChange={handleModelChange}
                    onTagChange={handleTagChange}
                />

                <Card className="overflow-hidden border-none shadow-sm rounded-xl bg-white py-2 flex flex-col">
                    <div className="overflow-x-auto min-h-75">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">REPORT ID</th>
                                <th className="px-4 py-3">MODEL</th>
                                <th className="px-4 py-3">REFERENCE ID</th>
                                <th className="px-4 py-3">TAG</th>
                                <th className="px-4 py-3">STATUS</th>
                                <th className="px-4 py-3">NOTES</th>
                                <th className="px-4 py-3">CREATED AT</th>
                                <th className="px-4 py-3">REPORTED BY</th>
                                <th className="px-4 py-3">ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                                        No reports found.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => {
                                    const href = getReferenceHref(report.reference_type, report.reference_id);
                                    const reportedById = getUserId(report.created_by);
                                    const reportedByDisplay = getUserDisplay(report.created_by);
                                    const isTargetActive = report.is_target_active;

                                    return (
                                        <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* REPORT ID */}
                                            <td className="px-4 py-3 text-gray-800 whitespace-nowrap text-xs font-mono">
                                                {report.id}
                                            </td>

                                            {/* MODEL */}
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-700 uppercase">
                                                {report.reference_type}
                                            </td>

                                            {/* REFERENCE ID */}
                                            <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                                                {href ? (
                                                    <a href={href} className="text-blue-600 hover:underline">
                                                        {report.reference_id}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-800">{report.reference_id}</span>
                                                )}
                                            </td>

                                            {/* TAG */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    {report.tags && report.tags.length > 0 ? (
                                                        report.tags.map((tag) => (
                                                            <Badge
                                                                key={tag.id}
                                                                variant="secondary"
                                                                className="bg-red-100 text-red-500 hover:bg-red-100 border-none shadow-none font-medium px-2 py-0.5 text-[10px] capitalize"
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {report.status ? (
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] font-medium px-2 py-0.5 border ${report.status.color_code}`}
                                                    >
                                                        {report.status.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>

                                            {/* NOTES */}
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-45">
                                                    <span className="line-clamp-2 leading-snug">
                                                        {report.notes || "-"}
                                                    </span>
                                            </td>

                                            {/* CREATED AT */}
                                            <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                                                {new Date(report.created_at).toLocaleDateString("en-CA")}
                                            </td>

                                            {/* REPORTED BY */}
                                            <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                                                {reportedById ? (
                                                    <a href={`/users/${reportedById}`} className="text-blue-600 hover:underline">
                                                        {reportedByDisplay}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-800">{reportedByDisplay}</span>
                                                )}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {isTargetActive && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="w-24 h-7 px-3 text-xs font-semibold rounded-md shadow-none hover:bg-red-600/90 text-white"
                                                        onClick={() => openConfirmDialog(report, "takedown")}
                                                    >
                                                        Take down
                                                    </Button>
                                                )}
                                                {!isTargetActive && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-24 h-7 px-3 text-xs font-semibold rounded-md shadow-none border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                        onClick={() => openConfirmDialog(report, "restore")}
                                                    >
                                                        Restore
                                                    </Button>
                                                )}
                                                {isTargetActive === null && (
                                                    <span className="text-xs text-gray-400">-</span>
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
                        total={totalReports}
                        per_page={perPage}
                        onPageChange={setCurrentPage}
                        onDataPerPageChange={(newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                        }}
                        itemLabel="Reports"
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
                                    ? `Are you sure want to take down this ${referenceLabel.toLowerCase()}?`
                                    : `Are you sure want to restore this ${referenceLabel.toLowerCase()}?`}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild className="text-center text-sm text-gray-600 max-w-sm">
                                <div>
                                    {selectedReport && (
                                        <><strong>Reference ID: {selectedReport.reference_id}</strong>{" "}</>
                                    )}
                                    {isTakedown
                                        ? "This action can't be undone. Please make sure you really want to proceed."
                                        : "This will restore the content and make it visible to users again."}
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
                            className={isTakedown
                                ? "w-32 bg-red-500 hover:bg-red-600 text-white"
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
                placeholder={isTakedown ? "Reason for takedown (required)..." : "Reason for restore (required)..."}
                confirmText={isTakedown ? "Take down" : "Restore"}
                confirmClassName={isTakedown
                    ? "bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl h-11 disabled:opacity-50"
                    : "bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl h-11 disabled:opacity-50"
                }
            />

            {/* Step 3 – Action / Result Dialog */}
            <ActionDialog
                open={actionOpen}
                onOpenChange={(open) => { if (!open) handleActionClose(); }}
                status={actionStatus}
                title={isTakedown ? "Taking down content..." : "Restoring content..."}
                description={isTakedown
                    ? "Please wait while we process the takedown."
                    : "Please wait while we restore the content."
                }
                successTitle={isTakedown ? "Content Taken Down" : "Content Restored"}
                successDescription={
                    selectedReport
                        ? `${referenceLabel} ${selectedReport.reference_id} has been successfully ${isTakedown ? "taken down" : "restored"}.`
                        : `Content has been successfully ${isTakedown ? "taken down" : "restored"}.`
                }
                errorTitle="Action Failed"
                errorDescription="An error occurred while processing the action. Please try again."
                confirmText={isTakedown ? "Take down" : "Restore"}
                confirmVariant={isTakedown ? "destructive" : "default"}
            />
        </div>
    );
}