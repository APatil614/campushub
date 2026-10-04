import type { Backend } from "@/backend";
import {
  DayOfWeek,
  EventTimeFilter,
  EventType,
  FeedKind,
  NoticeCategory,
  NoticeSort,
  UserRole,
} from "@/backend";
import type {
  ClassSlot,
  Event,
  FeedItem,
  Notice,
  SubjectDetail,
  SummaryCounts,
  SyllabusEntry,
} from "@/backend";

/**
 * A typed, in-memory stand-in for the generated `Backend` actor.
 *
 * Every method the UI calls is implemented with a local, deterministic
 * implementation so component tests exercise real rendering, filtering, and
 * navigation logic without a network or a replica. Tests seed the store and
 * assert on what the UI shows; the mock never reaches outside the process.
 */
export interface MockBackendState {
  notices: Notice[];
  events: Event[];
  classes: ClassSlot[];
  syllabus: SyllabusEntry[];
  isAdmin: boolean;
  summary: SummaryCounts;
}

/** A principal-shaped string accepted by `Notice.author`. */
const AUTHOR = {
  toString: () => "aaaaa-aa",
} as unknown as Notice["author"];

/** Build a notice with sensible defaults; override any field. */
export function makeNotice(overrides: Partial<Notice> = {}): Notice {
  return {
    id: 1n,
    title: "Default notice",
    body: "Default body",
    postedAt: 1_700_000_000_000_000_000n,
    author: AUTHOR,
    pinned: false,
    category: NoticeCategory.general,
    attachments: [],
    ...overrides,
  };
}

/** Build an event with sensible defaults; override any field. */
export function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1n,
    title: "Default event",
    description: "Default description",
    venue: "Main Hall",
    organiser: "Student Union",
    startAt: 1_800_000_000_000_000_000n,
    endAt: 1_800_000_360_000_000_000n,
    registrationInfo: "",
    attachments: [],
    eventType: EventType.event,
    ...overrides,
  };
}

/** Build a class slot with sensible defaults; override any field. */
export function makeClass(overrides: Partial<ClassSlot> = {}): ClassSlot {
  return {
    id: 1n,
    subject: "Mathematics",
    startTime: "09:00",
    endTime: "10:00",
    instructor: "Dr. Ada",
    dayOfWeek: DayOfWeek.monday,
    room: "Room 101",
    ...overrides,
  };
}

/** Build a syllabus entry with sensible defaults; override any field. */
export function makeSyllabus(
  overrides: Partial<SyllabusEntry> = {},
): SyllabusEntry {
  return {
    id: 1n,
    subject: "Mathematics",
    topics: [{ title: "Algebra", description: "Linear equations" }],
    attachments: [],
    ...overrides,
  };
}

/** Build a feed item with sensible defaults; override any field. */
export function makeFeedItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    id: 1n,
    title: "Default feed item",
    preview: "Default preview",
    kind: FeedKind.notice,
    pinned: false,
    at: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

/** Default summary counts used when a test does not seed its own. */
export function makeSummary(
  overrides: Partial<SummaryCounts> = {},
): SummaryCounts {
  return {
    upcomingEvents: 0n,
    newNotices: 0n,
    todaysClasses: 0n,
    ...overrides,
  };
}

/**
 * Create a mock backend actor plus its mutable state. The returned object is
 * structurally compatible with the generated `Backend` class for every method
 * the UI consumes.
 */
