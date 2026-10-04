import { Badge } from "@/components/ui/badge";
import { formatDayBadge, formatRelative, truncate } from "@/lib/format";
import {
  EVENT_TYPE_LABELS,
  FEED_KIND_LABELS,
  type FeedItem,
  FeedKind,
  NOTICE_CATEGORY_LABELS,
  NoticeCategory,
  noticeRailClass,
  noticeTextClass,
} from "@/types";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Megaphone, Pin, Trophy } from "lucide-react";
import type { ComponentType } from "react";

const KIND_ICONS: Record<FeedKind, ComponentType<{ className?: string }>> = {
  [FeedKind.notice]: Megaphone,
  [FeedKind.event]: CalendarDays,
  [FeedKind.competition]: Trophy,
};

/** Route target for a feed item, based on its kind. */
function detailTarget(item: FeedItem): { to: string; params: { id: string } } {
  if (item.kind === FeedKind.notice) {
    return { to: "/notices/$id", params: { id: item.id.toString() } };
  }
  return { to: "/events/$id", params: { id: item.id.toString() } };
}

/** Category label + tint class for the item's badge. */
function categoryMeta(item: FeedItem): { label: string; textClass: string } {
  if (item.kind === FeedKind.notice && item.noticeCategory) {
    return {
      label: NOTICE_CATEGORY_LABELS[item.noticeCategory],
      textClass: noticeTextClass(item.noticeCategory),
    };
  }
  if (item.eventType) {
    return {
      label: EVENT_TYPE_LABELS[item.eventType],
      textClass: "text-primary",
    };
  }
  return {
    label: FEED_KIND_LABELS[item.kind],
    textClass: "text-muted-foreground",
  };
}

interface FeedItemCardProps {
  item: FeedItem;
  /** Stagger index used for the entrance animation delay. */
  index: number;
}

/**
 * A single row in the unified "Latest Updates" feed. Carries a category color
 * rail, a monospace date chip, and a distinct urgent treatment for pinned items.
 */
export function FeedItemCard({ item, index }: FeedItemCardProps) {
  const urgent =
    item.pinned ||
    (item.kind === FeedKind.notice &&
      item.noticeCategory === NoticeCategory.urgent);
  const railClass = urgent
    ? "rail-urgent"
    : item.kind === FeedKind.notice && item.noticeCategory
      ? noticeRailClass(item.noticeCategory)
      : "rail-general";
  const { label, textClass } = categoryMeta(item);
  const badge = formatDayBadge(item.at);
  const Icon = KIND_ICONS[item.kind];
  const target = detailTarget(item);

  return (
    <Link
      {...target}
      data-ocid={`home.feed.item.${index + 1}`}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className={`group relative flex animate-fade-in-up gap-4 overflow-hidden rounded-xl border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-5 ${
        urgent ? "border-destructive/40 shadow-urgent" : "border-border"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${railClass}`}
      />

      {/* Date chip */}
      <div className="ml-1 flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-muted/50">
        <span className="font-mono text-lg font-bold leading-none text-foreground">
          {badge.day}
        </span>
        <span className="mt-0.5 font-mono text-[10px] font-semibold tracking-widest text-muted-foreground">
          {badge.month}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {urgent && (
            <Badge
              variant="destructive"
              className="gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            >
              <Pin className="size-3" />
              Pinned
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`gap-1 rounded-full border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${textClass}`}
          >
            <Icon className="size-3" />
            {label}
          </Badge>
          <span className="font-mono text-[11px] text-muted-foreground">
            {formatRelative(item.at)}
          </span>
        </div>

        <h3 className="mt-2 font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary md:text-lg">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {truncate(item.preview, 160)}
        </p>
      </div>
    </Link>
  );
}
