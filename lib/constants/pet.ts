/**
 * Pet-related constants
 * These contain UUIDs that correspond to database entries
 */

export const ANIMAL_TYPES = [
  { value: "019be3ef-c3a0-7367-bffe-20e2c12f34e6", label: "Dog" },
  { value: "019be3ef-c46f-7359-a279-c5511458ff87", label: "Cat" },
  { value: "019be3ef-c62d-72c2-b553-e9946aca7578", label: "Rabbit" },
  { value: "019be3ef-c6da-726d-bed2-8c30c3e9ed81", label: "Hamster" },
  { value: "019be3ef-c782-70d3-8ba4-e0753ba548f0", label: "Bird" },
  { value: "019be3ef-c83e-7339-8f87-c12cc650c1a1", label: "Fish" },
  { value: "019be3ef-c8e3-70d3-9746-8706631266e8", label: "Reptile" },
] as const;

export const AGE_RANGES = [
  { value: "baby", label: "Baby" },
  { value: "young", label: "Young" },
  { value: "adult", label: "Adult" },
  { value: "senior", label: "Senior" },
] as const;

export const TAG_PERSONALITIES = [
  { value: "019be3ef-ce7b-7155-b125-a796dcfe97de", label: "Friendly" },
  { value: "019be3ef-d00b-7128-9a40-e3bc4f8f34aa", label: "Calm" },
  { value: "019be3ef-d158-7311-8203-6baa26fd8367", label: "Playful" },
  { value: "019be3ef-d205-7398-a15d-7b320902d006", label: "Active" },
  { value: "019be3ef-d2ad-71eb-a55f-bdb28bcc67e0", label: "Lazy" },
  { value: "019be3ef-d37c-7012-862f-526ce4fc98e2", label: "Aggressive" },
  { value: "019be3ef-d428-73f1-ae7e-70a43c6203e3", label: "Shy" },
  { value: "019be3ef-d6ae-71ba-b8b8-ee011bd1c95d", label: "Independent" },
  { value: "019be3ef-d765-7214-9833-e57412e3fee0", label: "Affectionate" },
  { value: "019be3ef-d821-7155-8454-dc1154e06b80", label: "Protective" },
  { value: "019be3ef-d8c6-701d-a3d7-69211bca24a1", label: "Curious" },
  { value: "019be3ef-d9a5-706a-ac90-1f3f0fee8ff1", label: "Trainable" },
] as const;
