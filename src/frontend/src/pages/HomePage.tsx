import { FeedItemCard } from "@/components/FeedItemCard";
import { SummaryCards } from "@/components/SummaryCards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import type { FeedItem, SummaryCounts } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Inbox, RefreshCw } from "lucide-react";

const FEED_LIMIT = 12n;

/** Layout-matched placeholder rows shown while the feed loads. */
function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, i) => `feed-skeleton-${i}`).map((id) => (
        <div
          key={id}
          className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle md:p-5"
        >
          <Skeleton className="size-14 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Home dashboard: quick-glance counts plus the unified Latest Updates feed. */
export function HomePage() {
  const { actor, isFetching } = useBackend();
  const ready = !!actor && !isFetching;

  const feedQuery = useQuery<FeedItem[]>({
    queryKey: ["homeFeed", FEED_LIMIT.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return api.getLatestFeed(actor, FEED_LIMIT);
    },
    enabled: ready,
  });

  const countsQuery = useQuery<SummaryCounts>({
    queryKey: ["summaryCounts"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return api.getSummaryCounts(actor);
    },
    enabled: ready,
  });

  const feed = feedQuery.data ?? [];
  const showFeedSkeleton =
    feedQuery.isLoading || (isFetching && !feedQuery.data);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Latest Updates
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Everything happening on campus — notices, events and competitions in
          one place.
        </p>
      </header>

      <SummaryCards
        counts={countsQuery.data}
        isLoading={countsQuery.isLoading}
      />

      <section aria-label="Latest updates feed" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Campus feed
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/notices" data-ocid="home.view_all_notices.link">
              View all notices
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {showFeedSkeleton ? (
          <div data-ocid="home.feed.loading_state">
            <FeedSkeleton />
          </div>
        ) : feedQuery.isError ? (
          <div
            data-ocid="home.feed.error_state"
            className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
          >
            <AlertCircle className="size-8 text-destructive" />
            <div>
              <p className="font-display font-semibold text-foreground">
                We couldn't load the feed
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your connection and try again.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid="home.feed.retry_button"
              onClick={() => void feedQuery.refetch()}
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        ) : feed.length === 0 ? (
          <div
            data-ocid="home.feed.empty_state"
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="size-6" />
            </span>
            <div>
              <p className="font-display font-semibold text-foreground">
                Nothing posted yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                New notices and events will appear here as soon as they're
                shared.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/notices" data-ocid="home.feed.empty_action.link">
                Browse notices
              </Link>
            </Button>
          </div>
        ) : (
          <div data-ocid="home.feed.list" className="space-y-3">
            {feed.map((item, index) => (
              <FeedItemCard
                key={`${item.kind}-${item.id}`}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
