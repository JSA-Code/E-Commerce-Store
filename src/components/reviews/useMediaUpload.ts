import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ky from "ky";

// TODO fix type 6:04:00
export interface MediaAttachment {
  id: string;
  file: File;
  url?: string;
  state: "uploading" | "uploaded" | "failed";
}

export default function useMediaUpload() {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  async function startUpload(file: File) {
    const id = crypto.randomUUID();

    setAttachments((prev) => [
      ...prev,
      {
        id,
        file,
        state: "uploading",
      },
    ]);

    // TODO how does this ky func work? What is the closure mentioned for crypto.randomUUID() at 6:14:00?
    try {
      const { uploadUrl } = await ky
        .get("/api/review-media-upload-url", {
          searchParams: {
            fileName: file.name,
            mimeType: file.type,
          },
        })
        .json<{ uploadUrl: string }>();
      const {
        file: { url },
      } = await ky
        .put(uploadUrl, {
          timeout: false,
          body: file,
          headers: {
            "Content-Type": "application/octet-stream",
          },
          searchParams: {
            filename: file.name,
          },
        })
        .json<{ file: { url: string } }>();

      setAttachments((prev) =>
        prev.map((attach) =>
          attach.id === id ? { ...attach, state: "uploaded", url } : attach,
        ),
      );
    } catch (error) {
      console.error(error);

      setAttachments((prev) =>
        prev.map((attach) =>
          attach.id === id ? { ...attach, state: "failed" } : attach,
        ),
      );

      toast({
        variant: "destructive",
        description: "Failed to upload attachment",
      });
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((attach) => attach.id !== id));
  }

  function clearAttachments() {
    setAttachments([]);
  }

  return { attachments, startUpload, removeAttachment, clearAttachments };
}
