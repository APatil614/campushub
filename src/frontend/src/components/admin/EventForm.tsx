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
import { Textarea } from "@/components/ui/textarea";
import { useCreateEvent, useUpdateEvent } from "@/hooks/useQueries";
import { timestampToDate } from "@/lib/format";
import {
  type Attachment,
  EVENT_TYPE_LABELS,
  type Event,
  EventType,
} from "@/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const EVENT_TYPE_ORDER: EventType[] = [
  EventType.event,
  EventType.competition,
  EventType.workshop,
  EventType.activity,
];

/** Format a backend timestamp as a `datetime-local` value (local time). */
function toLocalInput(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Convert a `datetime-local` value into a nanosecond bigint timestamp. */
function fromLocalInput(value: string): bigint {
  const millis = new Date(value).getTime();
  if (Number.isNaN(millis)) return 0n;
  return BigInt(millis) * 1_000_000n;
}

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the form edits this event; otherwise it creates a new one. */
  event?: Event | null;
}

/** Create/edit dialog for an event or competition. */
export function EventForm({ open, onOpenChange, event }: EventFormProps) {
  const isEditing = !!event;
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const isPending = createEvent.isPending || updateEvent.isPending;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>(EventType.event);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [venue, setVenue] = useState("");
  const [organiser, setOrganiser] = useState("");
  const [registrationInfo, setRegistrationInfo] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(event?.title ?? "");
    setDescription(event?.description ?? "");
    setEventType(event?.eventType ?? EventType.event);
    setStartAt(event ? toLocalInput(event.startAt) : "");
    setEndAt(event ? toLocalInput(event.endAt) : "");
    setVenue(event?.venue ?? "");
    setOrganiser(event?.organiser ?? "");
    setRegistrationInfo(event?.registrationInfo ?? "");
    setAttachments(event?.attachments ?? []);
    setError(null);
  }, [open, event]);

  const handleSubmit = (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!title.trim() || !startAt || !endAt) {
      setError("Title, start time, and end time are required.");
      return;
    }
    const start = fromLocalInput(startAt);
    const end = fromLocalInput(endAt);
    if (end < start) {
      setError("The end time must be after the start time.");
      return;
    }
    setError(null);
    const input = {
      title: title.trim(),
      description: description.trim(),
      eventType,
      startAt: start,
      endAt: end,
      venue: venue.trim(),
      organiser: organiser.trim(),
      registrationInfo: registrationInfo.trim(),
      attachments,
    };
    const onError = (cause: unknown) => {
      setError(
        cause instanceof Error ? cause.message : "Could not save the event.",
      );
    };
    if (isEditing && event) {
      updateEvent.mutate(
        { id: event.id, input },
        {
          onSuccess: () => {
            toast.success("Event updated");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createEvent.mutate(input, {
        onSuccess: () => {
          toast.success("Event created");
          onOpenChange(false);
        },
        onError,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="event_form.dialog"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit event" : "New event"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the event details and save your changes."
              : "Add an event, competition, workshop, or activity."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual science fair"
              data-ocid="event_form.title_input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this event about?"
              rows={4}
              data-ocid="event_form.description_textarea"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-type">Type</Label>
              <Select
                value={eventType}
                onValueChange={(value) => setEventType(value as EventType)}
              >
                <SelectTrigger
                  id="event-type"
                  className="w-full"
                  data-ocid="event_form.type_select"
                >
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_ORDER.map((value) => (
                    <SelectItem key={value} value={value}>
                      {EVENT_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-venue">Venue</Label>
              <Input
                id="event-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Student Center Ballroom"
                data-ocid="event_form.venue_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-start">Starts</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                data-ocid="event_form.start_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-end">Ends</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                data-ocid="event_form.end_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-organiser">Organiser</Label>
              <Input
                id="event-organiser"
                value={organiser}
                onChange={(e) => setOrganiser(e.target.value)}
                placeholder="e.g. Student Affairs"
                data-ocid="event_form.organiser_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-registration">Registration info</Label>
              <Input
                id="event-registration"
                value={registrationInfo}
                onChange={(e) => setRegistrationInfo(e.target.value)}
                placeholder="e.g. Sign up at the front desk"
                data-ocid="event_form.registration_input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <AttachmentUpload
              value={attachments}
              onChange={setAttachments}
              idPrefix="event"
            />
          </div>

          {error ? (
            <p
              role="alert"
              data-ocid="event_form.error_state"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="event_form.cancel_button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="event_form.submit_button"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEditing ? "Save changes" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
