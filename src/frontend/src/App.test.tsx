import App from "@/App";
import { mockBackend, mockIdentity, resetMockState } from "@/test/mockState";
import { renderWithQueryClient, resetRouter } from "@/test/render";
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

describe("App shell", () => {
  beforeEach(async () => {
    resetMockState();
    await resetRouter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the default route without a blank screen", async () => {
    const { container } = renderWithQueryClient(<App />);

    expect(
      await screen.findByRole("heading", { name: "Latest Updates" }),
    ).toBeInTheDocument();
    // The shell (brand + primary nav) is present, not an empty root.
    expect(screen.getAllByTestId("nav.brand.link").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("navigation", { name: "Primary" }).length,
    ).toBeGreaterThan(0);
    expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it("renders the primary navigation destinations", async () => {
    renderWithQueryClient(<App />);

    await screen.findByRole("heading", { name: "Latest Updates" });
    expect(
      screen.getAllByRole("navigation", { name: "Primary" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByTestId("nav.home.link").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("nav.notices.link").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("nav.events.link").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("nav.classes.link").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("nav.syllabus.link").length).toBeGreaterThan(
      0,
    );
  });
});
