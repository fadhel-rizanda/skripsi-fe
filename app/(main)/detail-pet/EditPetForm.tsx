"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { PetDetail as OriginalPetDetail } from "@/types/pet";
import { generalService, Tag } from "@/services/generalServices";
import { petService } from "@/services/petServices";
import { attachmentService } from "@/services/attachmentServices";

// UI Components
import { Form, FormItem, FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { FileText, Download, Upload, Loader2, Info, PawPrint, Heart, Image as ImageIcon, FileDigit } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// --- TYPES ---
type PetDetail = OriginalPetDetail & { id: string | number; date_of_birth?: string };

type Props = {
  pet: PetDetail;
  onClose: () => void;
};

type FormValues = {
  name: string;
  about?: string;
  breed?: string;
  type_of_animal_id?: string;
  size?: string;
  date_of_birth?: string;
  profile_picture_ids?: string[];
  special_needs?: boolean;
  physique_ids?: string[];
  personality_ids?: string[];
  additional_record_ids?: string[];
  gender?: string;
};

// --- SUB-COMPONENTS ---

const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description?: string }) => (
  <div className="flex items-start gap-2 mb-2 border-b border-slate-100 pb-1.5">
    <div className="p-1 bg-green-50 rounded-sm text-green-600">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div>
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{title}</h4>
      {description && <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>}
    </div>
  </div>
);

const FileUploadItem = ({ filename, url, }: { filename: string; url: string }) => (
  <div className="flex items-center justify-between gap-2 p-1.5 rounded-md border border-slate-200 bg-white hover:border-green-200 transition group">
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 min-w-0">
      <div className="p-1.5 bg-slate-100 rounded text-slate-500 group-hover:text-green-600 transition">
        <FileText className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs text-slate-700 truncate font-medium">{filename}</span>
    </a>
    <a href={url} download className="text-slate-400 hover:text-green-600 transition p-1.5 hover:bg-green-50 rounded-full">
      <Download className="h-3.5 w-3.5" />
    </a>
  </div>
);

