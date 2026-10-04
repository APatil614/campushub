import App from "@/App";
import { makeNotice } from "@/test/mockBackend";
import { mockBackend, mockIdentity, resetMockState } from "@/test/mockState";
import { navigateTo, renderWithQueryClient } from "@/test/render";
import { NoticeCategory } from "@/types";
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

describe("NoticeDetailPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the full notice content for a seeded id", async () => {
    mockBackend.state.notices = [
      makeNotice({
        id: 7n,
        title: "Scholarship applications open",
        body: "Applications close at the end of the month.",
        category: NoticeCategory.academic,
        pinned: true,
      }),
    ];
    await navigateTo("/notices/$id", {}, { id: "7" });

    renderWithQueryClient(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "Scholarship applications open",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Applications close at the end of the month."),
    ).toBeInTheDocument();
    expect(screen.getByText("Academic")).toBeInTheDocument();
    expect(screen.getByText("Pinned")).toBeInTheDocument();
    expect(screen.getByTestId("notice.back_link")).toHaveAttribute(
      "href",
      "/notices",
    );
  });

  it("shows a not-found state for an unknown id", async () => {
    await navigateTo("/notices/$id", {}, { id: "999" });

    renderWithQueryClient(<App />);

    expect(await screen.findByTestId("notice.empty_state")).toBeInTheDocument();
    expect(screen.getByText("Notice not found")).toBeInTheDocument();
  });
});
