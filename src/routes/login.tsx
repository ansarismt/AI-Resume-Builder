import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getApiErrorMessage, requestAuth } from "@/lib/resumeApi";
import { AuthShell, PasswordField } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const next: typeof errors = {};
    if (!username.trim()) next.username = "Enter your username.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (next.username || next.password) return;

    setLoading(true);
    try {
      const user = await requestAuth("login", { username: username.trim(), password });
      login(user.username, user.token, user.email, user.is_staff);
      toast.success("Signed in");
      window.location.href = "/dashboard";
    } catch (err) {
      const message = getApiErrorMessage(err, "Login failed");
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline="Welcome back. Your next opportunity awaits."
      intro="Pick up where you left off: your saved resumes, templates and AI tools are ready."
      steps={["Welcome", "Username", "Password"]}
      progress={(username.trim() ? 0.5 : 0) + (password ? 0.5 : 0)}
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your dashboard and saved resumes.
          </p>
        </div>
        {errors.form && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errors.form}
          </p>
        )}
        <div>
          <Label htmlFor="login-username">Username</Label>
          <Input
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={errors.username ? "login-username-error" : undefined}
            className="mt-1.5"
          />
          {errors.username && (
            <p id="login-username-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.username}
            </p>
          )}
        </div>
        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={errors.password}
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading} aria-busy={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
