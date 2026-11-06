import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getApiErrorMessage, requestAuth } from "@/lib/resumeApi";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const user = await requestAuth("signup", {
        username: username.trim(),
        email: email.trim(),
        password,
      });
      login(user.username, user.token, user.email, user.is_staff);
      toast.success("Account created and signed in");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Build a resume that gets you noticed."
      text="Create a free account and go from blank page to a polished, job-ready resume in minutes."
    >
      <form onSubmit={submit} className="toon w-full p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Get started</p>
        <h2 className="text-2xl font-bold mt-2 mb-1">Signup</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Create an account to open your home dashboard.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="signup-username">Username</Label>
            <Input
              id="signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div>
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>
          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Already have an account?
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