const EditPetForm: React.FC<Props> = ({ pet, onClose }) => {
  const router = useRouter();
  
  // State
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [animalTypes, setAnimalTypes] = useState<Tag[]>([]);
  const [physiqueTags, setPhysiqueTags] = useState<Tag[]>([]);
  const [personalityTags, setPersonalityTags] = useState<Tag[]>([]);

  const [selectedPhysiqueIds, setSelectedPhysiqueIds] = useState<string[]>([]);
  const [selectedPersonalityIds, setSelectedPersonalityIds] = useState<string[]>([]);
  const [selectedProfilePictureIds, setSelectedProfilePictureIds] = useState<string[]>([]);
  const [selectedAdditionalRecordIds, setSelectedAdditionalRecordIds] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [stagedProfileFiles, setStagedProfileFiles] = useState<Array<{ file: File; preview: string }>>([]);
  const [stagedRecordFiles, setStagedRecordFiles] = useState<Array<{ file: File; filename: string }>>([]);
  const MAX_PROFILE_PHOTOS = 5;
  const MAX_RECORDS = 5;

  const form = useForm<FormValues>({
    defaultValues: {
      name: pet?.name || "",
      about: pet?.about || "",
      type_of_animal_id: pet?.type_of_animal_id ? String(pet.type_of_animal_id) : "",
      size: pet?.size || "",
      date_of_birth: (pet as PetDetail)?.date_of_birth || "",
      special_needs: pet?.special_needs || false,
      breed: pet?.breed || "",
      gender: pet?.gender || "",
    },
  });

  const { register, handleSubmit, reset, control, formState: { errors } } = form;

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, physiques, personalities] = await Promise.all([
          generalService.getAnimalTypes(),
          generalService.getTags("physique"),
          generalService.getTagPersonalities(),
        ]);
        setAnimalTypes(types);
        setPhysiqueTags(physiques);
        setPersonalityTags(personalities);
        } catch {
        toast.error("Failed to load options.");
      } finally {
        setLoadingMaster(false);
      }
    };
    fetchData();
  }, []);

  // Sync Data
  useEffect(() => {
    if (pet) {
      reset({
        name: pet.name || "",
        about: pet.about || "",
        type_of_animal_id: pet.type_of_animal_id ? String(pet.type_of_animal_id) : "",
        size: pet.size || "",
        date_of_birth: (pet as PetDetail).date_of_birth || "",
        breed: pet.breed || "",
        gender: pet.gender || "",
        special_needs: pet.special_needs || false,
      });

      setSelectedPhysiqueIds(pet.physique_tags?.map((t) => String(t.id)) || []);
      setSelectedPersonalityIds(pet.personality_tags?.map((t) => String(t.id)) || []);
      setSelectedProfilePictureIds(pet.profile_pictures?.map((p) => String(p.id)) || []);
      setSelectedAdditionalRecordIds(pet.additional_records?.map((r) => String(r.id)) || []);
    }
  }, [pet, reset]);

  // Handlers
  const handleToggleId = (id: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Stage files locally; upload will happen when user clicks Save
  const handleFileSelect = (file: File, target: "profile" | "record") => {
    if (!file) return;
    if (target === "profile") {
      const currentCount = selectedProfilePictureIds.length + stagedProfileFiles.length;
      if (currentCount >= MAX_PROFILE_PHOTOS) {
        toast.error(`You can upload up to ${MAX_PROFILE_PHOTOS} photos.`);
        return;
      }
      const preview = URL.createObjectURL(file);
      setStagedProfileFiles((s) => [...s, { file, preview }]);
    } else {
      const currentRecordCount = selectedAdditionalRecordIds.length + stagedRecordFiles.length;
      if (currentRecordCount >= MAX_RECORDS) {
        toast.error(`You can upload up to ${MAX_RECORDS} documents.`);
        return;
      }
      setStagedRecordFiles((s) => [...s, { file, filename: file.name }]);
    }
  };

  const removeStagedProfile = (index: number) => {
    setStagedProfileFiles((prev) => {
      const item = prev[index];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeStagedRecord = (index: number) => setStagedRecordFiles((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (values: FormValues) => {
    try {
      // Upload staged files first (if any)
      const uploadedProfileIds: string[] = [];
      const uploadedRecordIds: string[] = [];
      if (stagedProfileFiles.length > 0 || stagedRecordFiles.length > 0) setIsUploading(true);

      for (const staged of stagedProfileFiles) {
        try {
          const presigned = await attachmentService.getPresignedUrl({ filename: staged.file.name, mime_type: staged.file.type, file_size: staged.file.size, is_public: true });
          const { id, upload_url } = presigned.data || presigned;
          await attachmentService.uploadToS3(upload_url, staged.file);
          await attachmentService.confirmUpload(id);
          uploadedProfileIds.push(id);
        } catch (err) {
          console.error("Profile upload failed", err);
          toast.error(`Failed to upload ${staged.file.name}`);
        }
      }

      for (const staged of stagedRecordFiles) {
        try {
          const presigned = await attachmentService.getPresignedUrl({ filename: staged.file.name, mime_type: staged.file.type, file_size: staged.file.size, is_public: true });
          const { id, upload_url } = presigned.data || presigned;
          await attachmentService.uploadToS3(upload_url, staged.file);
          await attachmentService.confirmUpload(id);
          uploadedRecordIds.push(id);
        } catch (err) {
          console.error("Record upload failed", err);
          toast.error(`Failed to upload ${staged.file.name}`);
        }
      }

      const finalProfileIds = [...selectedProfilePictureIds, ...uploadedProfileIds];
      const finalRecordIds = [...selectedAdditionalRecordIds, ...uploadedRecordIds];

      const payload = {
        ...values,
        // keep type_of_animal_id as the string id (backend uses tag id strings)
        type_of_animal_id: values.type_of_animal_id || null,
        date_of_birth: !values.date_of_birth ? undefined : values.date_of_birth,
        physique_ids: selectedPhysiqueIds.map((x) => (typeof x === "string" && /^\d+$/.test(x) ? Number(x) : x)),
        personality_ids: selectedPersonalityIds.map((x) => (typeof x === "string" && /^\d+$/.test(x) ? Number(x) : x)),
        profile_picture_ids: finalProfileIds.map((x) => (typeof x === "string" && /^\d+$/.test(x) ? Number(x) : x)),
        additional_record_ids: finalRecordIds.map((x) => (typeof x === "string" && /^\d+$/.test(x) ? Number(x) : x)),
      };

      await petService.updatePet(pet.id, payload);
      toast.success("Pet data updated successfully");
      // cleanup staged previews
      stagedProfileFiles.forEach((s) => s.preview && URL.revokeObjectURL(s.preview));
      setStagedProfileFiles([]);
      setStagedRecordFiles([]);
      onClose();
      router.refresh();
    } catch (err) {
      console.error("Failed to update data", err);
      toast.error("Failed to update data");
    } finally {
      setIsUploading(false);
    }
  };

  // Small subcomponents to keep JSX tidy
  const LeftSidebar = () => (
    <div className="lg:col-span-4 space-y-3">
      <div className="bg-slate-50 p-3 rounded-md border border-slate-200/60">
        <SectionHeader icon={ImageIcon} title="Pet Profile" description={`Select photos to keep (max ${MAX_PROFILE_PHOTOS})`} />
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-slate-600">Selected {selectedProfilePictureIds.length}/{MAX_PROFILE_PHOTOS}</div>
          <div className="text-xs text-slate-500">Photos</div>
        </div>

        <div className="flex gap-2 overflow-x-auto py-1">
          {pet.profile_pictures?.map((p) => (
            <div
              key={String(p.id)}
              className={cn(
                "relative rounded-md overflow-hidden border-2 transition-all cursor-pointer w-20 h-20 flex-shrink-0",
                selectedProfilePictureIds.includes(String(p.id))
                  ? "border-green-500 ring-2 ring-green-500/20"
                  : "border-transparent opacity-80 hover:opacity-100"
              )}
              onClick={() => handleToggleId(String(p.id), setSelectedProfilePictureIds)}
            >
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={p.public_url} className="object-cover" />
                <AvatarFallback className="bg-slate-200 rounded-none">IMG</AvatarFallback>
              </Avatar>
              <div className="absolute top-1.5 right-1.5">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center shadow-sm transition-all",
                    selectedProfilePictureIds.includes(String(p.id)) ? "bg-green-500 text-white" : "bg-white/80 text-transparent border border-slate-300"
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            </div>
          ))}

          {stagedProfileFiles.map((s, idx) => (
            <div key={`staged-${idx}`} className="relative rounded-md overflow-hidden border-2 border-dashed w-20 h-20 flex-shrink-0">
              <div className="w-full h-full">
                <Image src={s.preview} alt={s.file.name} className="object-cover w-full h-full" fill style={{ objectFit: "cover" }} />
              </div>
              <div className="absolute left-0 right-0 bottom-0 bg-black/40 text-white text-[10px] truncate px-1 py-0.5">{s.file.name}</div>
              <button type="button" onClick={() => removeStagedProfile(idx)} className="absolute top-1 right-1 p-1 rounded-full bg-white text-slate-600 hover:text-red-600">
                ✕
              </button>
            </div>
          ))}

          <label className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md cursor-pointer bg-white hover:bg-green-50 hover:border-green-400 transition group w-20 h-20 flex-shrink-0",
            isUploading && "pointer-events-none opacity-50"
          )}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "profile")}
              className="hidden"
              disabled={isUploading || (selectedProfilePictureIds.length + stagedProfileFiles.length) >= MAX_PROFILE_PHOTOS}
            />
            {isUploading ? (
              <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
            ) : (
              <>
                <div className="p-1.5 rounded-full bg-slate-100 mb-1">
                  <Upload className="h-5 w-5 text-slate-400 group-hover:text-green-500 transition" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-green-600">Add</span>
                {(selectedProfilePictureIds.length + stagedProfileFiles.length) >= MAX_PROFILE_PHOTOS && (
                  <span className="text-[10px] text-red-600 mt-1">Max {MAX_PROFILE_PHOTOS} photos</span>
                )}
              </>
            )}
          </label>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-md border border-slate-200/60">
        <SectionHeader icon={FileDigit} title="Documents" description={`Medical records & certs (max ${MAX_RECORDS})`} />
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-slate-600">Selected {selectedAdditionalRecordIds.length}/{MAX_RECORDS}</div>
          <div className="text-xs text-slate-500">Documents</div>
        </div>

        <div className="space-y-3">
          {pet.additional_records?.map((record) => (
            <div key={record.id} className="flex items-start gap-2">
              <Checkbox
                className="mt-1.5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-4 w-4"
                checked={selectedAdditionalRecordIds.includes(String(record.id))}
                onCheckedChange={() => handleToggleId(String(record.id), setSelectedAdditionalRecordIds)}
              />
              <div className="flex-1 min-w-0">
                <FileUploadItem filename={record.filename} url={record.public_url} />
              </div>
            </div>
          ))}

          {stagedRecordFiles.map((r, idx) => (
            <div key={`staged-record-${idx}`} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 p-2 rounded-md border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 bg-slate-100 rounded text-slate-500"><FileText className="h-4 w-4"/></div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{r.filename}</div>
                      <div className="text-xs text-slate-400">{r.file ? Math.round(r.file.size / 1024) + ' KB' : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => removeStagedRecord(idx)} className="text-slate-400 hover:text-red-600 p-1 rounded-full">✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <label className="flex items-center justify-center w-full p-2 mt-2 text-xs font-medium text-slate-600 bg-white border border-dashed border-slate-300 rounded-md cursor-pointer hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition">
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "record")}
              className="hidden"
              disabled={(selectedAdditionalRecordIds.length + stagedRecordFiles.length) >= MAX_RECORDS}
            />
            <div className="p-1.5 rounded-full bg-slate-100 mr-2"><Upload className="w-3.5 h-3.5" /></div>
            <span>Upload</span>
            {(selectedAdditionalRecordIds.length + stagedRecordFiles.length) >= MAX_RECORDS && (
              <span className="text-[10px] text-red-600 ml-2">Max {MAX_RECORDS} documents</span>
            )}
          </label>
        </div>
      </div>
    </div>
  );

  const RightForm = () => (
    <div className="lg:col-span-8 space-y-4">
      <div>
        <SectionHeader icon={Info} title="General Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <FormItem>
              <Label className="text-xs text-slate-700">Pet Name <span className="text-red-500">*</span></Label>
                <FormControl>
                <Input {...register("name", { required: true })} className="w-full bg-slate-50 border-slate-200 h-9 px-2 py-0.5 text-xs rounded-sm focus:bg-white transition-all" placeholder="e.g. Buddy" />
              </FormControl>
            </FormItem>
          </div>

          <div className="md:col-span-2">
            <FormItem>
              <Label className="text-xs text-slate-700">About</Label>
              <FormControl>
                <Textarea
                  {...register("about")}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm placeholder:text-muted-foreground"
                  placeholder="Describe personality, history, or quirks..."
                />
              </FormControl>
            </FormItem>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-white border border-slate-200 rounded-md shadow-sm">
            <FormItem>
              <Label className="text-xs uppercase text-slate-500 font-semibold">Species</Label>
              <FormControl>
                <Controller
                  control={control}
                  name="type_of_animal_id"
                  rules={{ required: "Species is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-7 px-2 py-0.5 text-xs rounded-sm">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {animalTypes.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormControl>
              {errors.type_of_animal_id && (
                <p className="text-xs text-red-600 mt-1">{String(errors.type_of_animal_id.message)}</p>
              )}
            </FormItem>

            <FormItem>
              <Label className="text-xs uppercase text-slate-500 font-semibold">Breed</Label>
              <FormControl><Input {...register("breed")} className="w-full bg-slate-50 border-slate-200 h-9 px-2 py-0.5 text-xs rounded-sm" placeholder="Mixed" /></FormControl>
            </FormItem>

            <FormItem>
              <Label className="text-xs uppercase text-slate-500 font-semibold">Gender</Label>
              <FormControl>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-7 px-2 py-0.5 text-xs rounded-sm">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <Label className="text-xs uppercase text-slate-500 font-semibold">Size</Label>
              <FormControl>
                <Controller
                  control={control}
                  name="size"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-7 px-2 py-0.5 text-xs rounded-sm">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="extra large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <Label className="text-xs uppercase text-slate-500 font-semibold">Birth Date</Label>
              <FormControl><Input type="date" {...register("date_of_birth")} className="w-full bg-slate-50 border-slate-200 h-9 px-2 py-0.5 text-xs rounded-sm" /></FormControl>
            </FormItem>
          </div>

          <div className="md:col-span-2">
            <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border border-orange-100 bg-orange-50/50 p-2.5">
              <FormControl>
                <Controller
                  control={control}
                  name="special_needs"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 h-4 w-4"
                    />
                  )}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label className="text-xs text-orange-900 font-semibold">Special Needs Required</Label>
              </div>
            </FormItem>
          </div>
        </div>

        <div className="space-y-3 pt-2.5 border-t border-slate-100">
          {physiqueTags.length > 0 && (
            <div>
              <SectionHeader icon={PawPrint} title="Physique" />
              <div className="flex flex-wrap gap-2">
                {physiqueTags.map((t) => (
                  <label key={t.id} className={cn(
                    "cursor-pointer inline-flex items-center justify-center px-2.5 py-1 rounded-full border text-xs font-medium transition-all select-none",
                    selectedPhysiqueIds.includes(String(t.id))
                      ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}>
                    <input type="checkbox" className="hidden" checked={selectedPhysiqueIds.includes(String(t.id))} onChange={() => handleToggleId(String(t.id), setSelectedPhysiqueIds)} />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {personalityTags.length > 0 && (
            <div>
              <SectionHeader icon={Heart} title="Personality" />
              <div className="flex flex-wrap gap-2">
                {personalityTags.map((t) => (
                  <label key={t.id} className={cn(
                    "cursor-pointer inline-flex items-center justify-center px-2.5 py-1 rounded-full border text-xs font-medium transition-all select-none",
                    selectedPersonalityIds.includes(String(t.id))
                      ? "bg-green-100 border-green-200 text-green-800 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}>
                    <input type="checkbox" className="hidden" checked={selectedPersonalityIds.includes(String(t.id))} onChange={() => handleToggleId(String(t.id), setSelectedPersonalityIds)} />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loadingMaster) {
    return <div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin h-6 w-6 text-green-500"/></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden flex flex-col max-h-[95vh] px-0">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">

            <div className="flex-1 overflow-y-auto pt-4 p-6 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <LeftSidebar />
                <RightForm />
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="bg-white p-3 border-t border-slate-100 flex justify-end gap-2 z-20 shrink-0">
              <Button variant="outline" onClick={onClose} type="button" className="h-9 px-4 text-sm">Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 h-9 px-6 text-sm shadow-sm shadow-green-600/20" disabled={isUploading}>
                {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
                Save Changes
              </Button>
            </div>

          </form>
        </Form>
    </div>
  );
};

export default EditPetForm;