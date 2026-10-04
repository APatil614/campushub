import { useAdminNav } from "@/components/Nav";
import { ClassForm } from "@/components/admin/ClassForm";
import { EventForm } from "@/components/admin/EventForm";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { SyllabusForm } from "@/components/admin/SyllabusForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminClasses,
  useAdminEvents,
  useAdminNotices,
  useAdminSyllabus,
  useDeleteClass,
  useDeleteEvent,
  useDeleteNotice,
  useDeleteSyllabus,
} from "@/hooks/useQueries";
import { formatDate, formatTimeRange } from "@/lib/format";
import {
  type ClassSlot,
  DAY_LABELS,
  EVENT_TYPE_LABELS,
  type Event,
  NOTICE_CATEGORY_LABELS,
  type Notice,
  type SyllabusEntry,
} from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  BookOpen,
  CalendarDays,
  Loader2,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  ScrollText,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** A pending delete target, discriminated by content type. */
type DeleteTarget =
  | { kind: "notice"; id: bigint; label: string }
  | { kind: "event"; id: bigint; label: string }
  | { kind: "class"; id: bigint; label: string }
  | { kind: "syllabus"; id: bigint; label: string };

const SKELETON_IDS = Array.from({ length: 4 }, (_, i) => `admin-skeleton-${i}`);

