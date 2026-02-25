"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserFilter } from "@/components/filter/UserFilter";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { userService } from "@/services/userServices";
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

type DialogMode = "activate" | "terminate" | null;
type ActionStatus = "idle" | "loading" | "success" | "error";

export default function AdminUsersPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);

    // Step 1 — Confirm dialog (simple yes/no)
    const [confirmOpen, setConfirmOpen] = useState(false);
    // Step 2 — Notes dialog (collect reason)
    const [notesOpen, setNotesOpen] = useState(false);
    // Step 3 — Action/Result dialog (loading → success/error)
    const [actionOpen, setActionOpen] = useState(false);
    const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await userService.getUsers({
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                role_id: selectedRole || undefined,
            });
            setUsers(response.data);
            setTotalUsers(response.total || response.data.length);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage, searchQuery, selectedRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Open Step 1
    const openConfirmDialog = (user: UserProfile, mode: DialogMode) => {
        setSelectedUser(user);
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
        if (!selectedUser || !dialogMode) return;
        const currentMode = dialogMode;
        setNotesOpen(false);

        // Open action dialog in loading state
        setActionStatus("loading");
        setActionOpen(true);

        try {
            if (currentMode === "terminate") {
                await userService.deactivateUser(selectedUser.id, notes);
            } else {
                await userService.activateUser(selectedUser.id, notes);
            }
            setActionStatus("success");
            fetchUsers();
        } catch (error) {
            console.error("Action failed:", error);
            setActionStatus("error");
        }
    };

    // Step 3 done — close and reset
    const handleActionClose = () => {
        setActionOpen(false);
        setActionStatus("idle");
        setSelectedUser(null);
        setDialogMode(null);
    };

    const handleSearchChange = useCallback((search: string) => {
        setSearchQuery(search);
        setCurrentPage(1);
    }, []);

    const handleRoleChange = useCallback((role: string) => {
        setSelectedRole(role);
        setCurrentPage(1);
    }, []);

    const isTerminate = dialogMode === "terminate";

    return (
        <div className="min-h-[calc(100vh-64px)] w-full bg-[#E7F3E7] px-6 py-10 md:px-12 md:py-12">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div>
                    <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight">Users</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor all users.</p>
                </div>

                <UserFilter
                    onSearchChange={handleSearchChange}
                    onRoleChange={handleRoleChange}
                />

                <Card className="overflow-hidden border-none shadow-sm rounded-xl bg-white py-2 flex flex-col">
                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3">USER ID</th>
                                    <th className="px-4 py-3">USER</th>
                                    <th className="px-4 py-3">ROLE</th>
                                    <th className="px-4 py-3">EMAIL</th>
                                    <th className="px-4 py-3">PHONE</th>
                                    <th className="px-4 py-3">CREATED AT</th>
                                    <th className="px-4 py-3">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        const isActive = user.is_active;
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 text-gray-800 whitespace-nowrap text-xs font-mono">
                                                    {user.id.substring(0, 8)}...
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-800 whitespace-normal leading-snug">
                                                    <span>{user.name}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-[#D1F2D6]/60 text-[#16A34A] hover:bg-[#D1F2D6]/80 border-none shadow-none font-medium px-3 py-1 text-xs capitalize"
                                                    >
                                                        {user.role_name || user.role?.name || "Member"}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">{user.email || "-"}</td>
                                                <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">{user.phone || "-"}</td>
                                                <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                                                    {new Date(user.created_at).toLocaleDateString('en-CA')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {!isActive && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-20 h-[28px] text-xs font-semibold rounded-md shadow-none border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                                onClick={() => openConfirmDialog(user, "activate")}
                                                            >
                                                                Activate
                                                            </Button>
                                                        )}
                                                        {isActive && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="w-20 h-[28px] text-xs font-semibold rounded-md shadow-none hover:bg-red-600/90 text-white"
                                                                onClick={() => openConfirmDialog(user, "terminate")}
                                                            >
                                                                Terminate
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
                        total={totalUsers}
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
                                {isTerminate
                                    ? "Are you sure want to terminate this user?"
                                    : "Are you sure want to activate this user?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild className="text-center text-sm text-gray-600 max-w-sm">
                                <div>
                                    {isTerminate ? (
                                        <>
                                            {selectedUser && <><strong>&ldquo;{selectedUser.name}&rdquo;</strong>{" "}</>}
                                            This action can&apos;t be undone. Please make sure you really want to proceed.
                                        </>
                                    ) : (
                                        <>
                                            {selectedUser && <><strong>&ldquo;{selectedUser.name}&rdquo;</strong>{" "}</>}
                                            This will restore the user&apos;s access to the platform.
                                        </>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-2 mt-2">
                        <AlertDialogCancel className="w-32 border-red-500! text-red-500! hover:bg-red-50!">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmYes}
                            className={
                                isTerminate
                                    ? "w-32 bg-red-500! hover:bg-red-600!"
                                    : "w-32 bg-green-500! hover:bg-green-600! text-white!"
                            }
                        >
                            {isTerminate ? "Terminate" : "Activate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Step 2 – Notes Dialog */}
            <NotesDialog
                open={notesOpen}
                onOpenChange={setNotesOpen}
                onConfirm={handleNotesSubmit}
                title={isTerminate ? "Reason for Termination" : "Reason for Activation"}
                placeholder={
                    isTerminate
                        ? "Reason for termination (required)..."
                        : "Reason for activation (required)..."
                }
                confirmText={isTerminate ? "Terminate" : "Activate"}
                confirmClassName={
                    isTerminate
                        ? "bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl h-11 disabled:opacity-50"
                        : "bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl h-11 disabled:opacity-50"
                }
            />

            {/* Step 3 – Action / Result Dialog */}
            <ActionDialog
                open={actionOpen}
                onOpenChange={(open) => { if (!open) handleActionClose(); }}
                status={actionStatus}
                title={isTerminate ? "Terminating user..." : "Activating user..."}
                description={isTerminate
                    ? "Please wait while we process the termination."
                    : "Please wait while we process the activation."
                }
                successTitle={isTerminate ? "User Terminated" : "User Activated"}
                successDescription={
                    isTerminate
                        ? `"${selectedUser?.name ?? "User"}" has been successfully terminated.`
                        : `"${selectedUser?.name ?? "User"}" has been successfully activated.`
                }
                errorTitle="Action Failed"
                errorDescription="An error occurred while processing the action. Please try again."
                confirmText={isTerminate ? "Terminate" : "Activate"}
                confirmVariant={isTerminate ? "destructive" : "default"}
            />
        </div>
    );
}
