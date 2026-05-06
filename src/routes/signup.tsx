import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

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
      const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      let j: any = null;

      if (contentType.includes("application/json")) {
        j = await res.json();
      } else {
        const text = await res.text();
        console.error("Unexpected non-JSON response from /api/auth/signup/:", res.status, text);
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok) throw new Error((j && j.error) || `Signup failed (${res.status})`);

      if (!j?.token) throw new Error("No token returned");
      login(username, j.token);
      toast.success("Account created and signed in");
      window.location.href = "/";
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="max-w-md w-full bg-card border border-border rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Create an account</h2>
        <div className="space-y-3">
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
