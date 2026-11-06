import { Link } from "@tanstack/react-router";
import { ArrowMark, Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";

export function SiteFooter() {
  const { isAuthenticated } = useAuth();
  return (
    <footer className="no-print border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo size="lg" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Build clear, ATS-friendly resumes with guided writing, live preview and optional AI
            tools. Your next step starts with a better resume.
          </p>
        </div>
        <nav aria-label="Product">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            Product
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" hash="features" className="hover:text-foreground">
                Features
              </Link>
            </li>
            <li>
              <Link to="/" hash="how-it-works" className="hover:text-foreground">
                How it works
              </Link>
            </li>
            <li>
              <Link to="/" hash="ai-tools" className="hover:text-foreground">
                AI tools
              </Link>
            </li>
            <li>
              <Link to="/" hash="faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            Account
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/ai-studio" className="hover:text-foreground">
                    AI Studio
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-foreground">
                    Create account
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span>© 2026 AI Resume Builder</span>
          <ArrowMark className="h-4 w-auto text-brand" drifting />
        </div>
      </div>
    </footer>
  );
}
