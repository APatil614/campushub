import type {
  Attachment,
  ClassSlot,
  Event,
  EventFilter,
  EventInput,
  EventTimeFilter,
  EventType,
  FeedItem,
  FeedKind,
  ItemId,
  Notice,
  NoticeCategory,
  NoticeFilter,
  NoticeInput,
  NoticeSort,
  SubjectDetail,
  SummaryCounts,
  SyllabusEntry,
  SyllabusInput,
  SyllabusTopic,
  Timestamp,
} from "@/backend";
import {
  DayOfWeek,
  EventTimeFilter as EventTimeFilterValue,
  EventType as EventTypeValue,
  FeedKind as FeedKindValue,
  NoticeCategory as NoticeCategoryValue,
  NoticeSort as NoticeSortValue,
  UserRole,
} from "@/backend";

// Re-export backend enums as values so pages can use `NoticeCategory.exam` etc.
export {
  DayOfWeek,
  EventTimeFilterValue as EventTimeFilter,
  EventTypeValue as EventType,
  FeedKindValue as FeedKind,
  NoticeCategoryValue as NoticeCategory,
  NoticeSortValue as NoticeSort,
  UserRole,
};

// Re-export backend record/interface types for page consumption.
export type {
  Attachment,
  ClassSlot,
  Event,
  EventFilter,
  EventInput,
  FeedItem,
  ItemId,
  Notice,
  NoticeFilter,
  NoticeInput,
  SubjectDetail,
  SummaryCounts,
  SyllabusEntry,
  SyllabusInput,
  SyllabusTopic,
  Timestamp,
};

/** A single navigation destination in the app shell. */
export interface NavItem {
  label: string;
  to: string;
  /** When true the link is only rendered for signed-in admins. */
  adminOnly?: boolean;
}

/** Human-readable labels for notice categories. */
export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, string> = {
  [NoticeCategoryValue.academic]: "Academic",
  [NoticeCategoryValue.exam]: "Exam",
  [NoticeCategoryValue.fee]: "Fee",
  [NoticeCategoryValue.general]: "General",
  [NoticeCategoryValue.urgent]: "Urgent",
};

/** Human-readable labels for event types. */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventTypeValue.event]: "Event",
  [EventTypeValue.competition]: "Competition",
  [EventTypeValue.workshop]: "Workshop",
  [EventTypeValue.activity]: "Activity",
};

/** Human-readable labels for feed item kinds. */
export const FEED_KIND_LABELS: Record<FeedKind, string> = {
  [FeedKindValue.notice]: "Notice",
  [FeedKindValue.event]: "Event",
  [FeedKindValue.competition]: "Competition",
};

/** Ordered list of weekdays used by the timetable view. */
export const WEEKDAYS: DayOfWeek[] = [
  DayOfWeek.monday,
  DayOfWeek.tuesday,
  DayOfWeek.wednesday,
  DayOfWeek.thursday,
  DayOfWeek.friday,
  DayOfWeek.saturday,
  DayOfWeek.sunday,
];

/** Human-readable labels for weekdays. */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.monday]: "Monday",
  [DayOfWeek.tuesday]: "Tuesday",
  [DayOfWeek.wednesday]: "Wednesday",
  [DayOfWeek.thursday]: "Thursday",
  [DayOfWeek.friday]: "Friday",
  [DayOfWeek.saturday]: "Saturday",
  [DayOfWeek.sunday]: "Sunday",
};

/** Tailwind rail class for a notice category, used by feed and list cards. */
export function noticeRailClass(category: NoticeCategory): string {
  switch (category) {
    case NoticeCategoryValue.academic:
      return "rail-academic";
    case NoticeCategoryValue.exam:
      return "rail-exam";
    case NoticeCategoryValue.fee:
      return "rail-fee";
    case NoticeCategoryValue.urgent:
      return "rail-urgent";
    default:
      return "rail-general";
  }
}

/** Tailwind text class for a notice category. */
export function noticeTextClass(category: NoticeCategory): string {
  switch (category) {
    case NoticeCategoryValue.academic:
      return "text-cat-academic";
    case NoticeCategoryValue.exam:
      return "text-cat-exam";
    case NoticeCategoryValue.fee:
      return "text-cat-fee";
    case NoticeCategoryValue.urgent:
      return "text-cat-urgent";
    default:
      return "text-cat-general";
  }
}
