import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrainCircuit, LogOut, Menu, Moon, Plus, Sun, Timer, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Landing-page sections the public navigation scrolls to. */
const SECTION_LINKS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "model", label: "The model" },
  { id: "ai-tools", label: "AI tools" },
  { id: "faq", label: "FAQ" },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
    </Button>
  );
}

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") {
      setActive(null);
      return;
    }
    const targets = SECTION_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

function AccountMenu() {
  const { username, email, loginAt, logout } = useAuth();
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
  );
}

export function SiteNav() {
  const { isAuthenticated, isStaff } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";
  const activeSection = useActiveSection(onHome && !isAuthenticated);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after any navigation.
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = (active: boolean) =>
    cn(
      "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
      "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100",
      active && "text-foreground after:scale-x-100",
    );

  const links = isAuthenticated ? (
    <>
      <Link to="/dashboard" className={linkClass(pathname === "/dashboard")}>
        Dashboard
      </Link>
      <Link to="/ai-studio" className={linkClass(pathname === "/ai-studio")}>
        <span className="inline-flex items-center gap-1.5">
          <BrainCircuit className="h-4 w-4" />
          AI Studio
        </span>
      </Link>
      {isStaff && (
        <Link to="/admin-panel" className={linkClass(pathname === "/admin-panel")}>
          Admin Panel
        </Link>
      )}
    </>
  ) : (
    <>
      <Link to="/" className={linkClass(onHome && activeSection === null)}>
        Home
      </Link>
      {SECTION_LINKS.map((l) => (
        <Link key={l.id} to="/" hash={l.id} className={linkClass(activeSection === l.id)}>
          {l.label}
        </Link>
      ))}
    </>
  );

  return (
    <header
      className={cn(
        "no-print sticky top-0 z-30 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border bg-background/80 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/40 backdrop-blur-sm",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6"
      >
        <Link to="/" aria-label="AI Resume Builder home" className="mr-4 flex items-center">
          <Logo />
        </Link>
        <div className="hidden items-center gap-1 md:flex">{links}</div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <AccountMenu />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>
      {open && (
        <div
          id="mobile-menu"
          className="stage-in border-t border-border bg-background px-4 pb-4 pt-2 md:hidden"
        >
          <div className="flex flex-col gap-1">{links}</div>
          {!isAuthenticated && (
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
