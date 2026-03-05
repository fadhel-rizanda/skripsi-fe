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
    EXPERIENCE: "user.experience",
    PREFERENCES: "user.preferences",
  },
  ADOPTION: {
    STAGE: "adoption.stage",
    REQUIREMENT: "requirement",
  },
  COMMUNITY: "community",
  POST: "post",
  REPORT: "report",
} as const;

export type TagType = typeof TAG_TYPE[keyof typeof TAG_TYPE];