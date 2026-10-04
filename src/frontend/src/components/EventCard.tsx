import { Badge } from "@/components/ui/badge";
import { formatDayBadge, formatEventWhen, isPastTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_LABELS, EventType } from "@/types";
import type { Event } from "@/types";
import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, UserRound } from "lucide-react";

/** Left rail color per event type — the scannable "campus bulletin" signature. */
const RAIL_CLASS: Record<EventType, string> = {
  [EventType.event]: "rail-academic",
  [EventType.competition]: "rail-exam",
  [EventType.workshop]: "rail-fee",
  [EventType.activity]: "rail-general",
};

/** Tinted pill styling per event type. */
const BADGE_CLASS: Record<EventType, string> = {
  [EventType.event]:
    "border-cat-academic/30 bg-cat-academic/10 text-cat-academic",
  [EventType.competition]: "border-cat-exam/30 bg-cat-exam/10 text-cat-exam",
  [EventType.workshop]: "border-cat-fee/30 bg-cat-fee/10 text-cat-fee",
  [EventType.activity]:
    "border-cat-general/30 bg-cat-general/10 text-cat-general",
};

interface EventCardProps {
  event: Event;
  /** 1-based position used for deterministic test markers. */
  index: number;
  /** Stagger delay in ms for the entrance animation. */
  animationDelay?: number;
}

/**
 * Reusable event/competition list item: category rail, mono date chip, type
 * badge, title, venue, organiser, and an upcoming/past cue. Links to detail.
 */
export function EventCard({
  event,
  index,
  animationDelay = 0,
}: EventCardProps) {
  const badge = formatDayBadge(event.startAt);
  const isPast = isPastTimestamp(event.startAt);

  return (
    <Link
      to="/events/$id"
      params={{ id: event.id.toString() }}
      data-ocid={`events.item.${index}`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          RAIL_CLASS[event.eventType],
        )}
      />

      <div className="flex gap-4 p-4 pl-5 md:p-5 md:pl-6">
        {/* Mono date chip */}
        <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center">
          <span className="font-mono text-[10px] font-semibold tracking-widest text-muted-foreground">
            {badge.month}
          </span>
          <span className="font-mono text-xl font-bold leading-none text-foreground">
            {badge.day}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("rounded-full", BADGE_CLASS[event.eventType])}
            >
              {EVENT_TYPE_LABELS[event.eventType]}
            </Badge>
            {isPast ? (
              <span className="text-xs font-medium text-muted-foreground">
                Past
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Upcoming
              </span>
            )}
          </div>

          <h3 className="mt-2 truncate font-display text-base font-semibold text-foreground group-hover:text-primary md:text-lg">
            {event.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              <span className="font-mono">
                {formatEventWhen(event.startAt)}
              </span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <UserRound className="size-3.5 shrink-0" />
              <span className="truncate">{event.organiser}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
