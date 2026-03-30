"use client";

import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SelectRoleDialog from "@/components/auth/SelectRoleDialog";
import {toast} from "sonner";
import {AxiosError} from "axios";
import {ErrorResponse} from "@/types";

export default function GoogleSignInButton() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"adopter" | "provider">("adopter");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      document.cookie = `selectedRole=${role}; path=/; max-age=300; SameSite=Lax`;
      await signIn("google", { callbackUrl: "/pets" });
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error instanceof AxiosError) {
        const errData = error.response?.data as ErrorResponse;
        toast.error(errData?.message);
      }
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-3"
        onClick={() => setOpen(true)}
      >
        <Icon icon="logos:google-icon" width={20} height={20} />
        Continue with Google
      </Button>

      <SelectRoleDialog
        open={open}
        onOpenChange={setOpen}
        selectedRole={role}
        onRoleChange={setRole}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  );
}
