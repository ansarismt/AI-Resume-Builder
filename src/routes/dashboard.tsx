import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace("/");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="toon max-w-md p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Your account
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">Home Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Login first to open your resume dashboard.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/signup">Signup</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Opening dashboard...</p>
    </div>
  );
}
