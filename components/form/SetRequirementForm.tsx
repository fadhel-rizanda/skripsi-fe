"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, X, Save, XCircle } from "lucide-react";
import { CreateRequirementInput, CreateRequirementSchema } from "@/schemas/adoption.schema";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { requirementServices } from "@/services/adoptionServices";
import { useTagsOptions } from "@/hooks/useFilterOptions";
import { SearchableCombobox } from "@/components/combobox/SearchableCombobox";
import {TAG_TYPE} from "@/constant/tag-type";

interface Props {
    adoptionId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function SetRequirementForm({ adoptionId, onSuccess, onCancel }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const {
        options: requirementTags,
        isLoading: isLoadingRequirementTags,
        setSearch: setRequirementSearch,
        loadMore: loadMoreRequirement,
        hasMore: hasMoreRequirement,
    } = useTagsOptions(TAG_TYPE.ADOPTION.REQUIREMENT);

    const form = useForm<CreateRequirementInput>({
        resolver: zodResolver(CreateRequirementSchema),
        defaultValues: {
            requirements: [{ name: "", notes: "", tag_id: "" }],
        },
    });

    const { control, register, handleSubmit, formState, setValue, watch } = form;
    const { errors } = formState;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "requirements",
    });

    const onSubmit = () => setDialogOpen(true);

    const handleFinalSubmit = async () => {
        const values = form.getValues();
        return await requirementServices.createRequirements(adoptionId, values);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 max-h-105 overflow-y-auto pr-1">
                    {fields.map((field, index) => {
                        const tagId = watch(`requirements.${index}.tag_id`);
                        return (
                            <div
                                key={field.id}
                                className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col gap-3 relative"
                            >
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Tag */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableCombobox
                                        options={requirementTags}
                                        selectedValues={tagId ? [tagId] : []}
                                        onSelect={(value) =>
                                            setValue(`requirements.${index}.tag_id`, value, { shouldValidate: true })
                                        }
                                        onSearch={setRequirementSearch}
                                        onLoadMore={loadMoreRequirement}
                                        isLoading={isLoadingRequirementTags}
                                        hasMore={hasMoreRequirement}
                                        placeholder="Select requirement type..."
                                        emptyMessage="No types found."
                                        mode="single"
                                        className="w-full rounded-lg text-xs h-8"
                                    />
                                    {errors.requirements?.[index]?.tag_id && (
                                        <p className="text-red-500 text-xs">
                                            {errors.requirements[index]?.tag_id?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="e.g. Proof of Address"
                                        className="h-8 text-xs rounded-lg bg-white"
                                        {...register(`requirements.${index}.name`)}
                                    />
                                    {errors.requirements?.[index]?.name && (
                                        <p className="text-red-500 text-xs">
                                            {errors.requirements[index]?.name?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-700">Notes</label>
                                    <Textarea
                                        placeholder="Describe the requirement in detail"
                                        className="text-xs rounded-lg bg-white resize-none min-h-18 max-w-205"
                                        {...register(`requirements.${index}.notes`)}
                                    />
                                    {errors.requirements?.[index]?.notes && (
                                        <p className="text-red-500 text-xs">
                                            {errors.requirements[index]?.notes?.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {errors.requirements?.message && (
                    <p className="text-red-500 text-xs">{errors.requirements.message}</p>
                )}

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => append({ name: "", notes: "", tag_id: "" })}
                    className="w-full bg-[#19E619] hover:bg-green-500 text-black text-xs font-semibold rounded-xl h-9 gap-2"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add More
                </Button>

                <div className="flex gap-2 pt-1 border-t border-slate-100 mt-1">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 rounded-xl h-9 text-xs font-bold gap-1.5 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <XCircle className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-9 text-xs font-bold gap-1.5"
                    >
                        <Save className="w-4 h-4" />
                        Set Requirement
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
                title="Create Requirements?"
                description="Please review the requirements before continuing."
                successTitle="Requirements Created Successfully"
                successDescription="The adoption requirements have been saved."
                confirmText="Create"
                cancelText="Review Again"
            />
        </>
    );
}