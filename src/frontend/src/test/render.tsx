import { router } from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Render a React element inside a fresh React Query client.
 *
 * A new client per render keeps query caches isolated between tests. Retries
 * are disabled so a rejected query surfaces immediately instead of after the
 * default backoff.
 */
export function renderWithQueryClient(ui: ReactElement): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

/**
 * Navigate the app's real router to a route before rendering.
 *
 * The app exports a single router instance; tests drive it to the route under
 * test and then render `<App />`, so the real route tree, search-param
 * validation, and navigation behavior are all exercised.
 */
export async function navigateTo(
  to: string,
  search: Record<string, unknown> = {},
  params: Record<string, string> = {},
): Promise<void> {
  await router.navigate({ to, search, params } as never);
}

/** Reset the router to the home route between tests. */
export async function resetRouter(): Promise<void> {
  await router.navigate({ to: "/", search: {} } as never);
}
