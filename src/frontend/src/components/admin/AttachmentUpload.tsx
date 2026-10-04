import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/types";
import { FileText, ImageIcon, Paperclip, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";

/** Accepted upload types: PDFs and common image formats. */
const ACCEPT = "application/pdf,image/png,image/jpeg,image/gif,image/webp";

/** True when a filename looks like an image, used for the preview icon. */
function isImageName(filename: string): boolean {
  return /\.(png|jpe?g|gif|webp)$/i.test(filename);
}

/** Human-readable file size such as "1.2 MB". */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentUploadProps {
  /** Current attachment list, owned by the parent form. */
  value: Attachment[];
  /** Called with the next attachment list whenever files are added or removed. */
  onChange: (next: Attachment[]) => void;
  /** Optional id prefix so multiple uploaders on one page stay unique. */
  idPrefix?: string;
}

/**
 * Upload control for PDFs and images.
 *
 * Reads each selected file into bytes with live progress feedback and stores
 * the resulting `{ blob, filename, mimeType }` reference in the parent form.
 * The record keeps only the off-chain blob reference plus display metadata.
 */
export function AttachmentUpload({
  value,
  onChange,
  idPrefix,
}: AttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = `${idPrefix ?? "attachment"}-${generatedId}`;
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const readFile = (file: File): Promise<Attachment> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      reader.onload = () => {
        const result = reader.result;
        if (!(result instanceof ArrayBuffer)) {
          reject(new Error(`Could not read ${file.name}`));
          return;
        }
        resolve({
          blob: new Uint8Array(result),
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
        });
      };
      reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
      reader.readAsArrayBuffer(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const next: Attachment[] = [];
    try {
      for (const file of Array.from(files)) {
        setProgress(0);
        next.push(await readFile(file));
      }
      onChange([...value, ...next]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const isUploading = progress !== null;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        data-ocid="attachment.input"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <div
        data-ocid="attachment.dropzone"
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-smooth",
          isUploading && "opacity-70",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-card text-primary shadow-subtle">
          <Upload className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">
          Attach PDFs or images (PNG, JPG, GIF, WebP).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          data-ocid="attachment.upload_button"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="size-4" />
          {isUploading ? "Uploading…" : "Choose files"}
        </Button>
      </div>

      {isUploading ? (
        <div data-ocid="attachment.progress" className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uploading…</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <Progress value={progress ?? 0} aria-label="Upload progress" />
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          data-ocid="attachment.error_state"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {value.length > 0 ? (
        <ul data-ocid="attachment.list" className="space-y-2">
          {value.map((attachment, index) => (
            <li
              key={`${attachment.filename}-${index}`}
              data-ocid={`attachment.item.${index + 1}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {isImageName(attachment.filename) ? (
                  <ImageIcon className="size-4" aria-hidden="true" />
                ) : (
                  <FileText className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {attachment.filename}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatSize(attachment.blob.length)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${attachment.filename}`}
                data-ocid={`attachment.remove_button.${index + 1}`}
                onClick={() => removeAt(index)}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
