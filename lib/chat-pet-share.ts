export interface ChatPetSharePayload {
    petId: string;
    petName: string;
    petImageUrl?: string;
}

const PET_SHARE_PREFIX = "[[PET_SHARE]]";

export function createPetShareMessage(payload: ChatPetSharePayload): string {
    return `${PET_SHARE_PREFIX}${JSON.stringify(payload)}`;
}

export function parsePetShareMessage(content?: string | null): ChatPetSharePayload | null {
    if (!content || !content.startsWith(PET_SHARE_PREFIX)) {
        return null;
    }

    const rawPayload = content.slice(PET_SHARE_PREFIX.length);

    try {
        const parsed = JSON.parse(rawPayload) as Partial<ChatPetSharePayload>;

        if (!parsed.petId || !parsed.petName) {
            return null;
        }

        return {
            petId: parsed.petId,
            petName: parsed.petName,
            petImageUrl: parsed.petImageUrl,
        };
    } catch {
        return null;
    }
}
