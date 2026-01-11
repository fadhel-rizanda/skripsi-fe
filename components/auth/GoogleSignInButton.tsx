"use client"

import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function GoogleSignInButton() {
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<"adopter" | "provider">("adopter");
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = () => {
        setShowRoleModal(true);
    };

    const proceedWithGoogle = async () => {
        setIsLoading(true);

        try {
            document.cookie = `selectedRole=${selectedRole}; path=/; max-age=300; SameSite=Lax`;
            await signIn("google", {
                callbackUrl: "/dashboard",
            });
        } catch (error) {
            console.error("Google sign-in error:", error);
        } finally {
            setIsLoading(false);
            setShowRoleModal(false);
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3"
                onClick={handleGoogleSignIn}
            >
                <Icon icon="logos:google-icon" width={20} height={20} />
                Continue with Google
            </Button>

            <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Your Role</DialogTitle>
                        <DialogDescription>
                            Choose how you want to use the platform before continuing with Google.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <RadioGroup
                            value={selectedRole}
                            onValueChange={(value) => setSelectedRole(value as "adopter" | "provider")}
                            className="gap-4"
                        >
                            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent transition-colors">
                                <RadioGroupItem className="cursor-pointer" value="adopter" id="adopter" />
                                <div className="flex-1">
                                    <Label htmlFor="adopter" className="font-medium">
                                        Adopter
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {"I'm looking to adopt a pet"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent transition-colors">
                                <RadioGroupItem className="cursor-pointer" value="provider" id="provider" />
                                <div className="flex-1">
                                    <Label htmlFor="provider" className="font-medium">
                                        Provider
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {"I'm listing pets for adoption"}
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowRoleModal(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={proceedWithGoogle}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Icon icon="svg-spinners:ring-resize" className="mr-2 h-4 w-4" />
                                    Continuing...
                                </>
                            ) : (
                                "Continue with Google"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}