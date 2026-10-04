import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeRange } from "@/lib/format";
import { type ClassSlot, DAY_LABELS, type DayOfWeek } from "@/types";
import { Clock, MapPin, UserRound } from "lucide-react";

/** Deterministic skeleton ids so list keys never fall back to the array index. */
const SKELETON_IDS = Array.from({ length: 3 }, (_, i) => `class-skeleton-${i}`);

interface TimetableGridProps {
  /** Classes to render, already filtered by the caller. */
  classes: ClassSlot[];
  /** When true, render layout-matched loading placeholders. */
  isLoading?: boolean;
  /** Optional empty-state copy override. */
  emptyMessage?: string;
}

/** A single class row: subject, time, room, and instructor. */
function ClassRow({ slot, index }: { slot: ClassSlot; index: number }) {
  return (
    <li
      data-ocid={`classes.item.${index + 1}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-smooth hover:border-primary/40 hover:shadow-subtle sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="truncate font-display text-base font-semibold text-foreground">
          {slot.subject}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs text-foreground">
              {formatTimeRange(slot.startTime, slot.endTime)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs text-foreground">
              {slot.room}
            </span>
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <UserRound
          className="size-3.5 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="truncate text-sm text-muted-foreground">
          {slot.instructor}
        </span>
      </div>
    </li>
  );
}

/**
 * Reusable weekly timetable. Renders one section per weekday that has classes,
 * with a day heading and a list of class rows. Used by the Classes page and the
 * subject detail schedule.
 */
export function TimetableGrid({
  classes,
  isLoading = false,
  emptyMessage = "No classes scheduled for this day.",
}: TimetableGridProps) {
  if (isLoading) {
    return (
      <div
        data-ocid="classes.loading_state"
        className="space-y-6"
        aria-busy="true"
        aria-live="polite"
      >
        {SKELETON_IDS.map((id) => (
          <div key={id} className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div
        data-ocid="classes.empty_state"
        className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center"
      >
        <p className="font-display text-base font-semibold text-foreground">
          Nothing on the timetable
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Group by weekday, preserving the canonical Monday-first order.
  const grouped = new Map<DayOfWeek, ClassSlot[]>();
  for (const slot of classes) {
    const bucket = grouped.get(slot.dayOfWeek);
    if (bucket) {
      bucket.push(slot);
    } else {
      grouped.set(slot.dayOfWeek, [slot]);
    }
  }

  const orderedDays = Array.from(grouped.keys()).sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b),
  );

  return (
    <div className="space-y-8">
      {orderedDays.map((day) => {
        const dayClasses = (grouped.get(day) ?? [])
          .slice()
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        return (
          <section
            key={day}
            data-ocid={`classes.day.${day}`}
            aria-labelledby={`day-heading-${day}`}
          >
            <div className="mb-3 flex items-center gap-3">
              <h2
                id={`day-heading-${day}`}
                className="font-display text-sm font-semibold uppercase tracking-wider text-foreground"
              >
                {DAY_LABELS[day]}
              </h2>
              <Badge variant="secondary" className="font-mono">
                {dayClasses.length}
              </Badge>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <ul className="space-y-3">
              {dayClasses.map((slot, index) => (
                <ClassRow key={slot.id.toString()} slot={slot} index={index} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** Canonical Monday-first weekday order used for sorting day groups. */
const WEEKDAY_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as DayOfWeek[];
