import type { Tag } from './general';

export interface Pet {
  id: string | number;
  name: string;
  // optional relationship fields
  type_of_animal_id?: string;
  type_of_animal_name?: string;

  // legacy/derived fields (may be present in UI)
  age?: number | string;
  age_unit?: string;

  // media
  profile_picture?: string;
  
  // canonical fields (align with CreatePetPayload / CreatePetSchema)
  size: 'small' | 'medium' | 'large' | 'extra large';
  date_of_birth?: string; // ISO date string
  gender?: 'male' | 'female';
  about?: string;
  breed?: string;
  special_needs?: boolean;

  // timestamps
  created_at?: string;
  updated_at?: string;

  // detail fields
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

export interface PetAdditionalRecord {
  id: string | number;
  public_url: string;
  filename?: string;
  mime_type?: string;
  path?: string;
}

export interface PetFilterState {
  type_of_animal_id?: string;
  age?: string;
  tag_personality_id?: string;
  search?: string;
}
