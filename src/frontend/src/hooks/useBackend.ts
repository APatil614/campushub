import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Shared access to the generated backend actor.
 *
 * Call this at the top level of a hook or component — never inside a query or
 * mutation callback. `actor` is null until the bindings are ready; gate queries
 * on `enabled: !!actor && !isFetching`.
 */
export function useBackend() {
  return useActor(createActor);
}
