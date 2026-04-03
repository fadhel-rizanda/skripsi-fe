"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useState } from "react";
import { Adoption } from "@/types/adoption";
import { AxiosError } from "axios";
import { ErrorResponse, UserProfile } from "@/types";
import { toast } from "sonner";
import { petService } from "@/services/petServices";
import { useSession } from "next-auth/react";
import {ActionDialog} from "@/components/dialog/ActionDialog";

interface AdoptionTerminateButtonProps {
    adoption?: Adoption;
    currentUser?: UserProfile | null;
    onSuccess?: () => void;
    className?: string;
}

export default function AdoptionTerminateButton({
                                                    adoption,
                                                    currentUser,
                                                    onSuccess,
                                                    className,
                                                }: AdoptionTerminateButtonProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { data: session } = useSession();

    const isProvider = currentUser?.role.name === "provider";
    const action = isProvider ? "reject" : "cancel";
    const label = isProvider ? "Reject Application" : "Cancel Application";

    const dialogConfig = {
        title: isProvider ? "Reject this adoption?" : "Cancel your application?",
        description: isProvider
            ? "Are you sure you want to reject this applicant? This action will notify the adopter."
            : "Are you sure you want to cancel your adoption request? You might need to re-adopt later.",
        successTitle: isProvider ? "Application Rejected" : "Application Cancelled",
        confirmText: isProvider ? "Reject" : "Yes, Cancel",
    };

    const handleTerminate = async () => {
        if (!session?.user?.id) {
            toast.error("You must be logged in to perform this action.");
            throw new Error("Unauthorized");
        }
        if (!adoption?.pet?.id || !adoption?.id) {
            toast.error("Unable to perform action: Missing adoption details.");
            throw new Error("Missing Data");
        }

        try {
            setIsLoading(true);
            await petService[action](
                adoption?.pet.id || "",
                adoption?.id || ""
            );
        } catch (error) {
            console.error(`Failed to ${action} adoption:`, error);
            if (error instanceof AxiosError) {
                const errData = error.response?.data as ErrorResponse;
                throw new Error(errData?.message || "Something went wrong");
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsDialogOpen(true)}
                disabled={isLoading}
                variant="destructive"
                className={
                    className ??
                    "bg-[#FF0000] hover:bg-red-600 rounded-2xl px-4 h-8 text-xs font-bold gap-1.5"
                }
            >
                <XCircle className="h-3.5 w-3.5" />
                {label}
            </Button>

            <ActionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onConfirm={handleTerminate}
                confirmVariant="destructive"
                title={dialogConfig.title}
                description={dialogConfig.description}
                successTitle={dialogConfig.successTitle}
                confirmText={dialogConfig.confirmText}
                onContinue={() => {
                    setIsDialogOpen(false);
                    onSuccess?.();
                }}
            />
        </>
    );
}