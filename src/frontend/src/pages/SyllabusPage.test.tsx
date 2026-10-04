import App from "@/App";
import { makeClass, makeSyllabus } from "@/test/mockBackend";
import { mockBackend, mockIdentity, resetMockState } from "@/test/mockState";
import { navigateTo, renderWithQueryClient } from "@/test/render";
import { DayOfWeek } from "@/types";
import { screen, within } from "@testing-library/react";
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

describe("SyllabusPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("lists subjects with their topic counts", async () => {
    mockBackend.state.syllabus = [
      makeSyllabus({
        id: 1n,
        subject: "Mathematics",
        topics: [
          { title: "Algebra", description: "Linear equations" },
          { title: "Calculus", description: "Derivatives" },
        ],
      }),
    ];
    await navigateTo("/syllabus");

    renderWithQueryClient(<App />);

    const item = await screen.findByTestId("syllabus.item.1");
    expect(within(item).getByText("Mathematics")).toBeInTheDocument();
    expect(within(item).getByText("Algebra")).toBeInTheDocument();
    expect(within(item).getByText("2 topics")).toBeInTheDocument();
  });

  it("shows an empty state when no syllabus entries exist", async () => {
    await navigateTo("/syllabus");

    renderWithQueryClient(<App />);

    expect(
      await screen.findByTestId("syllabus.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("No syllabus entries yet")).toBeInTheDocument();
  });
});

describe("SubjectDetailPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the syllabus outline and class schedule for a subject", async () => {
    mockBackend.state.syllabus = [
      makeSyllabus({
        id: 1n,
        subject: "Mathematics",
        topics: [
          { title: "Algebra", description: "Linear equations" },
          { title: "Calculus", description: "Derivatives" },
        ],
      }),
    ];
    mockBackend.state.classes = [
      makeClass({
        id: 1n,
        subject: "Mathematics",
        dayOfWeek: DayOfWeek.tuesday,
        startTime: "10:00",
        endTime: "11:00",
        room: "Room 202",
        instructor: "Dr. Ada",
      }),
    ];
    await navigateTo("/syllabus/$subject", {}, { subject: "Mathematics" });

    renderWithQueryClient(<App />);

    expect(
      await screen.findByRole("heading", { name: "Mathematics" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Algebra")).toBeInTheDocument();
    expect(screen.getByText("Calculus")).toBeInTheDocument();

    const tuesday = screen.getByTestId("classes.day.tuesday");
    expect(within(tuesday).getByText("Room 202")).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown subject", async () => {
    await navigateTo("/syllabus/$subject", {}, { subject: "Astrology" });

    renderWithQueryClient(<App />);

    expect(
      await screen.findByTestId("subject.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Subject not found")).toBeInTheDocument();
  });
});
