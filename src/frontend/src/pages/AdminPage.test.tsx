import App from "@/App";
import { makeNotice } from "@/test/mockBackend";
import {
  makeIdentity,
  mockBackend,
  mockIdentity,
  resetMockState,
} from "@/test/mockState";
import { navigateTo, renderWithQueryClient } from "@/test/render";
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

describe("AdminPage access control", () => {
  beforeEach(async () => {
    resetMockState();
    await navigateTo("/admin");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the sign-in prompt and no management UI when signed out", async () => {
    mockIdentity.current = makeIdentity({ isAuthenticated: false });

    renderWithQueryClient(<App />);

    expect(
      await screen.findByTestId("admin.signin_prompt"),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin access required")).toBeInTheDocument();
    expect(screen.queryByTestId("admin.page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("admin.tabs")).not.toBeInTheDocument();
  });

  it("shows the sign-in prompt when signed in but not an admin", async () => {
    mockIdentity.current = makeIdentity({ isAuthenticated: true });
    mockBackend.state.isAdmin = false;

    renderWithQueryClient(<App />);

    expect(
      await screen.findByTestId("admin.signin_prompt"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("admin.page")).not.toBeInTheDocument();
  });

  it("shows the management area for a signed-in admin", async () => {
    mockIdentity.current = makeIdentity({ isAuthenticated: true });
    mockBackend.state.isAdmin = true;
    mockBackend.state.notices = [
      makeNotice({ id: 1n, title: "Managed notice" }),
    ];

    renderWithQueryClient(<App />);

    expect(await screen.findByTestId("admin.page")).toBeInTheDocument();
    expect(screen.getByTestId("admin.tabs")).toBeInTheDocument();
    expect(await screen.findByText("Managed notice")).toBeInTheDocument();
    expect(screen.getByTestId("admin.notices.add_button")).toBeInTheDocument();
  });

  it("creates a notice through the admin form and lists it", async () => {
    const user = userEvent.setup();
    mockIdentity.current = makeIdentity({ isAuthenticated: true });
    mockBackend.state.isAdmin = true;

    renderWithQueryClient(<App />);

    await screen.findByTestId("admin.page");
    await user.click(screen.getByTestId("admin.notices.add_button"));

    const dialog = await screen.findByTestId("notice_form.dialog");
    await user.type(
      within(dialog).getByTestId("notice_form.title_input"),
      "New admin notice",
    );
    await user.type(
      within(dialog).getByTestId("notice_form.body_textarea"),
      "Published from the admin area.",
    );
    await user.click(within(dialog).getByTestId("notice_form.submit_button"));

    await waitFor(() => {
      expect(screen.getByText("New admin notice")).toBeInTheDocument();
    });
    expect(mockBackend.state.notices).toHaveLength(1);
    expect(mockBackend.state.notices[0]).toMatchObject({
      title: "New admin notice",
    });
  });

  it("deletes a notice through the confirmation dialog", async () => {
    const user = userEvent.setup();
    mockIdentity.current = makeIdentity({ isAuthenticated: true });
    mockBackend.state.isAdmin = true;
    mockBackend.state.notices = [
      makeNotice({ id: 1n, title: "Doomed notice" }),
    ];

    renderWithQueryClient(<App />);

    await screen.findByText("Doomed notice");
    await user.click(screen.getByTestId("admin.delete_button.1"));

    const dialog = await screen.findByTestId("admin.delete_dialog");
    await user.click(within(dialog).getByTestId("admin.delete_confirm_button"));

    await waitFor(() => {
      expect(screen.queryByText("Doomed notice")).not.toBeInTheDocument();
    });
    expect(mockBackend.state.notices).toHaveLength(0);
  });
});
