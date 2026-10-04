import App from "@/App";
import { router } from "@/App";
import { makeEvent } from "@/test/mockBackend";
import { mockBackend, mockIdentity, resetMockState } from "@/test/mockState";
import { navigateTo, renderWithQueryClient } from "@/test/render";
import { EventTimeFilter, EventType } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const NOW = BigInt(Date.now()) * 1_000_000n;
const DAY = 86_400_000_000_000n;

const SEED = [
  makeEvent({
    id: 1n,
    title: "Robotics competition",
    description: "Build a robot and compete.",
    eventType: EventType.competition,
    startAt: NOW + DAY,
  }),
  makeEvent({
    id: 2n,
    title: "Career workshop",
    description: "CV and interview skills.",
    eventType: EventType.workshop,
    startAt: NOW + 2n * DAY,
  }),
  makeEvent({
    id: 3n,
    title: "Last year's gala",
    description: "A past celebration.",
    eventType: EventType.event,
    startAt: NOW - 10n * DAY,
  }),
];

describe("EventsPage", () => {
  beforeEach(async () => {
    resetMockState();
    mockBackend.state.events = SEED.map((event) => ({ ...event }));
    await navigateTo("/events");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("lists upcoming events by default and hides past ones", async () => {
    renderWithQueryClient(<App />);

    const list = await screen.findByTestId("events.list");
    const titles = Array.from(
      list.querySelectorAll("h3"),
      (node) => node.textContent,
    );
    expect(titles).toContain("Robotics competition");
    expect(titles).toContain("Career workshop");
    expect(titles).not.toContain("Last year's gala");
  });

  it("filters by type and reflects it in the URL", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    await screen.findByTestId("events.list");
    await user.click(screen.getByTestId("events.type.competition"));

    await waitFor(() => {
      const list = screen.getByTestId("events.list");
      const titles = Array.from(
        list.querySelectorAll("h3"),
        (node) => node.textContent,
      );
      expect(titles).toEqual(["Robotics competition"]);
    });
    expect(router.state.location.search).toMatchObject({
      type: EventType.competition,
    });
  });

  it("switches to past events and reflects it in the URL", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    await screen.findByTestId("events.list");
    await user.click(screen.getByTestId("events.time.past"));

    await waitFor(() => {
      const list = screen.getByTestId("events.list");
      const titles = Array.from(
        list.querySelectorAll("h3"),
        (node) => node.textContent,
      );
      expect(titles).toEqual(["Last year's gala"]);
    });
    expect(router.state.location.search).toMatchObject({
      time: EventTimeFilter.past,
    });
  });

  it("returns the matching event when searching a keyword", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    await screen.findByTestId("events.list");
    await user.type(screen.getByTestId("events.search_input"), "robotics");
    await user.click(screen.getByTestId("events.search_button"));

    await waitFor(() => {
      const list = screen.getByTestId("events.list");
      const titles = Array.from(
        list.querySelectorAll("h3"),
        (node) => node.textContent,
      );
      expect(titles).toEqual(["Robotics competition"]);
    });
    expect(router.state.location.search).toMatchObject({ q: "robotics" });
  });

  it("links each event row to its detail route", async () => {
    renderWithQueryClient(<App />);

    const list = await screen.findByTestId("events.list");
    const link = list.querySelector('a[href="/events/1"]');
    expect(link).not.toBeNull();
  });
});
