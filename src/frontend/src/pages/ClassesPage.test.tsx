import App from "@/App";
import { makeClass } from "@/test/mockBackend";
import { mockBackend, mockIdentity, resetMockState } from "@/test/mockState";
import { navigateTo, renderWithQueryClient } from "@/test/render";
import { DayOfWeek } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
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

const SEED = [
  makeClass({
    id: 1n,
    subject: "Mathematics",
    dayOfWeek: DayOfWeek.monday,
    startTime: "09:00",
    endTime: "10:00",
    room: "Room 101",
    instructor: "Dr. Ada",
  }),
  makeClass({
    id: 2n,
    subject: "Physics",
    dayOfWeek: DayOfWeek.monday,
    startTime: "11:00",
    endTime: "12:00",
    room: "Lab 2",
    instructor: "Dr. Curie",
  }),
  makeClass({
    id: 3n,
    subject: "Chemistry",
    dayOfWeek: DayOfWeek.wednesday,
    startTime: "14:00",
    endTime: "15:00",
    room: "Lab 5",
    instructor: "Dr. Bohr",
  }),
];

describe("ClassesPage", () => {
  beforeEach(async () => {
    resetMockState();
    mockBackend.state.classes = SEED.map((slot) => ({ ...slot }));
    await navigateTo("/classes");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("groups classes by weekday with subject, time, and room", async () => {
    renderWithQueryClient(<App />);

    const monday = await screen.findByTestId("classes.day.monday");
    expect(within(monday).getByText("Mathematics")).toBeInTheDocument();
    expect(within(monday).getByText("9:00 AM – 10:00 AM")).toBeInTheDocument();
    expect(within(monday).getByText("Room 101")).toBeInTheDocument();
    expect(within(monday).getByText("Dr. Ada")).toBeInTheDocument();

    const wednesday = screen.getByTestId("classes.day.wednesday");
    expect(within(wednesday).getByText("Chemistry")).toBeInTheDocument();
    expect(within(wednesday).getByText("Lab 5")).toBeInTheDocument();
  });

  it("orders Monday before Wednesday", async () => {
    renderWithQueryClient(<App />);

    await screen.findByTestId("classes.day.monday");
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((node) => node.textContent);
    expect(headings.indexOf("Monday")).toBeLessThan(
      headings.indexOf("Wednesday"),
    );
  });

  it("filters the timetable to a single day", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    await screen.findByTestId("classes.day.monday");
    await user.click(screen.getByTestId("classes.filter.wednesday"));

    await waitFor(() => {
      expect(
        screen.queryByTestId("classes.day.monday"),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("classes.day.wednesday")).toBeInTheDocument();
  });

  it("shows an empty state when the timetable has no classes", async () => {
    mockBackend.state.classes = [];
    renderWithQueryClient(<App />);

    expect(
      await screen.findByTestId("classes.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Nothing on the timetable")).toBeInTheDocument();
  });
});
