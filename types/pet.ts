export interface Pet {
  id: string | number;
  name: string;
  type_of_animal_name: string;
  age: number | string;
  age_unit: string;
  profile_picture: string;
  size: string;
  date_of_birth: string;
  gender: string;
    about: string;
    breed: string;
    special_needs: boolean;
    created_at: string;
    updated_at: string;
}

export interface PetDetail {
  type_of_animal_id: string;
  size: string;
  name: string;
  age: number | string;
  age_unit: string;
  gender: string;
  about: string;
  breed: string;
  special_needs: boolean;
  profile_pictures: PetProfilePicture[];
  physique_tags: PetTag[];
  personality_tags: PetTag[];
  additional_records: PetAdditionalRecord[];
}

export interface PetProfilePicture {
  id: string | number;
  public_url: string;
}

export interface PetTag {
  id: string | number;
  name: string;
}

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
