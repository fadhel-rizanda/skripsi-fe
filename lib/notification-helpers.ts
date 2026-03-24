/**
 * Maps a notification's reference_type and reference_id to the
 * appropriate frontend navigation URL.
 *
 * Returns null when no navigable URL can be determined.
 */
export function getNotificationUrl(referenceType: string, referenceId: string): string | null {
    if (!referenceId) return null;

    switch (referenceType) {
        case "adoption":
            return `/adoptions/${referenceId}`;

        case "requirement":
            // For requirement notifications, reference_id == adoption_id
            return `/adoptions/${referenceId}`;

        case "meetngreet":
        case "handover":
            // reference_id here is the meetngreet/handover entity ID,
            // not the adoption_id — navigate to adoptions list instead.
            return `/adoptions`;

        case "pet":
            return `/pets/${referenceId}`;

        case "chat":
            return `/chat`;

        case "community":
        case "post":
            return `/community`;

        default:
            return null;
    }
}
