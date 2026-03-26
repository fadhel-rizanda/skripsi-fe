/**
 * Maps a notification's reference_type and reference_id to the
 * appropriate frontend navigation URL.
 *
 * Returns null when no navigable URL can be determined.
 */
export function getNotificationUrl(referenceType: string, referenceId: string): string | null {
    switch (referenceType) {
        case "adoption":
            if (!referenceId) return null;
            return `/adoptions/${referenceId}`;

        case "requirement":
            // For requirement notifications, reference_id == adoption_id
            if (!referenceId) return null;
            return `/adoptions/${referenceId}`;

        case "meetngreet":
        case "handover":
            // reference_id here is the meetngreet/handover entity ID,
            // not the adoption_id — navigate to adoptions list instead.
            return `/adoptions`;

        case "pet":
            if (!referenceId) return null;
            return `/pets/${referenceId}`;

        case "chat":
            return `/chat`;

        case "post":
            if (!referenceId) return `/explore`;
            return `/explore/posts/${referenceId}`;

        case "community":
            if (!referenceId) return `/explore`;
            return `/explore/communities/${referenceId}`;

        default:
            return null;
    }
}
