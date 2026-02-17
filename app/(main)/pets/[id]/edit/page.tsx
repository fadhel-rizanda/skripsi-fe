import PetForm from "@/components/form/PetForm";

export default async function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PetForm mode="edit" petId={id} />
}
