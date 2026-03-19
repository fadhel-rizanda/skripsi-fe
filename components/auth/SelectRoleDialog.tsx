"use client";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
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

type Role = "adopter" | "provider";

interface SelectRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function SelectRoleDialog({
                                           open,
                                           onOpenChange,
                                           selectedRole,
                                           onRoleChange,
                                           onConfirm,
                                           isLoading = false,
                                         }: SelectRoleDialogProps) {
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your Role</DialogTitle>
            <DialogDescription>
              Choose how you want to use the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <RadioGroup
                value={selectedRole}
                onValueChange={(value) => onRoleChange(value as Role)}
                className="gap-4"
            >
              <div className="flex items-start space-x-3 rounded-md border p-4 hover:bg-accent transition-colors">
                <RadioGroupItem value="adopter" id="adopter" />
                <div className="flex-1">
                  <Label htmlFor="adopter" className="font-medium">
                    Adopter
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    I'm looking to adopt a pet
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-4 hover:bg-accent transition-colors">
                <RadioGroupItem value="provider" id="provider" />
                <div className="flex-1">
                  <Label htmlFor="provider" className="font-medium">
                    Provider
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    I'm listing pets for adoption
                  </p>
                </div>
              </div>
            </RadioGroup>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Icon icon="lucide:info" className="h-3.5 w-3.5 shrink-0" />
              If you already have an account, your existing role will be used.
            </p>
          </div>
          <DialogFooter>
            <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? (
                  <>
                    <Icon icon="svg-spinners:ring-resize" className="mr-2 h-4 w-4" />
                    Continuing...
                  </>
              ) : (
                  "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}