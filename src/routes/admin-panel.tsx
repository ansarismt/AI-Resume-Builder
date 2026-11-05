import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Shield, Users, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { getApiErrorMessage, updateAccount as updateAccountApi } from "@/lib/resumeApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-panel")({
  component: AdminPanel,
});

function AdminPanel() {
  const { isAuthenticated, isStaff, username, updateAccount } = useAuth();
  const [newUsername, setNewUsername] = useState(username ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAccountUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isAuthenticated || !isStaff) {
      toast.error("Staff access is required");
      return;
    }

    if (!newUsername.trim() && !newPassword.trim()) {
      toast.error("Enter username or password");
      return;
    }

    setSaving(true);

    try {
      const result = await updateAccountApi({
        username: newUsername.trim(),
        password: newPassword,
      });
      updateAccount(result.username, result.token, result.email, result.is_staff);
      setNewPassword("");
      toast.success("Account updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Account update failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hero-glow min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {!isStaff ? (
          <div className="toon p-6">
            <h1 className="text-2xl font-bold">Staff access required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This page is available only to staff accounts.
            </p>
            <Button asChild className="mt-4">
              <Link to="/">Back to app</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Administration
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Manage the project from the backend admin area. Use this page as the UI entry
                  point for admin workflows.
                </p>
              </div>
              <Button asChild>
                <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noopener noreferrer">
                  Open Django Admin
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="toon p-5">
                <Shield className="h-6 w-6 text-accent" />
                <h2 className="mt-3 font-semibold">Access</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isAuthenticated
                    ? `${username} is signed in.`
                    : "Login before using account-level features."}
                </p>
              </div>
              <div className="toon p-5">
                <Users className="h-6 w-6 text-accent" />
                <h2 className="mt-3 font-semibold">Users</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  View and manage registered users in Django admin.
                </p>
              </div>
              <div className="toon p-5">
                <FileText className="h-6 w-6 text-accent" />
                <h2 className="mt-3 font-semibold">Resumes</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Review saved resumes, templates, and exported resume data.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-border bg-secondary/40 p-5">
              <h2 className="font-semibold">Change Username and Password</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use this admin panel section to update the currently logged-in account.
              </p>

              {isAuthenticated ? (
                <form onSubmit={handleAccountUpdate} className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      value={newUsername}
                      onChange={(event) => setNewUsername(event.target.value)}
                      placeholder="New username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">New password</Label>
                    <Input
                      id="admin-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      type="password"
                      placeholder="New password"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save account changes"}
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/">Back to app</Link>
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/login">Login to edit account</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/">Back to app</Link>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
