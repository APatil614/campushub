import { BrandMark, NavLinks } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogIn, LogOut, UserRound } from "lucide-react";
import type { ReactNode } from "react";

const CAFFEINE_URL = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
  typeof window !== "undefined" ? window.location.hostname : "",
)}`;

/** Internet Identity sign-in / sign-out control for the header. */
function AuthControl() {
  const { isAuthenticated, isInitializing, isLoggingIn, login, clear } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <span
        data-ocid="auth.loading_state"
        className="inline-flex h-9 items-center rounded-md bg-muted px-3 text-sm text-muted-foreground"
      >
        Checking session…
      </span>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:inline-flex">
          <UserRound className="size-4" />
          Signed in
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="auth.signout_button"
          onClick={() => clear()}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      data-ocid="auth.signin_button"
      disabled={isLoggingIn}
      onClick={() => login()}
    >
      <LogIn className="size-4" />
      {isLoggingIn ? "Signing in…" : "Sign in"}
    </Button>
  );
}

interface LayoutProps {
  children: ReactNode;
}

/**
 * App shell: fixed sidebar on desktop, sticky header, and a mobile bottom nav.
 * Header and footer use distinct backgrounds from the content area.
 */
export function Layout({ children }: LayoutProps) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <BrandMark />
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavLinks variant="sidebar" />
        </div>
        <p className="mt-4 px-3 text-xs text-muted-foreground">
          Your campus, all in one place.
        </p>
      </aside>

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 shadow-subtle sm:px-6">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="hidden lg:block">
            <p className="font-display text-sm font-semibold text-foreground">
              Campus bulletin
            </p>
            <p className="text-xs text-muted-foreground">
              Notices, events, classes and syllabus
            </p>
          </div>
          <AuthControl />
        </header>

        {/* Main content */}
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/60 px-4 py-6 pb-28 sm:px-6 lg:pb-6">
          <p className="text-center text-xs text-muted-foreground">
            © {year}. Built with love using{" "}
            <a
              href={CAFFEINE_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sidebar-border bg-sidebar px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 lg:hidden">
        <NavLinks variant="bottom" />
      </div>
    </div>
  );
}
