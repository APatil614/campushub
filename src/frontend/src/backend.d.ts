import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Attachment {
    blob: Uint8Array;
    mimeType: string;
    filename: string;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface ClassInput {
    startTime: string;
    subject: string;
    endTime: string;
    instructor: string;
    dayOfWeek: DayOfWeek;
    room: string;
}
export interface ClassSlot {
    id: ItemId;
    startTime: string;
    subject: string;
    endTime: string;
    instructor: string;
    dayOfWeek: DayOfWeek;
    room: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Event {
    id: ItemId;
    organiser: string;
    title: string;
    venue: string;
    startAt: Timestamp;
    description: string;
    endAt: Timestamp;
    registrationInfo: string;
    attachments: Array<Attachment>;
    eventType: EventType;
}
export interface EventFilter {
    time?: EventTimeFilter;
    search?: string;
    eventType?: EventType;
}
export interface EventInput {
    organiser: string;
    title: string;
    venue: string;
    startAt: Timestamp;
    description: string;
    endAt: Timestamp;
    registrationInfo: string;
    attachments: Array<Attachment>;
    eventType: EventType;
}
export interface FeedItem {
    at: Timestamp;
    id: ItemId;
    title: string;
    preview: string;
    kind: FeedKind;
    pinned: boolean;
    noticeCategory?: NoticeCategory;
    eventType?: EventType;
}
export type ItemId = bigint;
export interface Notice {
    id: ItemId;
    title: string;
    postedAt: Timestamp;
    body: string;
    author: Principal;
    pinned: boolean;
    category: NoticeCategory;
    attachments: Array<Attachment>;
}
export interface NoticeFilter {
    sort?: NoticeSort;
    search?: string;
    category?: NoticeCategory;
}
export interface NoticeInput {
    title: string;
    body: string;
    pinned: boolean;
    category: NoticeCategory;
    attachments: Array<Attachment>;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SubjectDetail {
    subject: string;
    classes: Array<ClassSlot>;
    syllabus?: SyllabusEntry;
}
export interface SummaryCounts {
    upcomingEvents: bigint;
    newNotices: bigint;
    todaysClasses: bigint;
}
export interface SyllabusEntry {
    id: ItemId;
    subject: string;
    topics: Array<SyllabusTopic>;
    materialLink?: string;
    attachments: Array<Attachment>;
}
export interface SyllabusInput {
    subject: string;
    topics: Array<SyllabusTopic>;
    materialLink?: string;
    attachments: Array<Attachment>;
}
export interface SyllabusTopic {
    title: string;
    description: string;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum DayOfWeek {
    tuesday = "tuesday",
    wednesday = "wednesday",
    saturday = "saturday",
    thursday = "thursday",
    sunday = "sunday",
    friday = "friday",
    monday = "monday"
}
export enum EventTimeFilter {
    all = "all",
    upcoming = "upcoming",
    past = "past"
}
export enum EventType {
    workshop = "workshop",
    event = "event",
    competition = "competition",
    activity = "activity"
}
export enum FeedKind {
    notice = "notice",
    event = "event",
    competition = "competition"
}
export enum NoticeCategory {
    fee = "fee",
    exam = "exam",
    academic = "academic",
    urgent = "urgent",
    general = "general"
}
export enum NoticeSort {
    newest = "newest",
    oldest = "oldest"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Admin-only: create a class slot. Returns the new id.
     */
    createClass(input: ClassInput): Promise<bigint>;
    /**
     * / Admin-only: create an event or competition. Returns the new event id.
     */
    createEvent(input: EventInput): Promise<bigint>;
    /**
     * / Admin-only: create a notice. Returns the new notice id.
     */
    createNotice(input: NoticeInput): Promise<bigint>;
    /**
     * / Admin-only: create a syllabus entry. Returns the new id.
     */
    createSyllabus(input: SyllabusInput): Promise<bigint>;
    /**
     * / Admin-only: delete a class slot. Returns false when the id is unknown.
     */
    deleteClass(id: bigint): Promise<boolean>;
    /**
     * / Admin-only: delete an event. Returns false when the id is unknown.
     */
    deleteEvent(id: bigint): Promise<boolean>;
    /**
     * / Admin-only: delete a notice. Returns false when the id is unknown.
     */
    deleteNotice(id: bigint): Promise<boolean>;
    /**
     * / Admin-only: delete a syllabus entry. Returns false when the id is unknown.
     */
    deleteSyllabus(id: bigint): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Returns the backend API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Fetch a single class slot by id; null when it does not exist.
     */
    getClass(id: bigint): Promise<ClassSlot | null>;
    /**
     * / Fetch a single event by id; null when it does not exist.
     */
    getEvent(id: bigint): Promise<Event | null>;
    /**
     * / Unified "Latest Updates" feed: pinned notices first, then recent notices,
     * / events, and competitions newest first, capped at `limit`.
     */
    getLatestFeed(limit: bigint): Promise<Array<FeedItem>>;
    /**
     * / Fetch a single notice by id; null when it does not exist.
     */
    getNotice(id: bigint): Promise<Notice | null>;
    /**
     * / Subject detail: syllabus outline plus associated class schedule.
     */
    getSubjectDetail(subject: string): Promise<SubjectDetail | null>;
    /**
     * / Quick-glance dashboard counts: upcoming events, new notices, today's classes.
     */
    getSummaryCounts(): Promise<SummaryCounts>;
    /**
     * / Fetch a syllabus entry by id; null when it does not exist.
     */
    getSyllabus(id: bigint): Promise<SyllabusEntry | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List class slots, optionally restricted to a single day of the week.
     */
    listClasses(day: DayOfWeek | null): Promise<Array<ClassSlot>>;
    /**
     * / List events with optional type filter, upcoming/past filter, and keyword search.
     */
    listEvents(filter: EventFilter): Promise<Array<Event>>;
    /**
     * / List notices with optional category filter, keyword search, and sort order.
     */
    listNotices(filter: NoticeFilter): Promise<Array<Notice>>;
    /**
     * / List all syllabus entries.
     */
    listSyllabus(): Promise<Array<SyllabusEntry>>;
    schema(): Promise<string>;
    /**
     * / Admin-only: update an existing class slot. Returns false when the id is unknown.
     */
    updateClass(id: bigint, input: ClassInput): Promise<boolean>;
    /**
     * / Admin-only: update an existing event. Returns false when the id is unknown.
     */
    updateEvent(id: bigint, input: EventInput): Promise<boolean>;
    /**
     * / Admin-only: update an existing notice. Returns false when the id is unknown.
     */
    updateNotice(id: bigint, input: NoticeInput): Promise<boolean>;
    /**
     * / Admin-only: update an existing syllabus entry. Returns false when the id is unknown.
     */
    updateSyllabus(id: bigint, input: SyllabusInput): Promise<boolean>;
}
