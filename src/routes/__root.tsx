import { Outlet, Link, createRootRoute, HeadContent } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
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

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <SiteNav />
            <div className="flex-1">
              <Outlet />
            </div>
            <SiteFooter />
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
