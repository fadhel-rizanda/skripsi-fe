"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, XCircle } from "lucide-react";
import { UpdateRequirementInput, UpdateRequirementSchema } from "@/schemas/adoption.schema";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { requirementServices } from "@/services/adoptionServices";
import { Requirement } from "@/types/adoption";

interface Props {
    adoptionId: string;
    requirement: Requirement;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function UpdateRequirementForm({ adoptionId, requirement, onSuccess, onCancel }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const form = useForm<UpdateRequirementInput>({
        resolver: zodResolver(UpdateRequirementSchema),
        defaultValues: {
            name: requirement.name,
            notes: requirement.notes ?? "",
        },
    });

    const { register, handleSubmit, formState: { errors } } = form;

    const onSubmit = () => setDialogOpen(true);

    const handleFinalSubmit = async () => {
        const values = form.getValues();
        return await requirementServices.updateRequirement(adoptionId, requirement.id, values);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-700">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Proof of Address"
                            className="h-8 text-xs rounded-lg bg-white"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-700">Notes</label>
                        <Textarea
                            placeholder="Describe the requirement in detail"
                            className="text-xs rounded-lg bg-white resize-none min-h-24 w-full"
                            {...register("notes")}
                        />
                        {errors.notes && (
                            <p className="text-red-500 text-xs">{errors.notes.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 pt-1 mt-1">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 rounded-xl h-9 text-xs font-bold gap-1.5 border-red-200 text-red-500 hover:bg-red-50"
                    >
                        <XCircle className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-9 text-xs font-bold gap-1.5"
                    >
                        <Save className="w-4 h-4" />
                        Update Requirement
                    </Button>
                </div>
            </form>

            <ActionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleFinalSubmit}
                onContinue={() => {
                    setDialogOpen(false);
                    onSuccess?.();
                }}
                title="Update Requirement?"
                description="Make sure the changes are correct before saving."
                successTitle="Update Successful"
                successDescription="The requirement has been updated."
                confirmText="Save Changes"
            />
        </>
    );
}