import { useBackend } from "@/hooks/useBackend";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Home,
  Megaphone,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import type { ComponentType } from "react";

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Notices", to: "/notices" },
  { label: "Events", to: "/events" },
  { label: "Classes", to: "/classes" },
  { label: "Syllabus", to: "/syllabus" },
  { label: "Admin", to: "/admin", adminOnly: true },
];

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "/": Home,
  "/notices": Megaphone,
  "/events": CalendarDays,
  "/classes": BookOpen,
  "/syllabus": ScrollText,
  "/admin": ShieldCheck,
};

/** True when the current path matches a nav destination (including detail routes). */
function isActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * Admin-gated navigation links. Renders nothing until the caller is confirmed
 * an admin, so the Admin entry never flashes for regular users.
 */
export function useAdminNav(): { isAdmin: boolean; isLoading: boolean } {
  const { actor, isFetching } = useBackend();
  const { isAuthenticated } = useInternetIdentity();
  const { data, isLoading } = useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return api.isCallerAdmin(actor);
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
  return { isAdmin: data ?? false, isLoading };
}

interface NavLinksProps {
  variant: "sidebar" | "bottom";
  onNavigate?: () => void;
}

/** Shared navigation link list used by both the sidebar and the mobile bottom bar. */
export function NavLinks({ variant, onNavigate }: NavLinksProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { isAdmin } = useAdminNav();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        variant === "sidebar" ? "flex flex-col gap-1" : "grid gap-1",
      )}
      style={
        variant === "bottom"
          ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }
          : undefined
      }
    >
      {items.map((item) => {
        const Icon = ICONS[item.to] ?? Home;
        const active = isActive(pathname, item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            data-ocid={`nav.${item.label.toLowerCase()}.link`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              variant === "sidebar"
                ? "px-3 py-2.5"
                : "flex-col gap-1 px-1 py-2 text-[11px]",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn(variant === "sidebar" ? "size-5" : "size-5")} />
            <span className={cn(variant === "sidebar" && "truncate")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Brand mark used in the sidebar header. */
export function BrandMark() {
  return (
    <Link
      to="/"
      data-ocid="nav.brand.link"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-subtle">
        <GraduationCap className="size-5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        CampusHub
      </span>
    </Link>
  );
}
