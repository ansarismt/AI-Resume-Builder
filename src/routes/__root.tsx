import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
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
import { LogOut, Plus, Timer } from "lucide-react";

import appCss from "../styles.css?url";
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
      { title: "Inkwell - Resume Creator" },
      { name: "description", content: "Create polished resumes for school, college, internships, and jobs with clean templates, guided writing, and instant preview." },
      { name: "author", content: "Inkwell" },
      { property: "og:title", content: "Inkwell - Resume Creator" },
      { property: "og:description", content: "Create polished resumes for school, college, internships, and jobs with clean templates, guided writing, and instant preview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Inkwell - Resume Creator" },
      { name: "twitter:description", content: "Create polished resumes for school, college, internships, and jobs with clean templates, guided writing, and instant preview." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4401fbba-2dd4-47f2-afff-18ed1b67dc2a/id-preview-e8c1bf7d--0da4a6c1-56b4-4b25-b22c-9dde830fa9d3.lovable.app-1777030730204.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4401fbba-2dd4-47f2-afff-18ed1b67dc2a/id-preview-e8c1bf7d--0da4a6c1-56b4-4b25-b22c-9dde830fa9d3.lovable.app-1777030730204.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthHeader() {
  const { isAuthenticated, username, email, loginAt, logout } = useAuth();
  const usageTime = (() => {
    if (!loginAt) return "0 min";
    const totalMinutes = Math.max(0, Math.floor((Date.now() - new Date(loginAt).getTime()) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
  })();

  return (
    <div className="ml-auto flex flex-wrap items-center gap-3">
      {isAuthenticated && (
        <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
      )}
      <Link to="/admin-panel" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Admin Panel
      </Link>
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
                  <p className="truncate text-xs font-normal text-muted-foreground">{email || "No email saved"}</p>
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
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        null
      )}
    </div>
  );
}

function RootComponent() {
  return (
    <>
      <AuthProvider>
        <nav className="flex flex-wrap items-center gap-4 px-4 sm:px-6 py-4 bg-background border-b border-border">
          <Link to="/" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
            Inkwell
          </Link>
          <AuthHeader />
        </nav>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </>
  );
}
