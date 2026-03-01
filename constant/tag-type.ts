export const TAG_TYPE = {
  GENERAL: {
    TYPE_OF_ANIMAL: "type_of_animal",
  },
  PET: {
    PHYSIQUE: "pet.physique",
    PERSONALITY: "pet.personality",
  },
  USER: {
    PERSONALITY: "user.personality",
  },
  ADOPTION: {
    STAGE: "adoption.stage",
  },
} as const;

export type TagType = typeof TAG_TYPE[keyof typeof TAG_TYPE];