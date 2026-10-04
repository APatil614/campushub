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
import { Textarea } from "@/components/ui/textarea";
import { useCreateSyllabus, useUpdateSyllabus } from "@/hooks/useQueries";
import type { Attachment, SyllabusEntry, SyllabusTopic } from "@/types";
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** A topic row with a stable client id so reordering never keys on the index. */
interface TopicDraft extends SyllabusTopic {
  key: string;
}

let topicCounter = 0;
function nextTopicKey(): string {
  topicCounter += 1;
  return `topic-${topicCounter}`;
}

interface SyllabusFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the form edits this entry; otherwise it creates a new one. */
  entry?: SyllabusEntry | null;
}

/** Create/edit dialog for a syllabus entry with an ordered topic list. */
export function SyllabusForm({ open, onOpenChange, entry }: SyllabusFormProps) {
  const isEditing = !!entry;
  const createSyllabus = useCreateSyllabus();
  const updateSyllabus = useUpdateSyllabus();
  const isPending = createSyllabus.isPending || updateSyllabus.isPending;

  const [subject, setSubject] = useState("");
  const [materialLink, setMaterialLink] = useState("");
  const [topics, setTopics] = useState<TopicDraft[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSubject(entry?.subject ?? "");
    setMaterialLink(entry?.materialLink ?? "");
    setTopics(
      (entry?.topics ?? []).map((topic) => ({
        ...topic,
        key: nextTopicKey(),
      })),
    );
    setAttachments(entry?.attachments ?? []);
    setError(null);
  }, [open, entry]);

  const addTopic = () => {
    setTopics((current) => [
      ...current,
      { key: nextTopicKey(), title: "", description: "" },
    ]);
  };

  const updateTopic = (key: string, patch: Partial<SyllabusTopic>) => {
    setTopics((current) =>
      current.map((topic) =>
        topic.key === key ? { ...topic, ...patch } : topic,
      ),
    );
  };

  const removeTopic = (key: string) => {
    setTopics((current) => current.filter((topic) => topic.key !== key));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    const cleanedTopics = topics
      .map(({ title, description }) => ({
        title: title.trim(),
        description: description.trim(),
      }))
      .filter((topic) => topic.title !== "");
    setError(null);
    const input = {
      subject: subject.trim(),
      topics: cleanedTopics,
      materialLink: materialLink.trim() || undefined,
      attachments,
    };
    const onError = (cause: unknown) => {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save the syllabus entry.",
      );
    };
    if (isEditing && entry) {
      updateSyllabus.mutate(
        { id: entry.id, input },
        {
          onSuccess: () => {
            toast.success("Syllabus updated");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createSyllabus.mutate(input, {
        onSuccess: () => {
          toast.success("Syllabus entry created");
          onOpenChange(false);
        },
        onError,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="syllabus_form.dialog"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit syllabus entry" : "New syllabus entry"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the subject outline and save your changes."
              : "Add a subject outline with its topics and materials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="syllabus-subject">Subject</Label>
              <Input
                id="syllabus-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics"
                data-ocid="syllabus_form.subject_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="syllabus-material">Material link</Label>
              <Input
                id="syllabus-material"
                type="url"
                value={materialLink}
                onChange={(e) => setMaterialLink(e.target.value)}
                placeholder="https://…"
                data-ocid="syllabus_form.material_input"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Topics</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="syllabus_form.add_topic_button"
                onClick={addTopic}
              >
                <Plus className="size-4" />
                Add topic
              </Button>
            </div>

            {topics.length === 0 ? (
              <p
                data-ocid="syllabus_form.topics_empty_state"
                className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground"
              >
                No topics yet. Add the first topic for this subject.
              </p>
            ) : (
              <ul data-ocid="syllabus_form.topic_list" className="space-y-3">
                {topics.map((topic, index) => (
                  <li
                    key={topic.key}
                    data-ocid={`syllabus_form.topic.${index + 1}`}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      <Input
                        value={topic.title}
                        onChange={(e) =>
                          updateTopic(topic.key, { title: e.target.value })
                        }
                        placeholder="Topic title"
                        aria-label={`Topic ${index + 1} title`}
                        data-ocid={`syllabus_form.topic_title.${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove topic ${index + 1}`}
                        data-ocid={`syllabus_form.remove_topic.${index + 1}`}
                        onClick={() => removeTopic(topic.key)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={topic.description}
                      onChange={(e) =>
                        updateTopic(topic.key, { description: e.target.value })
                      }
                      placeholder="Short description of what this topic covers"
                      aria-label={`Topic ${index + 1} description`}
                      rows={2}
                      data-ocid={`syllabus_form.topic_description.${index + 1}`}
                      className="mt-2"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <AttachmentUpload
              value={attachments}
              onChange={setAttachments}
              idPrefix="syllabus"
            />
          </div>

          {error ? (
            <p
              role="alert"
              data-ocid="syllabus_form.error_state"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="syllabus_form.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="syllabus_form.submit_button"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEditing ? "Save changes" : "Create entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
