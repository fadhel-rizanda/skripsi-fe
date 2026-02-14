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

  const { register, handleSubmit, reset, control } = form;

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

  const handleFileUpload = async (file: File, target: "profile" | "record") => {
    setIsUploading(true);
    try {
      const presigned = await attachmentService.getPresignedUrl({ 
        filename: file.name, 
        mime_type: file.type, 
        file_size: file.size, 
        is_public: true 
      });
      const { id, upload_url } = presigned.data || presigned;

      await attachmentService.uploadToS3(upload_url, file, () => {
        // Progress callback intentionally left blank
      });
      await attachmentService.confirmUpload(id);

      if (target === "profile") {
        setSelectedProfilePictureIds(prev => [...prev, id]);
      } else {
        setSelectedAdditionalRecordIds(prev => [...prev, id]);
      }

      toast.success("Upload successful");
    } catch {
      toast.error("File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        physique_ids: selectedPhysiqueIds,
        personality_ids: selectedPersonalityIds,
        profile_picture_ids: selectedProfilePictureIds,
        additional_record_ids: selectedAdditionalRecordIds,
      };
      await petService.updatePet(pet.id, payload);
      toast.success("Pet data updated successfully");
      onClose();
      router.refresh();
    } catch {
      toast.error("Failed to update data");
    }
  };

  // Small subcomponents to keep JSX tidy
  const LeftSidebar = () => (
    <div className="lg:col-span-4 space-y-3">
      <div className="bg-slate-50 p-3 rounded-md border border-slate-200/60">
        <SectionHeader icon={ImageIcon} title="Gallery" description="Select photos to keep" />
        <div className="flex gap-2 overflow-x-auto py-1">
          {pet.profile_pictures?.map((p) => (
            <div
              key={String(p.id)}
              className={cn(
                "relative rounded-md overflow-hidden border-2 transition-all cursor-pointer w-16 flex-shrink-0",
                selectedProfilePictureIds.includes(String(p.id))
                  ? "border-green-500 ring-2 ring-green-500/20"
                  : "border-transparent opacity-70 hover:opacity-100"
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

          <label className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md cursor-pointer bg-white hover:bg-green-50 hover:border-green-400 transition group w-16 flex-shrink-0",
            isUploading && "pointer-events-none opacity-50"
          )}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "profile")}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-slate-400 group-hover:text-green-500 mb-2 transition" />
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-green-600">Add Photo</span>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-md border border-slate-200/60">
        <SectionHeader icon={FileDigit} title="Documents" description="Medical records & certs" />
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

          <label className="flex items-center justify-center w-full p-1.5 mt-2 text-xs font-medium text-slate-600 bg-white border border-dashed border-slate-300 rounded-md cursor-pointer hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition">
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "record")}
              className="hidden"
            />
            <Upload className="w-3.5 h-3.5 mr-2" /> Upload New Record
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
                <Input {...register("name", { required: true })} className="w-full bg-slate-50 border-slate-200 h-7 px-2 py-0.5 text-xs rounded-sm focus:bg-white transition-all" placeholder="e.g. Buddy" />
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
                        <SelectItem value="other">Unknown</SelectItem>
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