import { AttachmentUpload } from "@/components/admin/AttachmentUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNotice, useUpdateNotice } from "@/hooks/useQueries";
import {
  type Attachment,
  NOTICE_CATEGORY_LABELS,
  type Notice,
  NoticeCategory,
} from "@/types";
import { Loader2, Pin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CATEGORY_ORDER: NoticeCategory[] = [
  NoticeCategory.academic,
  NoticeCategory.exam,
  NoticeCategory.fee,
  NoticeCategory.general,
  NoticeCategory.urgent,
];

interface NoticeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the form edits this notice; otherwise it creates a new one. */
  notice?: Notice | null;
}

/** Create/edit dialog for a notice, including a pinned/urgent toggle. */
export function NoticeForm({ open, onOpenChange, notice }: NoticeFormProps) {
  const isEditing = !!notice;
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const isPending = createNotice.isPending || updateNotice.isPending;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<NoticeCategory>(
    NoticeCategory.general,
  );
  const [pinned, setPinned] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize the draft once when the dialog opens for a given record.
  useEffect(() => {
    if (!open) return;
    setTitle(notice?.title ?? "");
    setBody(notice?.body ?? "");
    setCategory(notice?.category ?? NoticeCategory.general);
    setPinned(notice?.pinned ?? false);
    setAttachments(notice?.attachments ?? []);
    setError(null);
  }, [open, notice]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setError(null);
    const input = {
      title: title.trim(),
      body: body.trim(),
      category,
      pinned,
      attachments,
    };
    const onError = (cause: unknown) => {
      setError(
        cause instanceof Error ? cause.message : "Could not save the notice.",
      );
    };
    if (isEditing && notice) {
      updateNotice.mutate(
        { id: notice.id, input },
        {
          onSuccess: () => {
            toast.success("Notice updated");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createNotice.mutate(input, {
        onSuccess: () => {
          toast.success("Notice published");
          onOpenChange(false);
        },
        onError,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="notice_form.dialog"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit notice" : "New notice"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the notice details and save your changes."
              : "Publish a notice to the campus bulletin."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="notice-title">Title</Label>
            <Input
              id="notice-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Final exam schedule published"
              data-ocid="notice_form.title_input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notice-body">Body</Label>
            <Textarea
              id="notice-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the full notice text…"
              rows={5}
              data-ocid="notice_form.body_textarea"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notice-category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as NoticeCategory)}
              >
                <SelectTrigger
                  id="notice-category"
                  className="w-full"
                  data-ocid="notice_form.category_select"
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ORDER.map((value) => (
                    <SelectItem key={value} value={value}>
                      {NOTICE_CATEGORY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notice-pinned">Pin to top</Label>
              <div className="flex h-9 items-center gap-3 rounded-md border border-input px-3">
                <Switch
                  id="notice-pinned"
                  checked={pinned}
                  onCheckedChange={setPinned}
                  data-ocid="notice_form.pinned_toggle"
                />
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Pin className="size-3.5" aria-hidden="true" />
                  {pinned ? "Pinned / urgent" : "Standard"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <AttachmentUpload
              value={attachments}
              onChange={setAttachments}
              idPrefix="notice"
            />
          </div>

          {error ? (
            <p
              role="alert"
              data-ocid="notice_form.error_state"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="notice_form.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="notice_form.submit_button"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEditing ? "Save changes" : "Publish notice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
