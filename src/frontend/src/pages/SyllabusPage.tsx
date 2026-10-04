import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import type { SyllabusEntry } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Link2,
  Paperclip,
  ScrollText,
} from "lucide-react";

/** Deterministic skeleton ids so list keys never fall back to the array index. */
const SKELETON_IDS = Array.from(
  { length: 4 },
  (_, i) => `syllabus-skeleton-${i}`,
);

/** One subject card: topics preview plus material and attachment counts. */
function SubjectCard({
  entry,
  index,
}: { entry: SyllabusEntry; index: number }) {
  const topicCount = entry.topics.length;
  const attachmentCount = entry.attachments.length;

  return (
    <li data-ocid={`syllabus.item.${index + 1}`}>
      <Link
        to="/syllabus/$subject"
        params={{ subject: entry.subject }}
        data-ocid={`syllabus.link.${index + 1}`}
        className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-smooth hover:border-primary/40 hover:shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <h2 className="truncate font-display text-lg font-semibold text-foreground">
              {entry.subject}
            </h2>
          </div>
          <ArrowRight
            className="size-4 shrink-0 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>

        {topicCount > 0 ? (
          <ul className="mt-4 space-y-1.5">
            {entry.topics.slice(0, 3).map((topic) => (
              <li
                key={topic.title}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">{topic.title}</span>
              </li>
            ))}
            {topicCount > 3 ? (
              <li className="pl-3.5 text-xs text-muted-foreground">
                +{topicCount - 3} more{" "}
                {topicCount - 3 === 1 ? "topic" : "topics"}
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No topics listed yet.
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Badge variant="secondary" className="font-mono">
            {topicCount} {topicCount === 1 ? "topic" : "topics"}
          </Badge>
          {entry.materialLink ? (
            <Badge variant="outline" className="gap-1">
              <Link2 className="size-3" aria-hidden="true" />
              Material
            </Badge>
          ) : null}
          {attachmentCount > 0 ? (
            <Badge variant="outline" className="gap-1">
              <Paperclip className="size-3" aria-hidden="true" />
              {attachmentCount}
            </Badge>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

/** Syllabus reference list: every subject with its topics and materials. */
export function SyllabusPage() {
  const { actor, isFetching } = useBackend();

  const { data, isLoading } = useQuery({
    queryKey: ["syllabus"],
    queryFn: async (): Promise<SyllabusEntry[]> => {
      if (!actor) return [];
      return api.listSyllabus(actor);
    },
    enabled: !!actor && !isFetching,
  });

  const entries = data ?? [];

  return (
    <div data-ocid="syllabus.page" className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <ScrollText className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Reference
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Syllabus
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse every subject's topics and units, with linked material and
          attachments. Open a subject for the full outline and class schedule.
        </p>
      </header>

      {isLoading ? (
        <ul
          data-ocid="syllabus.loading_state"
          className="grid gap-4 sm:grid-cols-2"
          aria-busy="true"
          aria-live="polite"
        >
          {SKELETON_IDS.map((id) => (
            <li key={id}>
              <Skeleton className="h-52 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      ) : entries.length === 0 ? (
        <div
          data-ocid="syllabus.empty_state"
          className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center"
        >
          <p className="font-display text-base font-semibold text-foreground">
            No syllabus entries yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Syllabus topics will appear here once subjects are published.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry, index) => (
            <SubjectCard
              key={entry.id.toString()}
              entry={entry}
              index={index}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
