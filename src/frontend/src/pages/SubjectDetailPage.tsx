import { TimetableGrid } from "@/components/TimetableGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import type { SubjectDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  Paperclip,
} from "lucide-react";

/** Deterministic skeleton ids so list keys never fall back to the array index. */
const SKELETON_IDS = Array.from(
  { length: 3 },
  (_, i) => `detail-skeleton-${i}`,
);

/** Full subject view: syllabus outline plus the associated class schedule. */
export function SubjectDetailPage() {
  const { subject } = useParams({ from: "/syllabus/$subject" });
  const { actor, isFetching } = useBackend();

  const { data, isLoading } = useQuery({
    queryKey: ["subjectDetail", subject],
    queryFn: async (): Promise<SubjectDetail | null> => {
      if (!actor) return null;
      return api.getSubjectDetail(actor, subject);
    },
    enabled: !!actor && !isFetching,
  });

  if (isLoading) {
    return (
      <div
        data-ocid="subject.loading_state"
        className="space-y-6"
        aria-busy="true"
        aria-live="polite"
      >
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        data-ocid="subject.empty_state"
        className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center"
      >
        <p className="font-display text-base font-semibold text-foreground">
          Subject not found
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          We couldn't find a syllabus for "{subject}".
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/syllabus" data-ocid="subject.back_button">
            <ArrowLeft className="size-4" />
            Back to syllabus
          </Link>
        </Button>
      </div>
    );
  }

  const { syllabus, classes } = data;
  const topics = syllabus?.topics ?? [];
  const attachments = syllabus?.attachments ?? [];

  return (
    <div data-ocid="subject.page" className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link to="/syllabus" data-ocid="subject.back_button">
            <ArrowLeft className="size-4" />
            All subjects
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Subject
          </span>
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {data.subject}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {topics.length} {topics.length === 1 ? "topic" : "topics"}
          </Badge>
          <Badge variant="secondary" className="font-mono">
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Syllabus outline */}
        <section aria-labelledby="outline-heading" className="min-w-0">
          <h2
            id="outline-heading"
            className="mb-4 font-display text-lg font-semibold text-foreground"
          >
            Syllabus outline
          </h2>

          {topics.length === 0 ? (
            <div
              data-ocid="subject.topics.empty_state"
              className="rounded-xl border border-dashed border-border bg-muted/40 px-5 py-8 text-center text-sm text-muted-foreground"
            >
              No topics have been published for this subject yet.
            </div>
          ) : (
            <ol className="space-y-3">
              {topics.map((topic, index) => (
                <li
                  key={topic.title}
                  data-ocid={`subject.topic.${index + 1}`}
                  className="flex gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-foreground">
                      {topic.title}
                    </p>
                    {topic.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {topic.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Materials */}
          {syllabus?.materialLink || attachments.length > 0 ? (
            <div className="mt-6 space-y-3">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Materials
              </h3>
              {syllabus?.materialLink ? (
                <a
                  href={syllabus.materialLink}
                  target="_blank"
                  rel="noreferrer"
                  data-ocid="subject.material_link"
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-primary transition-smooth hover:border-primary/40 hover:shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ExternalLink
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">Course material</span>
                </a>
              ) : null}
              {attachments.length > 0 ? (
                <ul className="space-y-2">
                  {attachments.map((file, index) => (
                    <li
                      key={file.filename}
                      data-ocid={`subject.attachment.${index + 1}`}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
                    >
                      <FileText
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {file.filename}
                      </span>
                      <Paperclip
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* Class schedule */}
        <section aria-labelledby="schedule-heading" className="min-w-0">
          <h2
            id="schedule-heading"
            className="mb-4 font-display text-lg font-semibold text-foreground"
          >
            Class schedule
          </h2>
          <TimetableGrid
            classes={classes}
            emptyMessage="No classes are scheduled for this subject."
          />
        </section>
      </div>
    </div>
  );
}
