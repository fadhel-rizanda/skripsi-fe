import { PresignedUrlSchema } from "@/schemas/attachment.schema";
import {attachmentService} from "@/services/attachmentServices";
import { Attachment } from "@/types/attachment";

export async function uploadAttachment(file: File): Promise<string> {
    const payload = {
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        is_public: false,
    };

    const validation = PresignedUrlSchema.safeParse(payload);
    if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message);
    }

    const { id, upload_url } =
        (await attachmentService.getPresignedUrl(validation.data)).data;

    await attachmentService.uploadToS3(upload_url, file);
    await attachmentService.confirmUpload(id);

    return id;
}

export async function downloadAttachment(
    attachment: Attachment,
    onProgress?: (percent: number) => void
) {
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
}
