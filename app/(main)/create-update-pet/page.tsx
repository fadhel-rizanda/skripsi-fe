'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from 'react';
import type { CreatePetPayload } from '@/services/petServices';
import { Camera, CloudUpload, Trash2, X, FileText } from 'lucide-react';
import { attachmentService } from '@/services/attachmentServices';
import { petService } from '@/services/petServices';
import { generalService } from '@/services/generalServices'; // Added import
import { PET_SIZES, PET_GENDERS, PetSize, PetGender } from '@/lib/constants/pet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function RehomePetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const petId = searchParams.get("id");
  const isEditMode = typeof petId === "string" && petId.length > 0;

  const [fetchingPet, setFetchingPet] = useState(false);

  // --- Refs untuk trigger input file ---
  const profileInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // --- Types ---
  type AnimalType = { id: string; name?: string; label?: string };
  type TagOption = { id: string; name?: string; label?: string };
  type FileItem = { name: string; size: string };

  // --- State ---
  const [form, setForm] = useState<{
    name: string;
    breed: string;
    typeOfAnimalId: string;
    size: PetSize | "";
    dob: string;
    gender: PetGender | "";
    about: string;
    physiqueIds: string[];
    personalityIds: string[];
    hasSpecialNeeds: boolean;
    profilePictureIds: string[];
    additionalRecordIds: string[];
  }>({
    name: "",
    breed: "",
    typeOfAnimalId: "",
    size: "",
    dob: "",
    gender: "",
    about: "",
    physiqueIds: [],
    personalityIds: [],
    hasSpecialNeeds: false,
    profilePictureIds: [],
    additionalRecordIds: [],
  });

  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const [physiqueOptions, setPhysiqueOptions] = useState<TagOption[]>([]);
  const [personalityOptions, setPersonalityOptions] = useState<TagOption[]>([]);

  const [profileFiles, setProfileFiles] = useState<FileItem[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<FileItem[]>([]);

  // Store actual File objects for new uploads (not yet uploaded to S3)
  const [pendingProfileFiles, setPendingProfileFiles] = useState<File[]>([]);
  const [pendingAdditionalFiles, setPendingAdditionalFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  function getErrorMessage(err: unknown, fallback = 'An error occurred') {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || fallback;
    try {
      const e = err as any;
      return e?.response?.data?.message || e?.message || fallback;
    } catch {
      return fallback;
    }
  }

  // --- Fetch Pet Detail ---
  const fetchPetDetail = async (id: string) => {
    if (!id || id === "undefined") return;
    setFetchingPet(true);
    try {
      const pet = await petService.getPetById(id);
      setForm({
        name: pet.name || "",
        breed: pet.breed || "",
        typeOfAnimalId: pet.type_of_animal_id ? String(pet.type_of_animal_id) : "",
        size: pet.size || "",
        dob: pet.date_of_birth ? pet.date_of_birth.split("T")[0] : "",
        gender: pet.gender || "",
        about: pet.about || "",
        physiqueIds: (pet.physique_tags || []).map(t => String(t.id)),
        personalityIds: (pet.personality_tags || []).map(t => String(t.id)),
        hasSpecialNeeds: !!pet.special_needs,
        profilePictureIds: (pet.profile_pictures || []).map(p => String(p.id)),
        additionalRecordIds: (pet.additional_records || []).map(r => String(r.id)),
      });
      setProfileFiles(
        (pet.profile_pictures || []).map((p: any) => ({
          name: p.filename || p.public_url || "Existing Image",
          size: "-",
        }))
      );
      setAdditionalFiles(
        (pet.additional_records || []).map((r: any) => ({
          name: r.filename || "Existing File",
          size: "-",
        }))
      );

      // Update options with existing tags so names show up
      if (pet.physique_tags?.length) {
        setPhysiqueOptions(prev => {
          // Combine existing with pet tags, removing duplicates by ID
          const newTags = pet.physique_tags!.map((t: any) => ({ id: String(t.id), name: t.name, label: t.name }));
          const existingIds = new Set(prev.map(p => p.id));
          return [...prev, ...newTags.filter(t => !existingIds.has(t.id))];
        });
      }
      if (pet.personality_tags?.length) {
        setPersonalityOptions(prev => {
          const newTags = pet.personality_tags!.map((t: any) => ({ id: String(t.id), name: t.name, label: t.name }));
          const existingIds = new Set(prev.map(p => p.id));
          return [...prev, ...newTags.filter(t => !existingIds.has(t.id))];
        });
      }


    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load pet data"));
    } finally {
      setFetchingPet(false);
    }
  };

  useEffect(() => {
    if (petId) {
      fetchPetDetail(petId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  // Fetch Options (Animal Types, Physique, Personality)
  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        const [typesData, identitiesData, personalitiesData] = await Promise.all([
          generalService.getAnimalTypes(),
          generalService.getTags('physique'), // assuming 'physique' is the type key for physique tags
          generalService.getTagPersonalities()
        ]);

        if (mounted) {
          setAnimalTypes(typesData.map(t => ({ id: String(t.id), name: t.name, label: t.name })));
          setPhysiqueOptions(identitiesData.map(t => ({ id: t.id, name: t.name, label: t.name })));
          setPersonalityOptions(personalitiesData.map(t => ({ id: t.id, name: t.name, label: t.name })));
        }
      } catch (error) {
        console.error("Failed to fetch options", error);
        toast.error("Failed to load form options");
      }
    };

    fetchOptions();

    return () => { mounted = false; };
  }, []);

  // --- Handlers ---
  const addTag = (id: string, type: 'physique' | 'personality') => {
    setForm(prev => {
      const list = type === 'physique' ? prev.physiqueIds : prev.personalityIds;
      if (list.includes(id)) return prev;

      return {
        ...prev,
        [type === 'physique' ? 'physiqueIds' : 'personalityIds']: [...list, id]
      };
    });
  };

  const removeTag = (id: string, type: 'physique' | 'personality') => {
    setForm(prev => ({
      ...prev,
      [type === 'physique' ? 'physiqueIds' : 'personalityIds']:
        (type === 'physique' ? prev.physiqueIds : prev.personalityIds).filter(tid => tid !== id)
    }));
  };

  const removeFile = (index: number, type: 'profile' | 'additional') => {
    if (type === 'profile') {
      setProfileFiles(prev => prev.filter((_, i) => i !== index));
      setPendingProfileFiles(prev => prev.filter((_, i) => i !== index));
      setForm(prev => ({
        ...prev,
        profilePictureIds: prev.profilePictureIds.filter((_, i) => i !== index)
      }));
    } else {
      setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
      setPendingAdditionalFiles(prev => prev.filter((_, i) => i !== index));
      setForm(prev => ({
        ...prev,
        additionalRecordIds: prev.additionalRecordIds.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'additional') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value input agar user bisa upload file yang sama jika sebelumnya dihapus
    e.target.value = '';

    // Validasi Ukuran Client-side (contoh max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }

    const fileItem = { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB` };

    if (type === 'profile') {
      setPendingProfileFiles(prev => [...prev, file]);
      setProfileFiles(prev => [...prev, fileItem]);
      toast.success('Profile picture added (will upload on submit)');
    } else {
      setPendingAdditionalFiles(prev => [...prev, file]);
      setAdditionalFiles(prev => [...prev, fileItem]);
      toast.success('Additional record added (will upload on submit)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fetchingPet) return;

    if (!form.typeOfAnimalId) return toast.error('Please select a type of animal');
    if (!form.size) return toast.error('Please select a valid size');
    if (!form.gender) return toast.error('Please select a gender');
    if (!form.dob) return toast.error('Date of birth is required');
    if (!form.about || form.about.trim().length < 10) return toast.error('Description must be at least 10 characters');
    if (!form.physiqueIds.length) return toast.error('Select at least one physique tag');
    if (!form.personalityIds.length) return toast.error('Select at least one personality tag');
    if (!form.profilePictureIds.length && !pendingProfileFiles.length) return toast.error('Please upload at least one profile picture');

    setLoading(true);
    try {
      // Upload pending files first
      const uploadedProfileIds: string[] = [];
      const uploadedAdditionalIds: string[] = [];

      // Upload new profile pictures
      for (const file of pendingProfileFiles) {
        const presigned = await attachmentService.getPresignedUrl({
          filename: file.name,
          mime_type: file.type,
          file_size: file.size,
          is_public: true
        });
        await attachmentService.uploadToS3(presigned.data.upload_url, file);
        await attachmentService.confirmUpload(presigned.data.id);
        uploadedProfileIds.push(presigned.data.id);
      }

      // Upload new additional records
      for (const file of pendingAdditionalFiles) {
        const presigned = await attachmentService.getPresignedUrl({
          filename: file.name,
          mime_type: file.type,
          file_size: file.size,
          is_public: true
        });
        await attachmentService.uploadToS3(presigned.data.upload_url, file);
        await attachmentService.confirmUpload(presigned.data.id);
        uploadedAdditionalIds.push(presigned.data.id);
      }

      const dateIso = new Date(form.dob).toISOString();

      // Combine existing IDs with newly uploaded IDs
      const allProfileIds = [...form.profilePictureIds, ...uploadedProfileIds];
      const allAdditionalIds = [...form.additionalRecordIds, ...uploadedAdditionalIds];

      const payload: CreatePetPayload = {
        type_of_animal_id: form.typeOfAnimalId,
        size: form.size as PetSize,
        name: form.name.trim(),
        date_of_birth: dateIso,
        gender: form.gender,
        about: form.about.trim(),
        breed: form.breed.trim(),
        special_needs: form.hasSpecialNeeds,
        profile_picture_ids: allProfileIds,
        physique_ids: form.physiqueIds,
        personality_ids: form.personalityIds,
        additional_record_ids: allAdditionalIds.length ? allAdditionalIds : undefined,
      };

      if (isEditMode) {
        await petService.updatePet(petId!, payload);
        toast.success('Pet updated successfully!');
      } else {
        await petService.createPet(payload);
        toast.success('Pet created successfully!');
      }

      router.push('/find-pet');
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, isEditMode ? "Failed to update pet" : "Failed to create pet")
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk mendapatkan nama animal type dari ID
  const getAnimalTypeName = (typeId: string) => {
    const found = animalTypes.find((t) => String(t.id) === String(typeId));
    return found ? found.name || found.label : "";
  };

  // Helper untuk memfilter opsi yang sudah dipilih
  const availablePhysiques = physiqueOptions.filter(opt => !form.physiqueIds.includes(opt.id));
  const availablePersonalities = personalityOptions.filter(opt => !form.personalityIds.includes(opt.id));

  return (
    <div className="min-h-screen bg-[#e6f4ea] py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-700">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? "Update Pet Information" : "Rehome a Pet"}
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto">
          {isEditMode
            ? "Edit the details below to update your pet's information."
            : "We're here to help you find a new loving home for your pet. Please provide as much information as possible to find the best match."}
        </p>

        {fetchingPet && (
          <div className="flex justify-center items-center mt-4">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-2"></span>
            <span className="text-green-600 font-semibold">Loading pet data...</span>
          </div>
        )}
      </div>

      <div className="mx-auto bg-white rounded-xl shadow-sm p-6 max-w-4xl">
        <form
          className={`grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-x-2 ${fetchingPet ? "opacity-60 pointer-events-none" : ""}`}
          onSubmit={handleSubmit}
        >
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Pet Information</h2>

            <div>
              <Label htmlFor="pet-name" className="mb-1 text-sm">Name *</Label>
              <Input
                id="pet-name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Budy"
                required
              />
            </div>

            <div>
              <Label htmlFor="pet-breed" className="mb-1 text-sm">Breed *</Label>
              <Input
                id="pet-breed"
                value={form.breed}
                onChange={e => setForm(prev => ({ ...prev, breed: e.target.value }))}
                placeholder="e.g., Golden Retriever"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 text-sm">Type of Animal *</Label>
                <Select
                  key={`animal-type-${animalTypes.length}-${form.typeOfAnimalId}`}
                  value={form.typeOfAnimalId}
                  onValueChange={val => setForm(prev => ({ ...prev, typeOfAnimalId: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {animalTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>{type.name || type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 text-sm">Size *</Label>
                <Select value={form.size} onValueChange={val => setForm(prev => ({ ...prev, size: val as PetSize }))}>
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_SIZES.map(sz => (
                      <SelectItem key={sz.value} value={sz.value}>{sz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pet-dob" className="mb-1 text-sm">Date of Birth *</Label>
                <Input
                  id="pet-dob"
                  type="date"
                  value={form.dob}
                  onChange={e => setForm(prev => ({ ...prev, dob: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label className="mb-1 text-sm">Gender *</Label>
                <Select value={form.gender} onValueChange={(val: string) => setForm(prev => ({ ...prev, gender: val as PetGender }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_GENDERS.map(g => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="pet-about" className="mb-1 text-sm">About *</Label>
              <Textarea
                id="pet-about"
                rows={4}
                value={form.about}
                onChange={e => setForm(prev => ({ ...prev, about: e.target.value }))}
                placeholder="Describe the pet's health, behaviour, and personality"
                required
              />
            </div>

            {/* Physique Tags */}
            <div>
              <Label className="mb-1 text-sm">Physique*</Label>
              <Select value="" onValueChange={val => val && addTag(val, 'physique')}>
                <SelectTrigger className="text-gray-500 font-normal w-full">
                  <SelectValue placeholder={availablePhysiques.length === 0 ? "No more tags available" : "Select to add tags..."} />
                </SelectTrigger>
                <SelectContent>
                  {availablePhysiques.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.name || opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-4 mt-4">
                {form.physiqueIds.map((id) => (
                  <Badge key={id} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm font-medium">
                    {physiqueOptions.find(opt => opt.id === id)?.name || id}
                    <button type="button" onClick={() => removeTag(id, 'physique')} className="ml-2 hover:text-green-900 transition-colors">
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Personality Tags */}
            <div>
              <Label className="mb-1 text-sm">Personality*</Label>
              <Select value="" onValueChange={val => val && addTag(val, 'personality')}>
                <SelectTrigger className="text-gray-500 font-normal w-full">
                  <SelectValue placeholder={availablePersonalities.length === 0 ? "No more tags available" : "Select to add tags..."} />
                </SelectTrigger>
                <SelectContent>
                  {availablePersonalities.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.name || opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-4 mt-4">
                {form.personalityIds.map((id) => (
                  <Badge key={id} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm font-medium">
                    {personalityOptions.find(opt => opt.id === id)?.name || id}
                    <button type="button" onClick={() => removeTag(id, 'personality')} className="ml-2 hover:text-green-900 transition-colors">
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Uploads */}
          <div className="space-y-4">
            {/* Profile Picture Upload */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-6 max-w-[387px] mx-auto">Profile Picture*</h2>

              <div
                onClick={() => !loading && profileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white hover:bg-gray-100 transition-colors cursor-pointer w-full max-w-[387px] h-[198px] mx-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex justify-center mb-3">
                  <Camera size={48} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700 max-w-[260px] mx-auto">Upload Profile Picture</h3>
                <p className="text-sm text-gray-500 mb-4">PNG, JPG, GIF (MAX. 800x800px)</p>

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'profile')}
                  disabled={loading}
                />

                <Button type="button" variant="outline" className="pointer-events-none">Select File</Button>
              </div>

              <p className="text-xs text-gray-500 mt-2 mb-3 max-w-[387px] mx-auto">A great profile picture is key to finding a new home.</p>

              <div className="space-y-4">
                {profileFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-gray-200 rounded p-3 bg-white text-sm shadow-sm w-[387px] h-[24px] mx-auto">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-gray-400 shrink-0" />
                      <span className="text-gray-600 truncate">{file.name}</span>
                      <span className="text-gray-400 text-xs shrink-0">({file.size})</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx, 'profile')} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Records Upload */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-6 max-w-[387px] mx-auto">Additional Records</h2>

              <div
                onClick={() => !loading && additionalInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white hover:bg-gray-100 transition-colors cursor-pointer w-full max-w-[387px] h-[198px] mx-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex justify-center mb-3">
                  <CloudUpload size={48} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700 max-w-[260px] mx-auto">Click to upload or drag and drop</h3>
                <p className="text-sm text-gray-500 mb-4">Photos, videos, or medical records</p>

                <input
                  ref={additionalInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'additional')}
                  disabled={loading}
                />

                <Button type="button" variant="outline" className="pointer-events-none">Upload Files</Button>
              </div>

              <p className="text-xs text-gray-500 mt-2 mb-3 max-w-[387px] mx-auto">Please upload multiple high-quality photos and any relevant documents.</p>

              <div className="space-y-4">
                {additionalFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-gray-200 rounded p-3 bg-white text-sm shadow-sm w-[387px] h-[24px] mx-auto">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-gray-400 shrink-0" />
                      <span className="text-gray-600 truncate">{file.name}</span>
                      <span className="text-gray-400 text-xs shrink-0">({file.size})</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx, 'additional')} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Bottom row: sekarang ADA DI DALAM form */}
          <div className="col-span-1 lg:col-span-2 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={form.hasSpecialNeeds}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, hasSpecialNeeds: !!checked }))}
                  className="border-green-400 dark:border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <span className="text-sm font-medium">Does this animal have any special needs?</span>
              </div>

              <div className="flex justify-end mr-3">
                <Button
                  type="submit"
                  className="bg-[#22c55e] hover:bg-green-600 text-black font-bold rounded-lg shadow-sm w-[188px] h-[48px] text-base"
                  disabled={loading || fetchingPet}
                >
                  {loading ? 'Submitting...' : isEditMode ? "Update Pet" : "Submit for Review"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
