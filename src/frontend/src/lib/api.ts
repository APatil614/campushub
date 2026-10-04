import type {
  ClassInput,
  ClassSlot,
  DayOfWeek,
  Event,
  EventFilter,
  EventInput,
  FeedItem,
  Notice,
  NoticeFilter,
  NoticeInput,
  SubjectDetail,
  SummaryCounts,
  SyllabusEntry,
  SyllabusInput,
} from "@/backend";
import type { Backend } from "@/backend";

/**
 * Typed wrapper around every backend method used by the UI.
 *
 * Pages and hooks call these functions with a ready actor from `useBackend()`;
 * the wrapper keeps the generated bindings out of component code and gives one
 * place to adapt argument shapes.
 */
export const api = {
  // Notices
  listNotices: (actor: Backend, filter: NoticeFilter = {}): Promise<Notice[]> =>
    actor.listNotices(filter),
  getNotice: (actor: Backend, id: bigint): Promise<Notice | null> =>
    actor.getNotice(id),
  createNotice: (actor: Backend, input: NoticeInput): Promise<bigint> =>
    actor.createNotice(input),
  updateNotice: (
    actor: Backend,
    id: bigint,
    input: NoticeInput,
  ): Promise<boolean> => actor.updateNotice(id, input),
  deleteNotice: (actor: Backend, id: bigint): Promise<boolean> =>
    actor.deleteNotice(id),

  // Events & competitions
  listEvents: (actor: Backend, filter: EventFilter = {}): Promise<Event[]> =>
    actor.listEvents(filter),
  getEvent: (actor: Backend, id: bigint): Promise<Event | null> =>
    actor.getEvent(id),
  createEvent: (actor: Backend, input: EventInput): Promise<bigint> =>
    actor.createEvent(input),
  updateEvent: (
    actor: Backend,
    id: bigint,
    input: EventInput,
  ): Promise<boolean> => actor.updateEvent(id, input),
  deleteEvent: (actor: Backend, id: bigint): Promise<boolean> =>
    actor.deleteEvent(id),

  // Classes & timetable
  listClasses: (
    actor: Backend,
    day: DayOfWeek | null = null,
  ): Promise<ClassSlot[]> => actor.listClasses(day),
  getClass: (actor: Backend, id: bigint): Promise<ClassSlot | null> =>
    actor.getClass(id),
  createClass: (actor: Backend, input: ClassInput): Promise<bigint> =>
    actor.createClass(input),
  updateClass: (
    actor: Backend,
    id: bigint,
    input: ClassInput,
  ): Promise<boolean> => actor.updateClass(id, input),
  deleteClass: (actor: Backend, id: bigint): Promise<boolean> =>
    actor.deleteClass(id),

  // Syllabus
  listSyllabus: (actor: Backend): Promise<SyllabusEntry[]> =>
    actor.listSyllabus(),
  getSyllabus: (actor: Backend, id: bigint): Promise<SyllabusEntry | null> =>
    actor.getSyllabus(id),
  createSyllabus: (actor: Backend, input: SyllabusInput): Promise<bigint> =>
    actor.createSyllabus(input),
  updateSyllabus: (
    actor: Backend,
    id: bigint,
    input: SyllabusInput,
  ): Promise<boolean> => actor.updateSyllabus(id, input),
  deleteSyllabus: (actor: Backend, id: bigint): Promise<boolean> =>
    actor.deleteSyllabus(id),

  // Aggregates
  getSubjectDetail: (
    actor: Backend,
    subject: string,
  ): Promise<SubjectDetail | null> => actor.getSubjectDetail(subject),
  getLatestFeed: (actor: Backend, limit: bigint): Promise<FeedItem[]> =>
    actor.getLatestFeed(limit),
  getSummaryCounts: (actor: Backend): Promise<SummaryCounts> =>
    actor.getSummaryCounts(),

  // Access control
  isCallerAdmin: (actor: Backend): Promise<boolean> => actor.isCallerAdmin(),
  getCallerUserRole: (actor: Backend) => actor.getCallerUserRole(),
};
