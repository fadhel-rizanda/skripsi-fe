import { PresignedUrlSchema } from "@/schemas/attachment.schema";
import {attachmentService} from "@/services/attachmentServices";
import { Attachment } from "@/types/attachment";

export async function uploadAttachment(file: File, isPublic:boolean=false): Promise<string> {
    const sanitizedFilename = file.name
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")

    const payload = {
        filename: sanitizedFilename,
        mime_type: file.type,
        file_size: file.size,
        is_public: isPublic,
    };

    const validation = PresignedUrlSchema.safeParse(payload);
    if (!validation.success) {
        console.error('Validation failed:', validation.error);
        throw new Error(validation.error.issues[0]?.message);
    }

    try {
        const { id, upload_url } = (await attachmentService.getPresignedUrl(validation.data)).data;

        await attachmentService.uploadToS3(upload_url, file);
        await attachmentService.confirmUpload(id);

        return id;
    } catch (err) {
        console.error('uploadAttachment failed for file', file.name, err);
        throw err;
    }
}

export async function downloadAttachment(
    attachment: Attachment,
    onProgress?: (percent: number) => void
) {
    try {
        const { download_url } =
            await attachmentService.generateDownloadUrl(attachment.id);

        const blob = await attachmentService.downloadFromS3(
            download_url,
            attachment.mime_type,
            onProgress
        );

        const blobUrl = window.URL.createObjectURL(new Blob([blob]));

        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", attachment.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("downloadAttachment failed:", error);
        alert(`Failed to download "${attachment.filename}". Please try again.`);
    }
}

export async function openAttachment(
    attachment: Attachment,
    onProgress?: (percent: number) => void
) {
    try {
        const isPreviewable =
            attachment.mime_type?.startsWith("image/") ||
            attachment.mime_type === "application/pdf";

        const { download_url } =
            await attachmentService.generateDownloadUrl(
                attachment.id,
                isPreviewable ? "preview" : "download"
            );

        if (isPreviewable) {
            window.open(download_url, "_blank");
            return;
        }

        await downloadAttachment(attachment, onProgress);
    } catch (error) {
        console.error("openAttachment failed:", error);
        alert(`Failed to open "${attachment.filename}". Please try again.`);
    }
}


