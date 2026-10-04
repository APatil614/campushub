import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelative, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  NOTICE_CATEGORY_LABELS,
  type Notice,
  NoticeCategory,
  noticeRailClass,
  noticeTextClass,
} from "@/types";
import { Link } from "@tanstack/react-router";
import { Paperclip, Pin } from "lucide-react";

interface NoticeCardProps {
  notice: Notice;
  /** Position in the list, used for deterministic test markers. */
  index: number;
}

/**
 * A single notice row in the notices list: category rail, mono date chip,
 * title, short preview, category badge, and pinned/attachment indicators.
 */
export function NoticeCard({ notice, index }: NoticeCardProps) {
  const isUrgent = notice.category === NoticeCategory.urgent;

  return (
    <Link
      to="/notices/$id"
      params={{ id: notice.id.toString() }}
      data-ocid={`notice.item.${index + 1}`}
      className={cn(
        "group relative flex gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-subtle transition-smooth",
        "hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isUrgent && "shadow-urgent",
      )}
    >
      {/* Category rail */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          noticeRailClass(notice.category),
        )}
      />

      {/* Mono date chip */}
      <div className="ml-1 flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center">
        <span className="font-mono text-lg font-bold leading-none text-foreground">
          {formatDate(notice.postedAt).split(" ")[1]?.replace(",", "") ?? "--"}
        </span>
        <span className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {formatDate(notice.postedAt).split(" ")[0] ?? "---"}
        </span>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {notice.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
              <Pin className="size-3" />
              Pinned
            </span>
          )}
          <Badge
            variant="outline"
            className={cn(
              "rounded-full border-current/30 bg-current/10",
              noticeTextClass(notice.category),
            )}
          >
            {NOTICE_CATEGORY_LABELS[notice.category]}
          </Badge>
        </div>

        <h3 className="mt-2 font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary">
          {notice.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {truncate(notice.body, 160)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">{formatRelative(notice.postedAt)}</span>
          {notice.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="size-3" />
              {notice.attachments.length}{" "}
              {notice.attachments.length === 1 ? "attachment" : "attachments"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
