import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_LABELS, EventTimeFilter, EventType } from "@/types";
import type { EventFilter } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CalendarX2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

/** Search params accepted by the events route, all optional. */
export interface EventsSearch {
  type?: EventType;
  time?: EventTimeFilter;
  q?: string;
}

const TYPE_OPTIONS: Array<{ value: EventType | "all"; label: string }> = [
  { value: "all", label: "All types" },
  { value: EventType.event, label: EVENT_TYPE_LABELS[EventType.event] },
  {
    value: EventType.competition,
    label: EVENT_TYPE_LABELS[EventType.competition],
  },
  { value: EventType.workshop, label: EVENT_TYPE_LABELS[EventType.workshop] },
  { value: EventType.activity, label: EVENT_TYPE_LABELS[EventType.activity] },
];

const TIME_OPTIONS: Array<{ value: EventTimeFilter; label: string }> = [
  { value: EventTimeFilter.all, label: "All" },
  { value: EventTimeFilter.upcoming, label: "Upcoming" },
  { value: EventTimeFilter.past, label: "Past" },
];

const SKELETON_IDS = Array.from({ length: 4 }, (_, i) => `event-skeleton-${i}`);

/** Events & competitions hub: filterable, searchable list of campus happenings. */
export function EventsPage() {
  const search = useSearch({ from: "/events" });
  const navigate = useNavigate({ from: "/events" });
  const { actor, isFetching } = useBackend();

  const [keyword, setKeyword] = useState(search.q ?? "");

  // Keep the input in sync when the URL changes (e.g. back/forward navigation).
  useEffect(() => {
    setKeyword(search.q ?? "");
  }, [search.q]);

  const filter: EventFilter = {
    eventType: search.type,
    time: search.time,
    search: search.q,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "events",
      search.type ?? "all",
      search.time ?? "all",
      search.q ?? "",
    ],
    queryFn: async () => {
      if (!actor) return [];
      return api.listEvents(actor, filter);
    },
    enabled: !!actor && !isFetching,
  });

  const events = data ?? [];

  const updateSearch = (patch: Partial<EventsSearch>) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    });
  };

  const submitKeyword = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    updateSearch({ q: trimmed === "" ? undefined : trimmed });
  };

  const hasActiveFilters =
    search.type !== undefined ||
    (search.time !== undefined && search.time !== EventTimeFilter.all) ||
    (search.q !== undefined && search.q !== "");

  return (
    <div data-ocid="events.page" className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Events &amp; Competitions
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything happening on campus — browse by type, time, or keyword.
        </p>
      </header>

      {/* Filter bar */}
      <section
        data-ocid="events.filters.section"
        className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-subtle md:p-5"
      >
        <form onSubmit={submitKeyword} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search events by keyword…"
              aria-label="Search events by keyword"
              data-ocid="events.search_input"
              className="pl-9"
            />
          </div>
          <Button type="submit" data-ocid="events.search_button">
            Search
          </Button>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Type filter */}
          <fieldset
            aria-label="Filter by event type"
            className="flex flex-wrap gap-1.5"
          >
            <legend className="sr-only">Filter by event type</legend>
            {TYPE_OPTIONS.map((option) => {
              const active =
                option.value === "all"
                  ? search.type === undefined
                  : search.type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  data-ocid={`events.type.${option.value}`}
                  aria-pressed={active}
                  onClick={() =>
                    updateSearch({
                      type:
                        option.value === "all"
                          ? undefined
                          : (option.value as EventType),
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </fieldset>

          {/* Time toggle */}
          <fieldset
            aria-label="Filter by time"
            className="inline-flex rounded-lg border border-border bg-background p-0.5"
          >
            <legend className="sr-only">Filter by time</legend>
            {TIME_OPTIONS.map((option) => {
              // The backend defaults an absent time filter to upcoming-only,
              // so the highlighted option must mirror that default.
              const active =
                (search.time ?? EventTimeFilter.upcoming) === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  data-ocid={`events.time.${option.value}`}
                  aria-pressed={active}
                  onClick={() => updateSearch({ time: option.value })}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-secondary text-secondary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </fieldset>
        </div>

        {hasActiveFilters ? (
          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Filtering…"
                : `${events.length} ${events.length === 1 ? "result" : "results"}`}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="events.clear_filters_button"
              onClick={() => {
                setKeyword("");
                void navigate({ search: {}, replace: true });
              }}
            >
              <X className="size-4" />
              Clear filters
            </Button>
          </div>
        ) : null}
      </section>

      {/* Results */}
      {isLoading ? (
        <div data-ocid="events.loading_state" className="space-y-3">
          {SKELETON_IDS.map((id) => (
            <div
              key={id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle md:p-5"
            >
              <Skeleton className="size-14 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          data-ocid="events.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <p className="font-display text-base font-semibold text-foreground">
            We couldn&apos;t load events
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching the list.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            data-ocid="events.retry_button"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div
          data-ocid="events.empty_state"
          className="rounded-xl border border-dashed border-border bg-card p-10 text-center"
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarX2 className="size-6" />
          </span>
          <p className="mt-4 font-display text-base font-semibold text-foreground">
            No events found
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {hasActiveFilters
              ? "No events match your current filters. Try a different type, time range, or keyword."
              : "There are no events or competitions listed yet. Check back soon."}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              data-ocid="events.empty_clear_button"
              onClick={() => {
                setKeyword("");
                void navigate({ search: {}, replace: true });
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <ul data-ocid="events.list" className="space-y-3">
          {events.map((event, index) => (
            <li key={event.id.toString()}>
              <EventCard
                event={event}
                index={index + 1}
                animationDelay={index * 40}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
