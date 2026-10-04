import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import { formatDateTime, shortPrincipal } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  type Attachment,
  NOTICE_CATEGORY_LABELS,
  type Notice,
  noticeRailClass,
  noticeTextClass,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Paperclip,
  Pin,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo } from "react";

/** Render an attachment as a downloadable link from its inline blob. */
function AttachmentLink({ attachment }: { attachment: Attachment }) {
  const url = useMemo(() => {
    const bytes = new Uint8Array(attachment.blob);
    return URL.createObjectURL(
      new Blob([bytes], { type: attachment.mimeType }),
    );
  }, [attachment.blob, attachment.mimeType]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <a
      href={url}
      download={attachment.filename}
      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Paperclip className="size-4 text-muted-foreground" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">
          {attachment.filename}
        </span>
        <span className="block text-xs text-muted-foreground">
          {attachment.mimeType}
        </span>
      </span>
    </a>
  );
}

/** Full notice view: content, category, author, posted date, pinned, attachments. */
export function NoticeDetailPage() {
  const { id } = useParams({ from: "/notices/$id" });
  const { actor, isFetching } = useBackend();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notice", id],
    queryFn: async (): Promise<Notice | null> => {
      if (!actor) return null;
      return api.getNotice(actor, BigInt(id));
    },
    enabled: !!actor && !isFetching,
  });

  const backLink = (
    <Link
      to="/notices"
      search={{}}
      data-ocid="notice.back_link"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="size-4" />
      Back to notices
    </Link>
  );

  if (isLoading) {
    return (
      <div
        data-ocid="notice.loading_state"
        className="space-y-6"
        aria-busy="true"
      >
        {backLink}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div data-ocid="notice.error_state" className="space-y-6">
        {backLink}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <h1 className="font-display text-lg font-semibold text-foreground">
            Couldn't load this notice
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching the notice.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            data-ocid="notice.retry_button"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div data-ocid="notice.empty_state" className="space-y-6">
        {backLink}
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h1 className="font-display text-lg font-semibold text-foreground">
            Notice not found
          </h1>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            This notice may have been removed or the link is incorrect.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/notices" search={{}} data-ocid="notice.browse_button">
              Browse all notices
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article data-ocid="notice.page" className="space-y-6">
      {backLink}

      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-subtle">
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 w-1.5",
            noticeRailClass(data.category),
          )}
        />

        <header className="space-y-4 border-b border-border p-6 pl-8">
          <div className="flex flex-wrap items-center gap-2">
            {data.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent">
                <Pin className="size-3" />
                Pinned
              </span>
            )}
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border-current/30 bg-current/10",
                noticeTextClass(data.category),
              )}
            >
              {NOTICE_CATEGORY_LABELS[data.category]}
            </Badge>
          </div>

          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
            {data.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-4" />
              {shortPrincipal(data.author.toString())}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              <span className="font-mono">{formatDateTime(data.postedAt)}</span>
            </span>
          </div>
        </header>

        <div className="p-6 pl-8">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap font-body text-base leading-relaxed text-foreground">
            {data.body}
          </div>
        </div>

        {data.attachments.length > 0 && (
          <div className="border-t border-border p-6 pl-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Attachments
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.attachments.map((attachment) => (
                <AttachmentLink
                  key={attachment.filename}
                  attachment={attachment}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
