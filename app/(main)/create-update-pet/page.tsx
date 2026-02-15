'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CreatePetPayload } from '@/services/petServices';
import { Camera, CloudUpload, Trash2, X, FileText } from 'lucide-react';
import { attachmentService } from '@/services/attachmentServices';
import { petService } from '@/services/petServices';
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
  // --- Refs untuk trigger input file ---
  const profileInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // --- Types ---
  type AnimalType = { id: string; name?: string; label?: string };
  type TagOption = { id: string; name?: string; label?: string };
  type FileItem = { name: string; size: string };
  type StagedItem = File | { existingId: string };

  // API response shapes used locally to avoid `any`
  type Tag = { id: string | number; name?: string; label?: string };
  type Attachment = { id: string | number; filename?: string; public_url?: string; file_size?: number };
  type ErrorLike = { response?: { data?: { message?: string } }; message?: string };
  type UpdatePetPayload = Partial<CreatePetPayload> & { profile_picture_ids?: string[]; additional_record_ids?: string[] };

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

  const [animalTypes] = useState<AnimalType[]>([]);
  const [physiqueOptions] = useState<TagOption[]>([]);
  const [personalityOptions] = useState<TagOption[]>([]);
  
  const [profileFiles, setProfileFiles] = useState<FileItem[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<FileItem[]>([]);
  // Raw File objects staged by user (will be uploaded on form submit)
  const [profileFilesRaw, setProfileFilesRaw] = useState<StagedItem[]>([]);
  const [additionalFilesRaw, setAdditionalFilesRaw] = useState<StagedItem[]>([]);
  // Drag state for dropzones
  const [profileDragActive, setProfileDragActive] = useState<boolean>(false);
  const [additionalDragActive, setAdditionalDragActive] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [petIdState, setPetIdState] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const isValidUuid = (id?: string | null) => !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  // --- Effects ---
  useEffect(() => {
    // Submit placeholder removed from right column; bottom row added after columns
    // (If you had async logic here, restore it. Otherwise, remove this effect if not needed.)
  }, []);

  // Load pet data when ?id= is present (edit mode)
  // Extracted loader so we can call it from multiple places
  const loadPetById = async (currentId: string) => {
    if (!currentId) return;
    setIsEdit(true);
    setPetIdState(currentId);
    setLoading(true);
    console.debug('[create-update-pet] loadPet id=', currentId);
    if (!isValidUuid(currentId)) console.warn('[create-update-pet] id does not match UUID pattern:', currentId);
    try {
      const p = await petService.getPetById(currentId);
      if (!p) return;

      setForm(prev => ({
        ...prev,
        name: p.name || "",
        breed: p.breed || "",
        typeOfAnimalId: p.type_of_animal_id || "",
        size: (p.size as PetSize) || "",
        dob: p.date_of_birth ? new Date(p.date_of_birth).toISOString().slice(0,10) : "",
        gender: (p.gender as PetGender) || "",
        about: p.about || "",
        physiqueIds: (p.physique_tags || []).map((t: Tag) => String(t.id)),
        personalityIds: (p.personality_tags || []).map((t: Tag) => String(t.id)),
        hasSpecialNeeds: !!p.special_needs,
        profilePictureIds: [],
        additionalRecordIds: [],
      }));

      setProfileFiles((p.profile_pictures || []).map((a: Attachment) => ({ name: a.filename || a.public_url || 'file', size: a.file_size ? `${(a.file_size/1024/1024).toFixed(2)} MB` : '—' })));
      setAdditionalFiles((p.additional_records || []).map((a: Attachment) => ({ name: a.filename || a.public_url || 'file', size: a.file_size ? `${(a.file_size/1024/1024).toFixed(2)} MB` : '—' })));
      setProfileFilesRaw((p.profile_pictures || []).map((a: Attachment) => ({ existingId: String(a.id) })) as StagedItem[]);
      setAdditionalFilesRaw((p.additional_records || []).map((a: Attachment) => ({ existingId: String(a.id) })) as StagedItem[]);
    } catch (err) {
      console.error('Failed to load pet for edit', err);
      try {
        const e = err as ErrorLike;
        const serverMsg = e.response?.data?.message || e.response?.data || e.message;
        toast.error(String(serverMsg) || 'Failed to load pet for editing');
      } catch {
        toast.error('Failed to load pet for editing');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prefer Next's searchParams but fall back to window.location for some client navigations
    const raw = (searchParams?.get?.('id')) ?? (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null);
    const currentId = raw && raw !== 'undefined' ? raw : null;
    if (!currentId) return;
    loadPetById(currentId);
  }, [searchParams]);

  // Ensure mount-time detection (some client navigations may not update `useSearchParams` immediately)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = new URLSearchParams(window.location.search).get('id');
    const currentId = raw && raw !== 'undefined' ? raw : null;
    if (currentId && !petIdState) {
      loadPetById(currentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setProfileFilesRaw(prev => prev.filter((_, i) => i !== index));
      setForm(prev => ({ ...prev, profilePictureIds: prev.profilePictureIds.filter((_, i) => i !== index) }));
    } else {
      setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
      setAdditionalFilesRaw(prev => prev.filter((_, i) => i !== index));
      setForm(prev => ({ ...prev, additionalRecordIds: prev.additionalRecordIds.filter((_, i) => i !== index) }));
    }
  };

  // Stage selected file locally; actual upload happens on form submit
  const handleFileAdd = (file: File, type: 'profile' | 'additional') => {
    if (!file) return;
    // Client-side size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }

    const fileItem = { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB` };

    if (type === 'profile') {
      setProfileFiles(prev => [...prev, fileItem]);
      setProfileFilesRaw(prev => [...prev, file]);
    } else {
      setAdditionalFiles(prev => [...prev, fileItem]);
      setAdditionalFilesRaw(prev => [...prev, file]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'additional') => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    handleFileAdd(file, type);
  };

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleProfileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setProfileDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileAdd(file, 'profile');
  };

  const handleAdditionalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setAdditionalDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileAdd(file, 'additional');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.name.trim()) return toast.error('Name is required');
    if (!form.breed || !form.breed.trim()) return toast.error('Breed is required');
    if (!form.typeOfAnimalId) return toast.error('Please select a type of animal');
    if (!form.size) return toast.error('Please select a valid size');
    if (!form.gender) return toast.error('Please select a gender');
    if (!form.dob) return toast.error('Date of birth is required');
    if (!form.about || form.about.trim().length < 10) return toast.error('Description must be at least 10 characters');
    if (!form.physiqueIds.length) return toast.error('Select at least one physique tag');
    if (!form.personalityIds.length) return toast.error('Select at least one personality tag');

    setLoading(true);
    try {
      // Process staged items: upload new Files, keep existing placeholders
      const finalProfileIds: string[] = [];
      for (const item of profileFilesRaw) {
        if (item instanceof File) {
          const presigned = await attachmentService.getPresignedUrl({
            filename: item.name,
            mime_type: item.type,
            file_size: item.size,
            is_public: true,
          });
          await attachmentService.uploadToS3(presigned.url, item);
          await attachmentService.confirmUpload(presigned.id);
          finalProfileIds.push(presigned.id);
        } else if ('existingId' in item) {
          finalProfileIds.push(item.existingId);
        }
      }

      const finalAdditionalIds: string[] = [];
      for (const item of additionalFilesRaw) {
        if (item instanceof File) {
          const presigned = await attachmentService.getPresignedUrl({
            filename: item.name,
            mime_type: item.type,
            file_size: item.size,
            is_public: true,
          });
          await attachmentService.uploadToS3(presigned.url, item);
          await attachmentService.confirmUpload(presigned.id);
          finalAdditionalIds.push(presigned.id);
        } else if ('existingId' in item) {
          finalAdditionalIds.push(item.existingId);
        }
      }

      if (finalProfileIds.length === 0) {
        return toast.error('Please upload at least one profile picture');
      }

      const dateIso = new Date(form.dob).toISOString();
      const payload: CreatePetPayload = {
        type_of_animal_id: form.typeOfAnimalId,
        size: form.size as PetSize,
        name: form.name.trim(),
        date_of_birth: dateIso,
        gender: form.gender,
        about: form.about.trim(),
        breed: form.breed.trim(),
        special_needs: form.hasSpecialNeeds,
        profile_picture_ids: [...form.profilePictureIds, ...finalProfileIds],
        physique_ids: form.physiqueIds,
        personality_ids: form.personalityIds,
        additional_record_ids: [...form.additionalRecordIds, ...finalAdditionalIds].length ? [...form.additionalRecordIds, ...finalAdditionalIds] : undefined,
      };

      if (isEdit && petIdState) {
        // For edit, send merged ids from staged arrays
        const updatePayload: UpdatePetPayload = {
          ...payload,
          profile_picture_ids: finalProfileIds,
          additional_record_ids: finalAdditionalIds.length ? finalAdditionalIds : undefined,
        };
        await petService.updatePet(petIdState, updatePayload);
        toast.success('Pet updated successfully!');
        router.push(`/detail-pet?id=${petIdState}`);
      } else {
        // For create, use final ids computed above
        const createPayload: CreatePetPayload = {
          ...payload,
          profile_picture_ids: finalProfileIds,
          additional_record_ids: finalAdditionalIds.length ? finalAdditionalIds : undefined,
        };
        const created = await petService.createPet(createPayload);
        const newId = (created && (created.id || created.data?.id)) || null;
        toast.success('Pet created successfully!');
        if (newId) router.push(`/detail-pet?id=${newId}`);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Failed to create pet'));
    } finally {
      setLoading(false);
    }
  };

  function getErrorMessage(err: unknown, fallback = 'An error occurred') {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || fallback;
    try {
      const e = err as ErrorLike;
      return (e.response?.data as { message?: string } | undefined)?.message || e.message || fallback;
    } catch {
      return fallback;
    }
  }

  // Helper untuk memfilter opsi yang sudah dipilih
  const availablePhysiques = physiqueOptions.filter(opt => !form.physiqueIds.includes(opt.id));
  const availablePersonalities = personalityOptions.filter(opt => !form.personalityIds.includes(opt.id));

  return (
    <div className="min-h-screen bg-[#e6f4ea] py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-700">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rehome a Pet</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We&apos;re here to help you find a new loving home for your pet. Please provide as much information
          as possible to find the best match.
        </p>
      </div>

      {/* Hapus hardcoded height agar responsif */}
      <div className="mx-auto bg-white rounded-xl shadow-sm p-6 max-w-4xl">
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-x-2" onSubmit={handleSubmit}>
          
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Pet Information</h2>
            
            <div>
              <Label htmlFor="pet-name" className="mb-1 text-sm">Name <span className="text-red-500">*</span></Label>
              <Input
                id="pet-name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Budy"
                required
              />
            </div>

            <div>
              <Label htmlFor="pet-breed" className="mb-1 text-sm">Breed <span className="text-red-500">*</span></Label>
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
                <Label className="mb-1 text-sm">Type of Animal <span className="text-red-500">*</span></Label>
                <Select value={form.typeOfAnimalId} onValueChange={val => setForm(prev => ({ ...prev, typeOfAnimalId: val }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {animalTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name || type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 text-sm">Size <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="pet-dob" className="mb-1 text-sm">Date of Birth <span className="text-red-500">*</span></Label>
                <Input
                  id="pet-dob"
                  type="date"
                  value={form.dob}
                  onChange={e => setForm(prev => ({ ...prev, dob: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label className="mb-1 text-sm">Gender <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="pet-about" className="mb-1 text-sm">About <span className="text-red-500">*</span></Label>
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
              <Label className="mb-1 text-sm">Physique <span className="text-red-500">*</span></Label>
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
              <Label className="mb-1 text-sm">Personality <span className="text-red-500">*</span></Label>
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

            {/* checkbox moved to right column so it's on the same row as submit */}
          </div>

          {/* RIGHT COLUMN: Uploads */}
          <div className="space-y-4">
            
            {/* Profile Picture Upload */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-6 max-w-[387px] mx-auto">Profile Picture <span className="text-red-500">*</span></h2>
              <div
                onClick={() => !loading && profileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={() => setProfileDragActive(true)}
                onDragLeave={() => setProfileDragActive(false)}
                onDrop={handleProfileDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer w-full max-w-[387px] h-[198px] mx-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${profileDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-100'}`}
              >
                <div className="flex justify-center mb-3">
                  <Camera size={48} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700 max-w-[260px] mx-auto">Upload Profile Picture</h3>
                <p className="text-sm text-gray-500 mb-4">PNG, JPG, GIF (MAX. 800x800px)</p>
                {/* Input disembunyikan tapi bisa ditrigger lewat ref */}
                  <input 
                  ref={profileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileSelect(e, 'profile')} 
                  disabled={loading} 
                />
                <Button type="button" variant="outline" className="pointer-events-none">Select File</Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 mb-3 max-w-[387px] mx-auto">A great profile picture is key to finding a new home.</p>
              
              <div className="space-y-4">
                {profileFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-gray-200 rounded p-2 bg-white text-sm shadow-sm w-full max-w-[387px] h-8 mx-auto">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span className="text-gray-600 truncate max-w-[220px]">{file.name}</span>
                      <span className="text-gray-400 text-xs ml-2 shrink-0">({file.size})</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx, 'profile')} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
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
                onDragOver={handleDragOver}
                onDragEnter={() => setAdditionalDragActive(true)}
                onDragLeave={() => setAdditionalDragActive(false)}
                onDrop={handleAdditionalDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer w-full max-w-[387px] h-[198px] mx-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${additionalDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-100'}`}
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
                  onChange={(e) => handleFileSelect(e, 'additional')} 
                  disabled={loading} 
                />
                 <Button type="button" variant="outline" className="pointer-events-none">Upload Files</Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 mb-3 max-w-[387px] mx-auto">Please upload multiple high-quality photos and any relevant documents.</p>
              
              <div className="space-y-4">
                {additionalFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-gray-200 rounded p-2 bg-white text-sm shadow-sm w-full max-w-[387px] h-8 mx-auto">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span className="text-gray-600 truncate max-w-[220px]">{file.name}</span>
                      <span className="text-gray-400 text-xs ml-2 shrink-0">({file.size})</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx, 'additional')} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Bottom row: spans both columns */}
        <div className="col-span-full mt-6 pt-6 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-0 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <Checkbox
                checked={form.hasSpecialNeeds}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, hasSpecialNeeds: !!checked }))}
                className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <span className="font-medium">Does this animal have any special needs?</span>
            </label>

            <div className="flex-shrink-0 mt-2 sm:mt-0 sm:ml-4">
              {isEdit ? (
                <Button
                  type="submit"
                  className="bg-[#22c55e] hover:bg-green-600 text-black font-bold rounded-lg shadow-sm mr-4 w-[188px] h-[48px] text-base"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-[#22c55e] hover:bg-green-600 text-black font-bold rounded-lg shadow-sm mr-4 w-[188px] h-[48px] text-base"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </Button>
              )}
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}