/** Shared loading placeholder for a management table. */
function TableSkeleton() {
  return (
    <div data-ocid="admin.loading_state" className="space-y-3" aria-busy="true">
      {SKELETON_IDS.map((id) => (
        <Skeleton key={id} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Shared empty state for a management table. */
function EmptyState({ message }: { message: string }) {
  return (
    <div
      data-ocid="admin.empty_state"
      className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center"
    >
      <p className="font-display text-base font-semibold text-foreground">
        Nothing here yet
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

/** Row action buttons shared by every management table. */
function RowActions({
  index,
  onEdit,
  onDelete,
}: {
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Edit"
        data-ocid={`admin.edit_button.${index}`}
        onClick={onEdit}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Delete"
        data-ocid={`admin.delete_button.${index}`}
        className="text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

/** Sign-in prompt shown to visitors who are not signed in as an admin. */
function SignInPrompt() {
  const { login, isLoggingIn } = useInternetIdentity();
  return (
    <div
      data-ocid="admin.signin_prompt"
      className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-subtle"
    >
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-foreground">
        Admin access required
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with Internet Identity to manage notices, events, classes, and
        syllabus entries. Use the sign-in control in the header.
      </p>
      <Button
        type="button"
        className="mt-5"
        disabled={isLoggingIn}
        data-ocid="admin.signin_button"
        onClick={() => login()}
      >
        {isLoggingIn ? <Loader2 className="size-4 animate-spin" /> : null}
        {isLoggingIn ? "Signing in…" : "Sign in"}
      </Button>
    </div>
  );
}

/** Protected admin management area with a tab per content type. */
export default function AdminPage() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminNav();

  const noticesQuery = useAdminNotices();
  const eventsQuery = useAdminEvents();
  const classesQuery = useAdminClasses();
  const syllabusQuery = useAdminSyllabus();

  const deleteNotice = useDeleteNotice();
  const deleteEvent = useDeleteEvent();
  const deleteClass = useDeleteClass();
  const deleteSyllabus = useDeleteSyllabus();

  const [noticeFormOpen, setNoticeFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSlot | null>(null);
  const [syllabusFormOpen, setSyllabusFormOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusEntry | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const isDeleting =
    deleteNotice.isPending ||
    deleteEvent.isPending ||
    deleteClass.isPending ||
    deleteSyllabus.isPending;

  // Session still resolving — show a neutral loading state.
  if (isInitializing || (isAuthenticated && isCheckingAdmin)) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="space-y-4"
        aria-busy="true"
      >
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-10 w-full max-w-md" />
        <TableSkeleton />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <SignInPrompt />;
  }

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const onSuccess = () => {
      toast.success("Deleted");
      setDeleteTarget(null);
    };
    const onError = (cause: unknown) => {
      toast.error(
        cause instanceof Error ? cause.message : "Could not delete the item.",
      );
    };
    switch (deleteTarget.kind) {
      case "notice":
        deleteNotice.mutate(deleteTarget.id, { onSuccess, onError });
        break;
      case "event":
        deleteEvent.mutate(deleteTarget.id, { onSuccess, onError });
        break;
      case "class":
        deleteClass.mutate(deleteTarget.id, { onSuccess, onError });
        break;
      case "syllabus":
        deleteSyllabus.mutate(deleteTarget.id, { onSuccess, onError });
        break;
    }
  };

  const notices = noticesQuery.data ?? [];
  const events = eventsQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const syllabus = syllabusQuery.data ?? [];

  return (
    <div data-ocid="admin.page" className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Management
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Publish and maintain everything students see — notices, events,
          classes, and syllabus entries.
        </p>
      </header>

      <Tabs defaultValue="notices" data-ocid="admin.tabs">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1">
          <TabsTrigger value="notices" data-ocid="admin.tab.notices">
            <Megaphone className="size-4" />
            Notices
          </TabsTrigger>
          <TabsTrigger value="events" data-ocid="admin.tab.events">
            <CalendarDays className="size-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="classes" data-ocid="admin.tab.classes">
            <BookOpen className="size-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="syllabus" data-ocid="admin.tab.syllabus">
            <ScrollText className="size-4" />
            Syllabus
          </TabsTrigger>
        </TabsList>

        {/* Notices */}
        <TabsContent value="notices" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {notices.length} {notices.length === 1 ? "notice" : "notices"}
            </p>
            <Button
              type="button"
              data-ocid="admin.notices.add_button"
              onClick={() => {
                setEditingNotice(null);
                setNoticeFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              New notice
            </Button>
          </div>

          {noticesQuery.isLoading ? (
            <TableSkeleton />
          ) : notices.length === 0 ? (
            <EmptyState message="Publish your first notice to reach students on the home feed." />
          ) : (
            <ul data-ocid="admin.notices.list" className="space-y-3">
              {notices.map((notice, index) => (
                <li
                  key={notice.id.toString()}
                  data-ocid={`admin.notice.item.${index + 1}`}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
                          <Pin className="size-3" />
                          Pinned
                        </span>
                      ) : null}
                      <Badge variant="outline" className="rounded-full">
                        {NOTICE_CATEGORY_LABELS[notice.category]}
                      </Badge>
                    </div>
                    <p className="mt-1.5 truncate font-display text-base font-semibold text-foreground">
                      {notice.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {notice.body}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {formatDate(notice.postedAt)}
                    </p>
                  </div>
                  <RowActions
                    index={index + 1}
                    onEdit={() => {
                      setEditingNotice(notice);
                      setNoticeFormOpen(true);
                    }}
                    onDelete={() =>
                      setDeleteTarget({
                        kind: "notice",
                        id: notice.id,
                        label: notice.title,
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* Events */}
        <TabsContent value="events" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {events.length} {events.length === 1 ? "event" : "events"}
            </p>
            <Button
              type="button"
              data-ocid="admin.events.add_button"
              onClick={() => {
                setEditingEvent(null);
                setEventFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              New event
            </Button>
          </div>

          {eventsQuery.isLoading ? (
            <TableSkeleton />
          ) : events.length === 0 ? (
            <EmptyState message="Add an event or competition so students can plan ahead." />
          ) : (
            <ul data-ocid="admin.events.list" className="space-y-3">
              {events.map((event, index) => (
                <li
                  key={event.id.toString()}
                  data-ocid={`admin.event.item.${index + 1}`}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="rounded-full">
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </Badge>
                    <p className="mt-1.5 truncate font-display text-base font-semibold text-foreground">
                      {event.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {formatDate(event.startAt)} · {event.venue}
                    </p>
                  </div>
                  <RowActions
                    index={index + 1}
                    onEdit={() => {
                      setEditingEvent(event);
                      setEventFormOpen(true);
                    }}
                    onDelete={() =>
                      setDeleteTarget({
                        kind: "event",
                        id: event.id,
                        label: event.title,
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* Classes */}
        <TabsContent value="classes" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {classes.length} {classes.length === 1 ? "class" : "classes"}
            </p>
            <Button
              type="button"
              data-ocid="admin.classes.add_button"
              onClick={() => {
                setEditingClass(null);
                setClassFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              New class
            </Button>
          </div>

          {classesQuery.isLoading ? (
            <TableSkeleton />
          ) : classes.length === 0 ? (
            <EmptyState message="Add class slots to build the weekly timetable." />
          ) : (
            <ul data-ocid="admin.classes.list" className="space-y-3">
              {classes.map((slot, index) => (
                <li
                  key={slot.id.toString()}
                  data-ocid={`admin.class.item.${index + 1}`}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold text-foreground">
                      {slot.subject}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {DAY_LABELS[slot.dayOfWeek]} ·{" "}
                      {formatTimeRange(slot.startTime, slot.endTime)} ·{" "}
                      {slot.room}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {slot.instructor}
                    </p>
                  </div>
                  <RowActions
                    index={index + 1}
                    onEdit={() => {
                      setEditingClass(slot);
                      setClassFormOpen(true);
                    }}
                    onDelete={() =>
                      setDeleteTarget({
                        kind: "class",
                        id: slot.id,
                        label: slot.subject,
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* Syllabus */}
        <TabsContent value="syllabus" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {syllabus.length} {syllabus.length === 1 ? "entry" : "entries"}
            </p>
            <Button
              type="button"
              data-ocid="admin.syllabus.add_button"
              onClick={() => {
                setEditingSyllabus(null);
                setSyllabusFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              New entry
            </Button>
          </div>

          {syllabusQuery.isLoading ? (
            <TableSkeleton />
          ) : syllabus.length === 0 ? (
            <EmptyState message="Add a subject outline with its topics and materials." />
          ) : (
            <ul data-ocid="admin.syllabus.list" className="space-y-3">
              {syllabus.map((entry, index) => (
                <li
                  key={entry.id.toString()}
                  data-ocid={`admin.syllabus.item.${index + 1}`}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-semibold text-foreground">
                      {entry.subject}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.topics.length}{" "}
                      {entry.topics.length === 1 ? "topic" : "topics"}
                      {entry.materialLink ? " · Material linked" : ""}
                    </p>
                  </div>
                  <RowActions
                    index={index + 1}
                    onEdit={() => {
                      setEditingSyllabus(entry);
                      setSyllabusFormOpen(true);
                    }}
                    onDelete={() =>
                      setDeleteTarget({
                        kind: "syllabus",
                        id: entry.id,
                        label: entry.subject,
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {/* Create / edit dialogs */}
      <NoticeForm
        open={noticeFormOpen}
        onOpenChange={setNoticeFormOpen}
        notice={editingNotice}
      />
      <EventForm
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        event={editingEvent}
      />
      <ClassForm
        open={classFormOpen}
        onOpenChange={setClassFormOpen}
        classSlot={editingClass}
      />
      <SyllabusForm
        open={syllabusFormOpen}
        onOpenChange={setSyllabusFormOpen}
        entry={editingSyllabus}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="admin.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.label}" will be permanently removed. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.delete_cancel_button"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete_confirm_button"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
