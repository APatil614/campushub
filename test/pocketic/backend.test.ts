import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * Backend behavior lane: installs the app's own compiled wasm into the
 * platform's PocketIC replica and calls the real public API.
 *
 * The runner skips this file entirely when the backend wasm or the replica is
 * unavailable, so a frontend-only build never reaches here. When it does run,
 * a trap or a wrong value is a real backend defect and fails the gate.
 *
 * The generated Candid declarations are the source of truth for argument
 * shapes: every optional field is a required key holding `[] | [T]`, so an
 * empty filter is `{ category: [], search: [], sort: [] }`, not `{}`.
 */

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

/** The first non-anonymous caller of `_initialize_access_control` becomes admin. */
const admin = createIdentity("caffeine-backend-lane-admin");

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
    sender: admin.getPrincipal(),
  }));
  // Register the admin caller so the admin-only writes below are authorized.
  actor.setIdentity(admin);
  await actor._initialize_access_control();
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers the seeded reads instead of trapping", async () => {
  // The first migration seeds demo content, so a fresh install is not empty.
  // Asserting the seeded shape proves the reads decode and the seed survived.
  const notices = await actor.listNotices({
    category: [],
    search: [],
    sort: [],
  });
  expect(notices).toHaveLength(5);
  expect(notices[0]).toMatchObject({
    title: "Mid-semester examination timetable released",
    pinned: true,
  });

  const events = await actor.listEvents({
    time: [],
    search: [],
    eventType: [],
  });
  expect(events).toHaveLength(5);

  const classes = await actor.listClasses([]);
  expect(classes).toHaveLength(14);

  const syllabus = await actor.listSyllabus();
  expect(syllabus).toHaveLength(4);

  const feed = await actor.getLatestFeed(12n);
  expect(feed.length).toBeGreaterThan(0);
  // Pinned notices surface first in the unified feed.
  expect(feed[0]).toMatchObject({ pinned: true });

  const summary = await actor.getSummaryCounts();
  expect(summary).toEqual({
    upcomingEvents: expect.any(BigInt),
    newNotices: expect.any(BigInt),
    todaysClasses: expect.any(BigInt),
  });
});

it("returns null for an unknown id instead of trapping", async () => {
  await expect(actor.getNotice(999n)).resolves.toEqual([]);
  await expect(actor.getEvent(999n)).resolves.toEqual([]);
  await expect(actor.getClass(999n)).resolves.toEqual([]);
  await expect(actor.getSyllabus(999n)).resolves.toEqual([]);
  await expect(actor.getSubjectDetail("Nonexistent")).resolves.toEqual([]);
});

it("round-trips a notice through the real canister", async () => {
  actor.setIdentity(admin);
  const id = await actor.createNotice({
    title: "Lane notice",
    body: "Written by the backend lane",
    pinned: false,
    category: { general: null },
    attachments: [],
  });
  const notice = await actor.getNotice(id);
  expect(notice).toHaveLength(1);
  expect(notice[0]).toMatchObject({ title: "Lane notice" });
});

it("round-trips an event through the real canister", async () => {
  actor.setIdentity(admin);
  const id = await actor.createEvent({
    title: "Lane event",
    description: "Written by the backend lane",
    venue: "Main Hall",
    organiser: "Lane",
    startAt: 1_800_000_000_000_000_000n,
    endAt: 1_800_000_360_000_000_000n,
    registrationInfo: "",
    attachments: [],
    eventType: { event: null },
  });
  const event = await actor.getEvent(id);
  expect(event).toHaveLength(1);
  expect(event[0]).toMatchObject({ title: "Lane event" });
});

it("round-trips a class slot through the real canister", async () => {
  actor.setIdentity(admin);
  const id = await actor.createClass({
    subject: "Lane Subject",
    startTime: "09:00",
    endTime: "10:00",
    instructor: "Lane Instructor",
    dayOfWeek: { monday: null },
    room: "Room 1",
  });
  const slot = await actor.getClass(id);
  expect(slot).toHaveLength(1);
  expect(slot[0]).toMatchObject({ subject: "Lane Subject" });
});

it("round-trips a syllabus entry through the real canister", async () => {
  actor.setIdentity(admin);
  const id = await actor.createSyllabus({
    subject: "Lane Syllabus",
    topics: [{ title: "Topic", description: "Description" }],
    materialLink: [],
    attachments: [],
  });
  const entry = await actor.getSyllabus(id);
  expect(entry).toHaveLength(1);
  expect(entry[0]).toMatchObject({ subject: "Lane Syllabus" });
});

it("rejects an anonymous caller from admin-only writes", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(
    guest.createNotice({
      title: "Not allowed",
      body: "Anonymous caller",
      pinned: false,
      category: { general: null },
      attachments: [],
    }),
  ).rejects.toThrow();
});
