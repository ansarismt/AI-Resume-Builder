import { Outlet, Link, createRootRoute, HeadContent } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrainCircuit, LogOut, Plus, Timer } from "lucide-react";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { VDartBadge } from "@/components/shared/VDartBadge";
import { ScrollHelpers } from "@/components/shared/BackToTop";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Resume Builder" },
      {
        name: "description",
        content:
          "Create polished resumes for school, college, internships, and jobs with clean templates, guided writing, and instant preview.",
      },
      { name: "author", content: "VDart" },
      { property: "og:title", content: "AI Resume Builder by VDart" },
      {
        property: "og:description",
        content:
          "Create polished resumes for school, college, internships, and jobs with clean templates, guided writing, and instant preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "AI Resume Builder" },
      {
        name: "twitter:description",
        content:
          "Create polished resumes for school, college, internships, and jobs with clean templates, guided writing, and instant preview.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function AuthHeader() {
  const { isAuthenticated, isStaff, username, email, loginAt, logout } = useAuth();
  const usageTime = (() => {
    if (!loginAt) return "0 min";
    const totalMinutes = Math.max(
      0,
      Math.floor((Date.now() - new Date(loginAt).getTime()) / 60000),
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
  })();

  return (
    <div className="ml-auto flex flex-wrap items-center gap-3">
      {!isAuthenticated && (
        <>
          <Link
            to="/"
            hash="features"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            Features
          </Link>
          <Link
            to="/"
            hash="faq"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            FAQ
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Get started</Link>
          </Button>
        </>
      )}
      <ThemeToggle />
      {isAuthenticated && (
        <Link
          to="/ai-studio"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-accent"
        >
          <BrainCircuit className="h-4 w-4" />
          AI Studio
        </Link>
      )}
      {isAuthenticated && (
        <Link
          to="/dashboard"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
      )}
      {isStaff && (
        <Link
          to="/admin-panel"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Admin Panel
        </Link>
      )}
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {(username || "U").slice(0, 1).toUpperCase()}
              </span>
              Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {(username || "U").slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{username}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {email || "No email saved"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login">
                <Plus className="h-4 w-4" />
                Add account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Timer className="h-4 w-4" />
              Usage time: {usageTime}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void logout().catch(() => toast.error("Could not log out. Please try again."));
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider>
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only z-[60] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          >
            Skip to content
          </a>
          <ScrollHelpers />
          <div className="flex min-h-screen flex-col">
            <nav className="sticky top-0 z-30 flex flex-wrap items-center gap-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6 no-print">
              <Link
                to="/"
                className="group flex items-center gap-3 text-foreground transition-colors hover:text-primary"
              >
                <span className="relative inline-flex h-10 w-14 shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <img
                    src="/logo.png"
                    alt=""
                    width={56}
                    height={40}
                    className="h-10 w-14 object-contain dark:hidden"
                  />
                  <img
                    src="/logo-dark.png"
                    alt=""
                    width={56}
                    height={40}
                    className="hidden h-10 w-14 object-contain dark:block"
                  />
                </span>
                <span className="font-display text-2xl font-bold tracking-tight">
                  AI Resume Builder
                </span>
              </Link>
              <AuthHeader />
            </nav>
            <div id="main-content" className="flex-1">
              <Outlet />
            </div>
            <footer className="border-t border-border bg-background px-4 py-6 no-print sm:px-6">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
                <span>© 2026 AI Resume Builder. All rights reserved.</span>
                <span>Built for study, internships, and careers</span>
                <VDartBadge variant="text" />
              </div>
            </footer>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
