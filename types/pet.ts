export interface Pet {
  id: string | number;
  name: string;
  type_of_animal_name: string;
  age: number | string;
  age_unit: string;
  profile_picture: string;
}

export interface PetFilterState {
  type_of_animal_id?: string;
  age?: string;
  tag_personality_id?: string;
  search?: string;
}
