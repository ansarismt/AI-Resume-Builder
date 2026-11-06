import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from "./dashboardContent";

const storageKey = (username: string | null) => `applications:${username ?? "guest"}`;

function readApplications(username: string | null): Application[] {
  try {
    const raw = window.localStorage.getItem(storageKey(username));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Application[]) : [];
  } catch {
    return [];
  }
}

const STATUS_TONE: Record<ApplicationStatus, string> = {
  Saved: "bg-secondary text-secondary-foreground",
  Applied: "bg-primary/15 text-primary",
  Interview: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Offer: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Rejected: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

/** A small job-application tracker. Entries stay in this browser. */
export function ApplicationTracker({
  username,
  onCount,
}: {
  username: string | null;
  onCount?: (count: number) => void;
}) {
  const [items, setItems] = useState<Application[]>(() => readApplications(username));
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setItems(readApplications(username));
  }, [username]);

  useEffect(() => {
    onCount?.(items.length);
  }, [items.length, onCount]);

  const persist = (next: Application[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(storageKey(username), JSON.stringify(next));
    } catch {
      /* best effort */
    }
  };

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    if (!company.trim() || !role.trim()) return;
    persist([
      {
        id: crypto.randomUUID(),
        company: company.trim(),
        role: role.trim(),
        status: "Applied",
        date: new Date().toISOString().slice(0, 10),
      },
      ...items,
    ]);
    setCompany("");
    setRole("");
  };

  const counts = APPLICATION_STATUSES.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {counts.map(({ status, count }) => (
          <span
            key={status}
            className={cn("rounded-full px-3 py-1 text-xs font-semibold", STATUS_TONE[status])}
          >
            {status} · {count}
          </span>
        ))}
      </div>

      <form onSubmit={add} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          placeholder="Company"
          aria-label="Company"
          maxLength={80}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        />
        <input
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="Role"
          aria-label="Role"
          maxLength={80}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        />
        <Button type="submit" disabled={!company.trim() || !role.trim()}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm italic text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          No applications yet. Add the first job you apply to.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.role}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.company} · {item.date}
                </p>
              </div>
              <select
                value={item.status}
                aria-label={`Status for ${item.role} at ${item.company}`}
                onChange={(event) =>
                  persist(
                    items.map((entry) =>
                      entry.id === item.id
                        ? { ...entry, status: event.target.value as ApplicationStatus }
                        : entry,
                    ),
                  )
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <button
                type="button"
                aria-label={`Remove ${item.role} at ${item.company}`}
                onClick={() => persist(items.filter((entry) => entry.id !== item.id))}
                className="p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Stored in this browser only.</p>
    </div>
  );
}
