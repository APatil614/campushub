import { Skeleton } from "@/components/ui/skeleton";
import type { SummaryCounts } from "@/types";
import { Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Megaphone } from "lucide-react";
import type { ComponentType } from "react";

interface SummaryCardSpec {
  key: keyof SummaryCounts;
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
}

const CARDS: SummaryCardSpec[] = [
  {
    key: "todaysClasses",
    label: "Today's Classes",
    to: "/classes",
    icon: BookOpen,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    key: "newNotices",
    label: "New Notices",
    to: "/notices",
    icon: Megaphone,
    iconClass: "bg-cat-exam/10 text-cat-exam",
  },
  {
    key: "upcomingEvents",
    label: "Upcoming Events",
    to: "/events",
    icon: CalendarDays,
    iconClass: "bg-accent/10 text-accent",
  },
];

interface SummaryCardsProps {
  counts: SummaryCounts | undefined;
  isLoading: boolean;
}

/** Quick-glance dashboard counts linking to their respective sections. */
export function SummaryCards({ counts, isLoading }: SummaryCardsProps) {
  return (
    <section
      aria-label="At a glance"
      data-ocid="home.summary.section"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {CARDS.map((card, index) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.key}
            to={card.to}
            data-ocid={`home.summary.card.${index + 1}`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              {isLoading ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <p className="font-mono text-2xl font-bold leading-none text-foreground">
                  {counts ? counts[card.key].toString() : "0"}
                </p>
              )}
              <p className="mt-1 truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
