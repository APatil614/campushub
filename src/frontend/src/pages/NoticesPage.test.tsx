import App from "@/App";
import { router } from "@/App";
import { makeNotice } from "@/test/mockBackend";
import { mockBackend, mockIdentity, resetMockState } from "@/test/mockState";
import { navigateTo, renderWithQueryClient, resetRouter } from "@/test/render";
import { NoticeCategory, NoticeSort } from "@/types";
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
  makeNotice({
    id: 1n,
    title: "Exam timetable released",
    body: "The final exam timetable is now available.",
    category: NoticeCategory.exam,
    postedAt: 3_000_000_000_000_000_000n,
  }),
  makeNotice({
    id: 2n,
    title: "Library closed for maintenance",
    body: "The main library will be closed this weekend.",
    category: NoticeCategory.general,
    postedAt: 2_000_000_000_000_000_000n,
  }),
  makeNotice({
    id: 3n,
    title: "Tuition fee deadline",
    body: "Pay your tuition fees before the end of the month.",
    category: NoticeCategory.fee,
    postedAt: 1_000_000_000_000_000_000n,
  }),
];

describe("NoticesPage", () => {
  beforeEach(async () => {
    resetMockState();
    mockBackend.state.notices = SEED.map((notice) => ({ ...notice }));
    await navigateTo("/notices");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("lists every seeded notice newest first by default", async () => {
    renderWithQueryClient(<App />);

    const list = await screen.findByTestId("notices.list");
    const titles = Array.from(
      list.querySelectorAll("h3"),
      (node) => node.textContent,
    );
    expect(titles).toEqual([
      "Exam timetable released",
      "Library closed for maintenance",
      "Tuition fee deadline",
    ]);
  });

  it("returns the matching notice when searching a seeded keyword", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    await screen.findByTestId("notices.list");
    await user.type(screen.getByTestId("notices.search_input"), "library");
    await user.click(screen.getByTestId("notices.search_button"));

    await waitFor(() => {
      const list = screen.getByTestId("notices.list");
      const titles = Array.from(
        list.querySelectorAll("h3"),
        (node) => node.textContent,
      );
      expect(titles).toEqual(["Library closed for maintenance"]);
    });
    expect(router.state.location.search).toMatchObject({ search: "library" });
  });

  it("narrows the list by category and reflects the filter in the URL", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    await screen.findByTestId("notices.list");
    await user.click(screen.getByTestId("notices.filter.exam"));

    await waitFor(() => {
      const list = screen.getByTestId("notices.list");
      const titles = Array.from(
        list.querySelectorAll("h3"),
        (node) => node.textContent,
      );
      expect(titles).toEqual(["Exam timetable released"]);
    });
    expect(router.state.location.search).toMatchObject({
      category: NoticeCategory.exam,
    });
  });

  it("toggles sort order and reflects it in the URL", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    await screen.findByTestId("notices.list");
    await user.click(screen.getByTestId("notices.sort_toggle"));

    await waitFor(() => {
      const list = screen.getByTestId("notices.list");
      const titles = Array.from(
        list.querySelectorAll("h3"),
        (node) => node.textContent,
      );
      expect(titles[0]).toBe("Tuition fee deadline");
    });
    expect(router.state.location.search).toMatchObject({
      sort: NoticeSort.oldest,
    });
  });

  it("shows an empty state when a search matches nothing", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<App />);

    await screen.findByTestId("notices.list");
    await user.type(screen.getByTestId("notices.search_input"), "zzz-no-match");
    await user.click(screen.getByTestId("notices.search_button"));

    expect(
      await screen.findByTestId("notices.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("No notices found")).toBeInTheDocument();
  });

  it("opens a notice detail view from a list row", async () => {
    renderWithQueryClient(<App />);

    const list = await screen.findByTestId("notices.list");
    const link = within(list).getByRole("link", {
      name: /Exam timetable released/,
    });
    expect(link).toHaveAttribute("href", "/notices/1");
  });
});
