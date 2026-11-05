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
      { name: "author", content: "AI Resume Builder" },
      { property: "og:title", content: "AI Resume Builder" },
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
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <nav className="sticky top-0 z-30 flex flex-wrap items-center gap-4 border-b-2 border-foreground bg-background/85 px-4 py-3 backdrop-blur sm:px-6 no-print">
            <Link
              to="/"
              className="group flex items-center gap-3 text-foreground transition-colors hover:text-primary"
            >
              <img
                src="/logo.png"
                alt=""
                width={60}
                height={51}
                className="h-14 w-auto transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
              />
              <span className="font-display text-2xl font-extrabold tracking-tight">
                AI Resume Builder
              </span>
            </Link>
            <AuthHeader />
          </nav>
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="border-t border-border bg-background px-4 py-5 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row">
              <span>© AI Resume Builder 2026</span>
              <span>Built for study, internships, and careers</span>
              <span>Crafted with care</span>
            </div>
          </footer>
          <Toaster />
        </div>
      </AuthProvider>
    </>
  );
}
