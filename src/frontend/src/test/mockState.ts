import { createMockBackend } from "@/test/mockBackend";
import { vi } from "vitest";

/**
 * Shared, mutable mock state for the frontend suite.
 *
 * `vi.mock` factories are hoisted above imports, so they cannot close over a
 * per-test variable. They can, however, read a module-level object — this one —
 * which each test file imports and mutates in `beforeEach`. That keeps the
 * actor and identity mocks identical across files without repeating the
 * factory bodies.
 */
export const mockBackend = createMockBackend();

/** Identity context returned by the mocked `useInternetIdentity`. */
export interface MockIdentity {
  identity: undefined;
  login: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  loginStatus: string;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  isSessionExpired: boolean;
  isAuthenticated: boolean;
}

/** Build a fresh identity context; tests override `isAuthenticated`. */
export function makeIdentity(
  overrides: Partial<MockIdentity> = {},
): MockIdentity {
  return {
    identity: undefined,
    login: vi.fn(),
    clear: vi.fn(),
    loginStatus: "idle",
    isInitializing: false,
    isLoginIdle: true,
    isLoggingIn: false,
    isLoginSuccess: false,
    isLoginError: false,
    isSessionExpired: false,
    isAuthenticated: false,
    ...overrides,
  };
}

/** The identity context the mocked hook currently returns. */
export const mockIdentity: { current: MockIdentity } = {
  current: makeIdentity(),
};

/** Reset the backend store and identity to a clean, signed-out state. */
export function resetMockState(): void {
  mockBackend.state.notices = [];
  mockBackend.state.events = [];
  mockBackend.state.classes = [];
  mockBackend.state.syllabus = [];
  mockBackend.state.isAdmin = false;
  mockBackend.state.summary = {
    upcomingEvents: 0n,
    newNotices: 0n,
    todaysClasses: 0n,
  };
  mockIdentity.current = makeIdentity();
}
