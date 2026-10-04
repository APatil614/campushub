import App from "@/App";
import { makeEvent, makeNotice } from "@/test/mockBackend";
import { mockBackend, mockIdentity, resetMockState } from "@/test/mockState";
import { navigateTo, renderWithQueryClient, resetRouter } from "@/test/render";
import { EventType, NoticeCategory } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The backend actor is replaced with a typed in-memory mock. This is a
// component/integration suite: it proves the UI renders and reacts to the
// actor's data, not that the canister behaves correctly.
vi.mock("@/hooks/useBackend", () => ({
  useBackend: () => ({ actor: mockBackend.actor, isFetching: false }),
}));

vi.mock("@caffeineai/core-infrastructure", async () => {
  const actual = await vi.importActual<
    typeof import("@caffeineai/core-infrastructure")
  >("@caffeineai/core-infrastructure");
  return {
    ...actual,
    useInternetIdentity: () => mockIdentity.current,
  };
});

describe("HomePage", () => {
  beforeEach(async () => {
    resetMockState();
    await resetRouter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Latest Updates heading and summary cards", async () => {
    renderWithQueryClient(<App />);

    expect(
      await screen.findByRole("heading", { name: "Latest Updates" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Today's Classes")).toBeInTheDocument();
    expect(screen.getByText("New Notices")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
  });

  it("merges notices, events, and competitions newest first", async () => {
    mockBackend.state.notices = [
      makeNotice({
        id: 1n,
        title: "Oldest notice",
        postedAt: 1_000_000_000_000_000_000n,
      }),
    ];
    mockBackend.state.events = [
      makeEvent({
        id: 2n,
        title: "Newest competition",
        eventType: EventType.competition,
        startAt: 3_000_000_000_000_000_000n,
      }),
      makeEvent({
        id: 3n,
        title: "Middle event",
        eventType: EventType.event,
        startAt: 2_000_000_000_000_000_000n,
      }),
    ];

    renderWithQueryClient(<App />);

    const feed = await screen.findByTestId("home.feed.list");
    const titles = Array.from(
      feed.querySelectorAll("h3"),
      (node) => node.textContent,
    );
    expect(titles).toEqual([
      "Newest competition",
      "Middle event",
      "Oldest notice",
    ]);
  });

  it("highlights a pinned notice at the top of the feed", async () => {
    mockBackend.state.notices = [
      makeNotice({
        id: 1n,
        title: "Regular notice",
        postedAt: 5_000_000_000_000_000_000n,
      }),
      makeNotice({
        id: 2n,
        title: "Pinned urgent notice",
        pinned: true,
        category: NoticeCategory.urgent,
        postedAt: 1_000_000_000_000_000_000n,
      }),
    ];

    renderWithQueryClient(<App />);

    const feed = await screen.findByTestId("home.feed.list");
    const titles = Array.from(
      feed.querySelectorAll("h3"),
      (node) => node.textContent,
    );
    expect(titles[0]).toBe("Pinned urgent notice");
    expect(screen.getAllByText("Pinned").length).toBeGreaterThan(0);
  });

  it("shows the empty state when nothing has been posted", async () => {
    renderWithQueryClient(<App />);

    expect(
      await screen.findByTestId("home.feed.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nothing posted yet")).toBeInTheDocument();
  });

  it("renders summary counts from the backend", async () => {
    mockBackend.state.summary = {
      upcomingEvents: 4n,
      newNotices: 7n,
      todaysClasses: 2n,
    };

    renderWithQueryClient(<App />);

    const summary = await screen.findByTestId("home.summary.section");
    await waitFor(() => {
      expect(within(summary).getByText("7")).toBeInTheDocument();
    });
    expect(within(summary).getByText("4")).toBeInTheDocument();
    expect(within(summary).getByText("2")).toBeInTheDocument();
  });

  it("links a feed item to its notice detail route", async () => {
    mockBackend.state.notices = [
      makeNotice({
        id: 42n,
        title: "Clickable notice",
        body: "Full notice body text",
      }),
    ];

    renderWithQueryClient(<App />);

    const link = await screen.findByRole("link", { name: /Clickable notice/ });
    expect(link).toHaveAttribute("href", "/notices/42");
  });

  it("navigates to the notices list from the empty state action", async () => {
    renderWithQueryClient(<App />);

    const browse = await screen.findByTestId("home.feed.empty_action.link");
    expect(browse).toHaveAttribute("href", "/notices");
  });
});
