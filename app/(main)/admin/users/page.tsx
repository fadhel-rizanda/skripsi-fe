"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserFilter } from "@/components/filter/UserFilter";
import { PaginationBar } from "@/components/pagination/PaginationBar";
import { userService } from "@/services/userServices";
import { UserProfile } from "@/types/user";
import { TerminateUserDialog } from "@/components/dialog/TerminateUserDialog";
import { ActivateUserDialog } from "@/components/dialog/ActivateUserDialog";
import { ResultDialog } from "@/components/dialog/ResultDialog";

export default function AdminUsersPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
    const [activateDialogOpen, setActivateDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isTerminating, setIsTerminating] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [resultDialog, setResultDialog] = useState<{ open: boolean; type: "success" | "error" }>({ open: false, type: "success" });

    const handleTerminate = async (notes: string) => {
        if (!selectedUser) return;
        setIsTerminating(true);
        try {
            await userService.deactivateUser(selectedUser.id, notes);
            setTerminateDialogOpen(false);
            setSelectedUser(null);
            fetchUsers();
            setResultDialog({ open: true, type: "success" });
        } catch (error) {
            console.error("Failed to terminate user:", error);
            setTerminateDialogOpen(false);
            setResultDialog({ open: true, type: "error" });
        } finally {
            setIsTerminating(false);
        }
    };

    const handleActivate = async (notes: string) => {
        if (!selectedUser) return;
        setIsActivating(true);
        try {
            await userService.activateUser(selectedUser.id, notes);
            setActivateDialogOpen(false);
            setSelectedUser(null);
            fetchUsers();
            setResultDialog({ open: true, type: "success" });
        } catch (error) {
            console.error("Failed to activate user:", error);
            setActivateDialogOpen(false);
            setResultDialog({ open: true, type: "error" });
        } finally {
            setIsActivating(false);
        }
    };

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

    return (
        <div className="min-h-[calc(100vh-64px)] w-full bg-[#E7F3E7] px-6 py-10 md:px-12 md:py-12">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div>
                    <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight">Users</h1>
                    <p className="text-gray-500 mt-1">Manage and monitor all users.</p>
                </div>

                <UserFilter
                    onSearchChange={(search) => {
                        setSearchQuery(search);
                        setCurrentPage(1);
                    }}
                    onRoleChange={(role) => {
                        setSelectedRole(role);
                        setCurrentPage(1);
                    }}
                />

                <Card className="overflow-hidden border-none shadow-sm rounded-xl bg-white py-2 flex flex-col">
                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[12px] font-extrabold uppercase tracking-wider text-gray-700 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">USER ID</th>
                                    <th className="px-8 py-5">USER</th>
                                    <th className="px-8 py-5">ROLE</th>
                                    <th className="px-8 py-5">EMAIL ADDRESS</th>
                                    <th className="px-8 py-5">PHONE NUMBER</th>
                                    <th className="px-8 py-5">CREATED AT</th>
                                    <th className="px-8 py-5">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-8 text-center text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-8 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5 text-gray-800 whitespace-nowrap text-xs font-mono">
                                                {user.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-8 py-5 text-gray-800 whitespace-normal leading-snug">
                                                <span>{user.name}</span>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-[#D1F2D6]/60 text-[#16A34A] hover:bg-[#D1F2D6]/80 border-none shadow-none font-medium px-4 py-1 text-xs capitalize"
                                                >
                                                    {user.role_name || user.role?.name || "Member"}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5 text-gray-800 whitespace-nowrap">{user.email || "-"}</td>
                                            <td className="px-8 py-5 text-gray-800 whitespace-nowrap">{user.phone || "-"}</td>
                                            <td className="px-8 py-5 text-gray-800 whitespace-nowrap">
                                                {new Date(user.created_at).toLocaleDateString("en-GB", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                }).split("/").reverse().join("-")}
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-[30px] px-4 font-semibold rounded-md shadow-none border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setActivateDialogOpen(true);
                                                        }}
                                                    >
                                                        Activate
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-[30px] px-4 font-semibold rounded-md shadow-none hover:bg-red-600/90 text-white"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setTerminateDialogOpen(true);
                                                        }}
                                                    >
                                                        Terminate
                                                    </Button>
                                                </div>
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

            <TerminateUserDialog
                open={terminateDialogOpen}
                onOpenChange={setTerminateDialogOpen}
                userName={selectedUser?.name}
                onConfirm={handleTerminate}
                isLoading={isTerminating}
            />

            <ActivateUserDialog
                open={activateDialogOpen}
                onOpenChange={setActivateDialogOpen}
                userName={selectedUser?.name}
                onConfirm={handleActivate}
                isLoading={isActivating}
            />

            <ResultDialog
                open={resultDialog.open}
                onOpenChange={(open) => setResultDialog((prev) => ({ ...prev, open }))}
                type={resultDialog.type}
            />
        </div>
    );
}
