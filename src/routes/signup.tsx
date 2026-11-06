import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getApiErrorMessage, requestAuth } from "@/lib/resumeApi";
import { AuthShell, PasswordField, StrengthMeter } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

type Errors = {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
};

function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const validate = (): Errors => {
    const next: Errors = {};
    if (!username.trim()) next.username = "Choose a username.";
    if (!email.trim()) next.email = "Enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    return next;
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

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
      const message = getApiErrorMessage(err, "Signup failed");
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline="Let's build something that gets you noticed."
      intro="Create a free account to design, save and download resumes that read clearly."
      steps={["Start", "Name", "Email", "Password", "Ready"]}
      progress={
        ((username.trim() ? 1 : 0) +
          (/^\S+@\S+\.\S+$/.test(email.trim()) ? 1 : 0) +
          (password.length >= 8 ? 1 : 0) +
          (password.length >= 8 && confirm === password ? 1 : 0)) /
        4
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">It takes less than a minute.</p>
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
          <Label htmlFor="signup-username">Username</Label>
          <Input
            id="signup-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={errors.username ? "signup-username-error" : undefined}
            className="mt-1.5"
          />
          {errors.username && (
            <p id="signup-username-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.username}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            className="mt-1.5"
          />
          {errors.email && (
            <p id="signup-email-error" role="alert" className="mt-1 text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <PasswordField
            id="signup-password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            error={errors.password}
            describedBy="signup-strength"
          />
          <StrengthMeter id="signup-strength" password={password} />
        </div>
        <PasswordField
          id="signup-confirm"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          error={errors.confirm}
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading} aria-busy={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
