import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getApiErrorMessage, requestAuth } from "@/lib/resumeApi";

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
      toast.error(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-glow flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="toon max-w-md w-full p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Welcome back
        </p>
        <h2 className="text-2xl font-bold mt-2 mb-1">Login</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Access your home dashboard and saved resumes.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="login-username">Username</Label>
            <Input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
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
