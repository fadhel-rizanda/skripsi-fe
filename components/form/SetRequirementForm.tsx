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
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
                <div className="flex flex-col gap-3 sm:gap-4 max-h-[60vh] sm:max-h-[400px] overflow-y-auto pr-1">
                    {fields.map((field, index) => {
                        const tagId = watch(`requirements.${index}.tag_id`);
                        return (
                            <div
                                key={field.id}
                                className="border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-slate-50 flex flex-col gap-3 sm:gap-4 relative"
                            >
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        aria-label={`Remove requirement ${index + 1}`}
                                        title={`Remove requirement ${index + 1}`}
                                        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                                    </button>
                                )}

                                {/* Tag */}
                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
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
                                        placeholder="Select type..."
                                        emptyMessage="No types found."
                                        mode="single"
                                        className="w-full rounded-xl text-xs sm:text-sm h-9 sm:h-10"
                                    />
                                    {errors.requirements?.[index]?.tag_id && (
                                        <p className="text-red-500 text-xs sm:text-sm">
                                            {errors.requirements[index]?.tag_id?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="e.g. Proof of Address"
                                        className="h-9 sm:h-10 text-xs sm:text-sm rounded-xl bg-white"
                                        {...register(`requirements.${index}.name`)}
                                    />
                                    {errors.requirements?.[index]?.name && (
                                        <p className="text-red-500 text-xs sm:text-sm">
                                            {errors.requirements[index]?.name?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                                        Notes <span className="text-muted-foreground font-normal">(optional)</span>
                                    </label>
                                    <Textarea
                                        placeholder="Describe the requirement in detail"
                                        className="text-xs sm:text-sm rounded-xl bg-white resize-none min-h-[80px]"
                                        {...register(`requirements.${index}.notes`)}
                                    />
                                    {errors.requirements?.[index]?.notes && (
                                        <p className="text-red-500 text-xs sm:text-sm">
                                            {errors.requirements[index]?.notes?.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {errors.requirements?.message && (
                    <p className="text-red-500 text-xs sm:text-sm">{errors.requirements.message}</p>
                )}

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => append({ name: "", notes: "", tag_id: "" })}
                    className="w-full bg-green-100 hover:bg-green-200 text-green-700 text-xs sm:text-sm font-semibold rounded-xl h-9 sm:h-10 gap-2 mt-1 sm:mt-2"
                >
                    <PlusCircle className="w-4 h-4 sm:w-4 sm:h-4" />
                    Add More
                </Button>

                <div className="flex gap-2 pt-2 sm:pt-3 border-t border-slate-100 mt-1 sm:mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 rounded-xl h-9 sm:h-10 text-xs sm:text-sm font-bold gap-1.5 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <XCircle className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 bg-[#19E619] hover:bg-green-500 text-black rounded-xl h-9 sm:h-10 text-xs sm:text-sm font-bold gap-1.5"
                    >
                        <Save className="w-4 h-4" />
                        Save Requirements
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
                errorTitle="Process Failed"
                errorDescription="Please check your input and try again."
            />
        </>
    );
}