export function createMockBackend(seed: Partial<MockBackendState> = {}): {
  actor: Backend;
  state: MockBackendState;
} {
  const state: MockBackendState = {
    notices: seed.notices ?? [],
    events: seed.events ?? [],
    classes: seed.classes ?? [],
    syllabus: seed.syllabus ?? [],
    isAdmin: seed.isAdmin ?? false,
    summary: seed.summary ?? makeSummary(),
  };

  const actor = {
    listNotices: async (
      filter: {
        category?: NoticeCategory;
        search?: string;
        sort?: NoticeSort;
      } = {},
    ) => {
      let rows = [...state.notices];
      if (filter.category) {
        rows = rows.filter((n) => n.category === filter.category);
      }
      if (filter.search) {
        const needle = filter.search.toLowerCase();
        rows = rows.filter(
          (n) =>
            n.title.toLowerCase().includes(needle) ||
            n.body.toLowerCase().includes(needle),
        );
      }
      rows.sort((a, b) =>
        filter.sort === NoticeSort.oldest
          ? Number(a.postedAt - b.postedAt)
          : Number(b.postedAt - a.postedAt),
      );
      return rows;
    },
    getNotice: async (id: bigint) =>
      state.notices.find((n) => n.id === id) ?? null,
    createNotice: async (input: {
      title: string;
      body: string;
      pinned: boolean;
      category: NoticeCategory;
      attachments: Notice["attachments"];
    }) => {
      const id = BigInt(state.notices.length + 1);
      state.notices.push(
        makeNotice({ ...input, id, postedAt: BigInt(Date.now()) * 1_000_000n }),
      );
      return id;
    },
    updateNotice: async (id: bigint, input: Partial<Notice>) => {
      const index = state.notices.findIndex((n) => n.id === id);
      if (index < 0) return false;
      state.notices[index] = { ...state.notices[index], ...input };
      return true;
    },
    deleteNotice: async (id: bigint) => {
      const before = state.notices.length;
      state.notices = state.notices.filter((n) => n.id !== id);
      return state.notices.length < before;
    },

    listEvents: async (
      filter: {
        eventType?: EventType;
        time?: EventTimeFilter;
        search?: string;
      } = {},
    ) => {
      let rows = [...state.events];
      if (filter.eventType) {
        rows = rows.filter((e) => e.eventType === filter.eventType);
      }
      if (filter.search) {
        const needle = filter.search.toLowerCase();
        rows = rows.filter(
          (e) =>
            e.title.toLowerCase().includes(needle) ||
            e.description.toLowerCase().includes(needle),
        );
      }
      // The backend defaults an absent time filter to upcoming-only, so the
      // mock must too or the UI's default view would diverge from production.
      const time = filter.time ?? EventTimeFilter.upcoming;
      if (time === EventTimeFilter.upcoming) {
        const now = BigInt(Date.now()) * 1_000_000n;
        rows = rows.filter((e) => e.startAt >= now);
      } else if (time === EventTimeFilter.past) {
        const now = BigInt(Date.now()) * 1_000_000n;
        rows = rows.filter((e) => e.startAt < now);
      }
      return rows;
    },
    getEvent: async (id: bigint) =>
      state.events.find((e) => e.id === id) ?? null,
    createEvent: async (input: Partial<Event>) => {
      const id = BigInt(state.events.length + 1);
      state.events.push(makeEvent({ ...input, id }));
      return id;
    },
    updateEvent: async (id: bigint, input: Partial<Event>) => {
      const index = state.events.findIndex((e) => e.id === id);
      if (index < 0) return false;
      state.events[index] = { ...state.events[index], ...input };
      return true;
    },
    deleteEvent: async (id: bigint) => {
      const before = state.events.length;
      state.events = state.events.filter((e) => e.id !== id);
      return state.events.length < before;
    },

    listClasses: async (day: DayOfWeek | null = null) =>
      day
        ? state.classes.filter((c) => c.dayOfWeek === day)
        : [...state.classes],
    getClass: async (id: bigint) =>
      state.classes.find((c) => c.id === id) ?? null,
    createClass: async (input: Partial<ClassSlot>) => {
      const id = BigInt(state.classes.length + 1);
      state.classes.push(makeClass({ ...input, id }));
      return id;
    },
    updateClass: async (id: bigint, input: Partial<ClassSlot>) => {
      const index = state.classes.findIndex((c) => c.id === id);
      if (index < 0) return false;
      state.classes[index] = { ...state.classes[index], ...input };
      return true;
    },
    deleteClass: async (id: bigint) => {
      const before = state.classes.length;
      state.classes = state.classes.filter((c) => c.id !== id);
      return state.classes.length < before;
    },

    listSyllabus: async () => [...state.syllabus],
    getSyllabus: async (id: bigint) =>
      state.syllabus.find((s) => s.id === id) ?? null,
    createSyllabus: async (input: Partial<SyllabusEntry>) => {
      const id = BigInt(state.syllabus.length + 1);
      state.syllabus.push(makeSyllabus({ ...input, id }));
      return id;
    },
    updateSyllabus: async (id: bigint, input: Partial<SyllabusEntry>) => {
      const index = state.syllabus.findIndex((s) => s.id === id);
      if (index < 0) return false;
      state.syllabus[index] = { ...state.syllabus[index], ...input };
      return true;
    },
    deleteSyllabus: async (id: bigint) => {
      const before = state.syllabus.length;
      state.syllabus = state.syllabus.filter((s) => s.id !== id);
      return state.syllabus.length < before;
    },

    getSubjectDetail: async (
      subject: string,
    ): Promise<SubjectDetail | null> => {
      const syllabus = state.syllabus.find((s) => s.subject === subject);
      const classes = state.classes.filter((c) => c.subject === subject);
      if (!syllabus && classes.length === 0) return null;
      return { subject, classes, syllabus };
    },
    getLatestFeed: async (limit: bigint) => {
      const items: FeedItem[] = [
        ...state.notices.map((n) =>
          makeFeedItem({
            id: n.id,
            title: n.title,
            preview: n.body,
            kind: FeedKind.notice,
            pinned: n.pinned,
            at: n.postedAt,
            noticeCategory: n.category,
          }),
        ),
        ...state.events.map((e) =>
          makeFeedItem({
            id: e.id,
            title: e.title,
            preview: e.description,
            kind:
              e.eventType === EventType.competition
                ? FeedKind.competition
                : FeedKind.event,
            pinned: false,
            at: e.startAt,
            eventType: e.eventType,
          }),
        ),
      ];
      // Mirror the documented backend contract: pinned notices first, then
      // everything else newest first.
      items.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return Number(b.at - a.at);
      });
      return items.slice(0, Number(limit));
    },
    getSummaryCounts: async () => state.summary,

    isCallerAdmin: async () => state.isAdmin,
    getCallerUserRole: async () =>
      state.isAdmin ? UserRole.admin : UserRole.guest,
  } as unknown as Backend;

  return { actor, state };
}
