import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth";

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
  const { isAuthenticated, username, logout } = useAuth();
  return (
    <div className="flex flex-wrap items-center gap-3 ml-0 sm:ml-4">
      <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Home
      </Link>
      <Link to="/saved-resumes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Saved Resumes
      </Link>
      {isAuthenticated ? (
        <>
          <span className="text-sm text-muted-foreground">{username}</span>
          <button
            onClick={logout}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded border border-border hover:border-primary/50 hover:bg-primary/10"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/signup" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Signup
          </Link>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Login
          </Link>
        </>
      )}
      <a
        href="http://127.0.0.1:8000/admin/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded border border-border hover:border-primary/50 hover:bg-primary/10"
      >
        Admin
      </a>
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
