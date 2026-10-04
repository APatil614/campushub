import { NoticeCard } from "@/components/NoticeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  NOTICE_CATEGORY_LABELS,
  type Notice,
  NoticeCategory,
  NoticeSort,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const CATEGORY_ORDER: NoticeCategory[] = [
  NoticeCategory.academic,
  NoticeCategory.exam,
  NoticeCategory.fee,
  NoticeCategory.general,
  NoticeCategory.urgent,
];

const SKELETON_IDS = Array.from(
  { length: 5 },
  (_, i) => `notice-skeleton-${i}`,
);

/** Notices list with URL-driven category filter, keyword search, and sort. */
export function NoticesPage() {
  const { actor, isFetching } = useBackend();
  const navigate = useNavigate({ from: "/notices" });
  const search = useSearch({ from: "/notices" });

  const category = search.category ?? null;
  const sort = search.sort ?? NoticeSort.newest;
  const query = search.search ?? "";

  // Local draft so typing stays responsive; committed to the URL on submit.
  const [draft, setDraft] = useState(query);
  useEffect(() => {
    setDraft(query);
  }, [query]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notices", category, query, sort],
    queryFn: async (): Promise<Notice[]> => {
      if (!actor) return [];
      return api.listNotices(actor, {
        category: category ?? undefined,
        search: query.trim() || undefined,
        sort,
      });
    },
    enabled: !!actor && !isFetching,
  });

  const notices = data ?? [];

  const updateSearch = (patch: {
    category?: NoticeCategory | null;
    search?: string;
    sort?: NoticeSort;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev };
        if ("category" in patch) {
          next.category = patch.category === null ? undefined : patch.category;
        }
        if ("search" in patch) {
          next.search = patch.search;
        }
        if ("sort" in patch) {
          next.sort = patch.sort;
        }
        return next;
      },
      replace: true,
    });
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    updateSearch({ search: draft.trim() || undefined });
  };

  const clearSearch = () => {
    setDraft("");
    updateSearch({ search: undefined });
  };

  const hasActiveFilters = category !== null || query.trim() !== "";

  return (
    <div data-ocid="notices.page" className="space-y-6">
      {/* Page heading */}
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Campus bulletin
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Notices
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything posted across campus, in one place.
        </p>
      </header>

      {/* Controls */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-subtle">
        <form onSubmit={submitSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search notices by title or content…"
              aria-label="Search notices"
              data-ocid="notices.search_input"
              className="pl-9"
            />
          </div>
          <Button type="submit" data-ocid="notices.search_button">
            Search
          </Button>
          {query.trim() !== "" && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Clear search"
              data-ocid="notices.clear_search_button"
              onClick={clearSearch}
            >
              <X className="size-4" />
            </Button>
          )}
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category filter */}
          <fieldset className="flex flex-wrap gap-1.5">
            <legend className="sr-only">Filter by category</legend>
            <button
              type="button"
              data-ocid="notices.filter.all"
              aria-pressed={category === null}
              onClick={() => updateSearch({ category: null })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                category === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              All
            </button>
            {CATEGORY_ORDER.map((value) => (
              <button
                key={value}
                type="button"
                data-ocid={`notices.filter.${value}`}
                aria-pressed={category === value}
                onClick={() =>
                  updateSearch({ category: category === value ? null : value })
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  category === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {NOTICE_CATEGORY_LABELS[value]}
              </button>
            ))}
          </fieldset>

          {/* Sort toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="notices.sort_toggle"
            aria-label={`Sort by ${sort === NoticeSort.newest ? "oldest" : "newest"} first`}
            onClick={() =>
              updateSearch({
                sort:
                  sort === NoticeSort.newest
                    ? NoticeSort.oldest
                    : NoticeSort.newest,
              })
            }
          >
            {sort === NoticeSort.newest ? (
              <ArrowDownWideNarrow className="size-4" />
            ) : (
              <ArrowUpWideNarrow className="size-4" />
            )}
            {sort === NoticeSort.newest ? "Newest first" : "Oldest first"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div
          data-ocid="notices.loading_state"
          className="space-y-3"
          aria-busy="true"
          aria-label="Loading notices"
        >
          {SKELETON_IDS.map((id) => (
            <div
              key={id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <Skeleton className="size-14 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          data-ocid="notices.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <h2 className="font-display text-lg font-semibold text-foreground">
            Couldn't load notices
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching the bulletin.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            data-ocid="notices.retry_button"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      ) : notices.length === 0 ? (
        <div
          data-ocid="notices.empty_state"
          className="rounded-xl border border-dashed border-border bg-card p-10 text-center"
        >
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <Search className="size-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
            No notices found
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try a different keyword or clear the filters to see everything."
              : "There are no notices posted yet. Check back soon."}
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              data-ocid="notices.clear_filters_button"
              onClick={() => {
                setDraft("");
                void navigate({ search: {}, replace: true });
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {notices.length} {notices.length === 1 ? "notice" : "notices"}
          </p>
          <ul data-ocid="notices.list" className="space-y-3">
            {notices.map((notice, index) => (
              <li key={notice.id.toString()}>
                <NoticeCard notice={notice} index={index} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
