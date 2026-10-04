import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import { formatDateTime, formatEventWhen, isPastTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_LABELS, EventType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  Paperclip,
  UserRound,
} from "lucide-react";

const BADGE_CLASS: Record<EventType, string> = {
  [EventType.event]:
    "border-cat-academic/30 bg-cat-academic/10 text-cat-academic",
  [EventType.competition]: "border-cat-exam/30 bg-cat-exam/10 text-cat-exam",
  [EventType.workshop]: "border-cat-fee/30 bg-cat-fee/10 text-cat-fee",
  [EventType.activity]:
    "border-cat-general/30 bg-cat-general/10 text-cat-general",
};

/** Format a byte count as a short human-readable size. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Full detail view for a single event or competition. */
export function EventDetailPage() {
  const { id } = useParams({ from: "/events/$id" });
  const { actor, isFetching } = useBackend();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!actor) return null;
      return api.getEvent(actor, BigInt(id));
    },
    enabled: !!actor && !isFetching,
  });

  if (isLoading) {
    return (
      <div data-ocid="event_detail.loading_state" className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-subtle">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="event_detail.error_state"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
      >
        <p className="font-display text-base font-semibold text-foreground">
          We couldn&apos;t load this event
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Something went wrong while fetching the details.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          data-ocid="event_detail.retry_button"
          onClick={() => void refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        data-ocid="event_detail.empty_state"
        className="rounded-xl border border-dashed border-border bg-card p-10 text-center"
      >
        <p className="font-display text-base font-semibold text-foreground">
          Event not found
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          This event may have been removed or the link is incorrect.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/events" search={{}} data-ocid="event_detail.back_button">
            <ArrowLeft className="size-4" />
            Back to events
          </Link>
        </Button>
      </div>
    );
  }

  const event = data;
  const isPast = isPastTimestamp(event.startAt);

  return (
    <article data-ocid="event_detail.page" className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/events" search={{}} data-ocid="event_detail.back_button">
          <ArrowLeft className="size-4" />
          Back to events
        </Link>
      </Button>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn("rounded-full", BADGE_CLASS[event.eventType])}
          >
            {EVENT_TYPE_LABELS[event.eventType]}
          </Badge>
          {isPast ? (
            <span className="text-xs font-medium text-muted-foreground">
              Past event
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Upcoming
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">
          {event.title}
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Main column */}
        <div className="space-y-6">
          <section
            data-ocid="event_detail.description_section"
            className="rounded-xl border border-border bg-card p-5 shadow-subtle md:p-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground">
              About this {EVENT_TYPE_LABELS[event.eventType].toLowerCase()}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
              {event.description}
            </p>
          </section>

          {event.attachments.length > 0 ? (
            <section
              data-ocid="event_detail.attachments_section"
              className="rounded-xl border border-border bg-card p-5 shadow-subtle md:p-6"
            >
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <Paperclip className="size-4 text-muted-foreground" />
                Attachments
              </h2>
              <ul className="mt-3 space-y-2">
                {event.attachments.map((attachment, index) => (
                  <li
                    key={`${attachment.filename}-${index}`}
                    data-ocid={`event_detail.attachment.${index + 1}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {attachment.filename}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {attachment.mimeType} ·{" "}
                        {formatBytes(attachment.blob.length)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Sidebar details */}
        <aside className="space-y-4">
          <section
            data-ocid="event_detail.info_section"
            className="rounded-xl border border-border bg-card p-5 shadow-subtle"
          >
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Details
            </h2>
            <dl className="mt-4 space-y-4">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Starts
                  </dt>
                  <dd className="font-mono text-sm text-foreground">
                    {formatEventWhen(event.startAt)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Ends
                  </dt>
                  <dd className="font-mono text-sm text-foreground">
                    {formatDateTime(event.endAt)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Venue
                  </dt>
                  <dd className="text-sm text-foreground">{event.venue}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <UserRound className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Organiser
                  </dt>
                  <dd className="text-sm text-foreground">{event.organiser}</dd>
                </div>
              </div>
            </dl>
          </section>

          <section
            data-ocid="event_detail.registration_section"
            className="rounded-xl border border-border bg-card p-5 shadow-subtle"
          >
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Registration
            </h2>
            <Separator className="my-3" />
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {event.registrationInfo.trim() === ""
                ? "No registration required — just show up."
                : event.registrationInfo}
            </p>
          </section>
        </aside>
      </div>
    </article>
  );
}
