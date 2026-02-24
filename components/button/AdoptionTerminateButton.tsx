"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useState } from "react";
import { Adoption } from "@/types/adoption";
import { AxiosError } from "axios";
import { ErrorResponse, UserProfile } from "@/types";
import { toast } from "sonner";
import { petService } from "@/services/petServices";

interface AdoptionTerminateButtonProps {
    adoption?: Adoption;
    currentUser?: UserProfile | null;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    className?: string;
}

export default function AdoptionTerminateButton({
                                                    adoption,
                                                    currentUser,
                                                    onSuccess,
                                                    onError,
                                                    className,
                                                }: AdoptionTerminateButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const isProvider = currentUser?.role.name === "provider";
    const action = isProvider ? "reject" : "cancel";
    const label = isProvider ? "Reject Application" : "Cancel Application";
    const loadingLabel = isProvider ? "Rejecting..." : "Cancelling...";

    const handleTerminate = async () => {
        try {
            setIsLoading(true);
            await petService[action](
                adoption?.pet.id || "",
                adoption?.id || ""
            );
            onSuccess?.();
        } catch (error) {
            console.error(`Failed to ${action} adoption:`, error);

            if (error instanceof AxiosError) {
                const errData = error.response?.data as ErrorResponse;
                toast.error(errData?.message);
                onError?.(errData);
            } else {
                onError?.(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleTerminate}
            disabled={isLoading}
            variant="destructive"
            className={
                className ??
                "bg-[#FF0000] hover:bg-red-600 rounded-2xl px-4 h-8 text-xs font-bold gap-1.5"
            }
        >
            <XCircle className="h-3.5 w-3.5" />
            {isLoading ? loadingLabel : label}
        </Button>
    );
}