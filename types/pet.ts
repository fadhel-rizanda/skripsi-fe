import type { Tag } from './general';

export interface Pet {
  id: string | number;
  name: string;
  type_of_animal_name?: string;
  type_of_animal_id?: string;
  age: number | string;
  age_unit: string;
  profile_picture?: string;
  size: string;
  date_of_birth?: string;
  gender?: string;
  about?: string;
  breed?: string;
  special_needs?: boolean;
  created_at?: string;
  updated_at?: string;

  /* Detail-specific fields (merged from PetDetail) */
  profile_pictures?: PetProfilePicture[];
  physique_tags?: Tag[];
  personality_tags?: Tag[];
  additional_records?: PetAdditionalRecord[];
}

export type PetDetail = Pet;

export interface PetProfilePicture {
  id: string | number;
  public_url: string;
}

// `PetTag` removed — use shared `Tag` from `types/general.ts` instead

export interface PetAdditionalRecord {
  id: string | number;
  public_url: string;
  filename: string;
  mime_type: string;
  path: string;
}

export interface PetFilterState {
  type_of_animal_id?: string;
  age?: string;
  tag_personality_id?: string;
  search?: string;
}
