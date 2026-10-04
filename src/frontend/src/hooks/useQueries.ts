import type { ClassInput } from "@/backend";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import type {
  ClassSlot,
  Event,
  EventInput,
  Notice,
  NoticeInput,
  SyllabusEntry,
  SyllabusInput,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Shared React Query hooks for the admin management area.
 *
 * Reads mirror the query keys used by the public pages so a successful
 * mutation can invalidate every affected list, the home feed, and the
 * summary counts in one place.
 */

/** Query key prefixes owned by the public content lists. */
const NOTICES_KEY = ["notices"] as const;
const EVENTS_KEY = ["events"] as const;
const CLASSES_KEY = ["classes"] as const;
const SYLLABUS_KEY = ["syllabus"] as const;
const HOME_FEED_KEY = ["homeFeed"] as const;
const SUMMARY_KEY = ["summaryCounts"] as const;

/** Invalidate every list, feed, and count affected by a content mutation. */
function useInvalidateContent() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: NOTICES_KEY });
    void queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
    void queryClient.invalidateQueries({ queryKey: CLASSES_KEY });
    void queryClient.invalidateQueries({ queryKey: SYLLABUS_KEY });
    void queryClient.invalidateQueries({ queryKey: HOME_FEED_KEY });
    void queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** All notices, newest first, for the admin notices table. */
export function useAdminNotices() {
  const { actor, isFetching } = useBackend();
  return useQuery<Notice[]>({
    queryKey: [...NOTICES_KEY, "admin"],
    queryFn: async () => {
      if (!actor) return [];
      return api.listNotices(actor, {});
    },
    enabled: !!actor && !isFetching,
  });
}

/** All events, for the admin events table. */
export function useAdminEvents() {
  const { actor, isFetching } = useBackend();
  return useQuery<Event[]>({
    queryKey: [...EVENTS_KEY, "admin"],
    queryFn: async () => {
      if (!actor) return [];
      return api.listEvents(actor, {});
    },
    enabled: !!actor && !isFetching,
  });
}

/** All class slots, for the admin classes table. */
export function useAdminClasses() {
  const { actor, isFetching } = useBackend();
  return useQuery<ClassSlot[]>({
    queryKey: [...CLASSES_KEY, "admin"],
    queryFn: async () => {
      if (!actor) return [];
      return api.listClasses(actor, null);
    },
    enabled: !!actor && !isFetching,
  });
}

/** All syllabus entries, for the admin syllabus table. */
export function useAdminSyllabus() {
  const { actor, isFetching } = useBackend();
  return useQuery<SyllabusEntry[]>({
    queryKey: [...SYLLABUS_KEY, "admin"],
    queryFn: async () => {
      if (!actor) return [];
      return api.listSyllabus(actor);
    },
    enabled: !!actor && !isFetching,
  });
}

// ---------------------------------------------------------------------------
// Notices
// ---------------------------------------------------------------------------

export function useCreateNotice() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (input: NoticeInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.createNotice(actor, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateNotice() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (vars: { id: bigint; input: NoticeInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.updateNotice(actor, vars.id, vars.input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteNotice() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.deleteNotice(actor, id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function useCreateEvent() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (input: EventInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.createEvent(actor, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateEvent() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (vars: { id: bigint; input: EventInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.updateEvent(actor, vars.id, vars.input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.deleteEvent(actor, id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export function useCreateClass() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (input: ClassInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.createClass(actor, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateClass() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (vars: { id: bigint; input: ClassInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.updateClass(actor, vars.id, vars.input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteClass() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.deleteClass(actor, id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

// ---------------------------------------------------------------------------
// Syllabus
// ---------------------------------------------------------------------------

export function useCreateSyllabus() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (input: SyllabusInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.createSyllabus(actor, input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateSyllabus() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (vars: { id: bigint; input: SyllabusInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.updateSyllabus(actor, vars.id, vars.input);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteSyllabus() {
  const { actor } = useBackend();
  const invalidate = useInvalidateContent();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return api.deleteSyllabus(actor, id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}
