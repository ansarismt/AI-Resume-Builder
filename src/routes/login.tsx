import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { requestAuth } from "@/lib/resumeApi";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Enter username and password");
      return;
    }

    setLoading(true);
    try {
      const user = await requestAuth("login", { username: username.trim(), password });
      login(user.username, user.token, user.email, user.is_staff);
      toast.success("Signed in");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="max-w-md w-full bg-card border border-border rounded-xl p-6 shadow-sm"
      >
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Step 3</p>
        <h2 className="text-2xl font-bold mt-2 mb-1">Login</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Access your home dashboard and saved resumes.
        </p>
        <div className="space-y-3">
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground">
              Create account
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
