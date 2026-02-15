export const AGE_RANGES = [
  { value: "baby", label: "Baby" },
  { value: "young", label: "Young" },
  { value: "adult", label: "Adult" },
  { value: "senior", label: "Senior" },
] as const;

export const PET_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra large", label: "Extra Large" },
] as const;

export const PET_GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export type PetSize = (typeof PET_SIZES)[number]['value'];
export type PetGender = (typeof PET_GENDERS)[number]['value'];

