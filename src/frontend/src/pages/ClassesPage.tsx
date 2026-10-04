import { TimetableGrid } from "@/components/TimetableGrid";
import { Button } from "@/components/ui/button";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { type ClassSlot, DAY_LABELS, type DayOfWeek, WEEKDAYS } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

type DayFilter = DayOfWeek | "all";

/** Weekly timetable grouped by weekday with a day filter. */
export function ClassesPage() {
  const { actor, isFetching } = useBackend();
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["classes", dayFilter],
    queryFn: async (): Promise<ClassSlot[]> => {
      if (!actor) return [];
      return api.listClasses(actor, dayFilter === "all" ? null : dayFilter);
    },
    enabled: !!actor && !isFetching,
  });

  const classes = useMemo(() => data ?? [], [data]);

  const totalCount = classes.length;
  const dayCount = useMemo(
    () => new Set(classes.map((slot) => slot.dayOfWeek)).size,
    [classes],
  );

  const filters: { value: DayFilter; label: string }[] = [
    { value: "all", label: "All week" },
    ...WEEKDAYS.map((day) => ({ value: day, label: DAY_LABELS[day] })),
  ];

  return (
    <div data-ocid="classes.page" className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <CalendarDays className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Timetable
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Weekly classes
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every class for the week, grouped by day with time, room, and
          instructor. Filter to a single day to plan ahead.
        </p>
      </header>

      <div
        data-ocid="classes.filter.tab"
        role="tablist"
        aria-label="Filter classes by day"
        className="flex flex-wrap gap-2"
      >
        {filters.map((filter) => {
          const active = dayFilter === filter.value;
          return (
            <Button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={active}
              variant={active ? "default" : "outline"}
              size="sm"
              data-ocid={`classes.filter.${filter.value}`}
              onClick={() => setDayFilter(filter.value)}
              className={cn("rounded-full", !active && "bg-card")}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

      {!isLoading && totalCount > 0 ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-foreground">{totalCount}</span>{" "}
          {totalCount === 1 ? "class" : "classes"} across{" "}
          <span className="font-mono text-foreground">{dayCount}</span>{" "}
          {dayCount === 1 ? "day" : "days"}
        </p>
      ) : null}

      <TimetableGrid
        classes={classes}
        isLoading={isLoading}
        emptyMessage={
          dayFilter === "all"
            ? "No classes have been added to the timetable yet."
            : `No classes scheduled for ${DAY_LABELS[dayFilter]}.`
        }
      />
    </div>
  );
}
