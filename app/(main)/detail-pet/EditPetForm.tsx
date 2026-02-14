"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PetDetail as OriginalPetDetail } from "@/types/pet";

// Extend PetDetail to include id if not already present
type PetDetail = OriginalPetDetail & { id: string | number };
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { petService } from "@/services/petServices";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  pet: PetDetail;
  onClose: () => void;
};

type FormValues = {
  name: string;
  about?: string;
  breed?: string;
  age?: number;
  age_unit?: string;
  size?: string;
  gender?: string;
};

export default function EditPetForm({ pet, onClose }: Props) {
  const router = useRouter();
  const form = useForm<FormValues>({
    defaultValues: {
      name: pet?.name || "",
      about: pet?.about || "",
      breed: pet?.breed || "",
      age: pet?.age ? Number(pet.age) : undefined,
      age_unit: pet?.age_unit || "",
      size: pet?.size || "",
      gender: pet?.gender || "",
    },
  });

  const { register, handleSubmit, reset } = form;

  useEffect(() => {
    if (pet) {
      reset({
        name: pet.name || "",
        about: pet.about || "",
        breed: pet.breed || "",
        age: pet.age ? Number(pet.age) : undefined,
        age_unit: pet.age_unit || "",
        size: pet.size || "",
        gender: pet.gender || "",
      });
    }
  }, [pet, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await petService.updatePet(pet.id, values);
      toast.success("Pet updated");
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update pet");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-4">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...register("name", { required: true })} />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>About</FormLabel>
          <FormControl>
            <textarea {...register("about")} className="w-full rounded-md border px-3 py-2 min-h-[100px]" />
          </FormControl>
        </FormItem>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormItem>
            <FormLabel>Breed</FormLabel>
            <FormControl>
              <Input {...register("breed")} />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Age</FormLabel>
            <FormControl>
              <Input type="number" {...register("age", { valueAsNumber: true })} />
            </FormControl>
          </FormItem>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" className="bg-green-500">Save</Button>
        </div>
      </form>
    </Form>
  );
}
