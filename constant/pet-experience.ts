export const PET_EXPERIENCE_OPTIONS = [
    { value: "none", label: "No Experience" },
    { value: "beginner", label: "Beginner (1-2 years)" },
    { value: "intermediate", label: "Intermediate (3-5 years)" },
    { value: "experienced", label: "Experienced (5+ years)" },
] as const;

export type PetExperienceValue = typeof PET_EXPERIENCE_OPTIONS[number]["value"];