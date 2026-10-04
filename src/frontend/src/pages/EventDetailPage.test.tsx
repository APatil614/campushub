import App from "@/App";
import { makeEvent } from "@/test/mockBackend";
import { mockBackend, mockIdentity, resetMockState } from "@/test/mockState";
import { navigateTo, renderWithQueryClient } from "@/test/render";
import { EventType } from "@/types";
import { screen } from "@testing-library/react";
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

describe("EventDetailPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the full event details for a seeded id", async () => {
    mockBackend.state.events = [
      makeEvent({
        id: 5n,
        title: "Annual science fair",
        description: "Showcase your science project.",
        venue: "Science Block",
        organiser: "Physics Society",
        eventType: EventType.competition,
        startAt: BigInt(Date.now() + 86_400_000) * 1_000_000n,
      }),
    ];
    await navigateTo("/events/$id", {}, { id: "5" });

    renderWithQueryClient(<App />);

    expect(
      await screen.findByRole("heading", { name: "Annual science fair" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Showcase your science project."),
    ).toBeInTheDocument();
    expect(screen.getByText("Science Block")).toBeInTheDocument();
    expect(screen.getByText("Physics Society")).toBeInTheDocument();
    expect(screen.getByText("Competition")).toBeInTheDocument();
    expect(screen.getByTestId("event_detail.back_button")).toHaveAttribute(
      "href",
      "/events",
    );
  });

  it("shows a not-found state for an unknown id", async () => {
    await navigateTo("/events/$id", {}, { id: "999" });

    renderWithQueryClient(<App />);

    expect(
      await screen.findByTestId("event_detail.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Event not found")).toBeInTheDocument();
  });
});
