import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function Signup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  if (!open) return null;

  const doSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Enter username, email and password");
      return;
    }

    setLoading(true);
    try {
      const tryUrls = [
        "http://127.0.0.1:8000/api/auth/signup/",
        "/api/auth/signup/",
      ];

      let lastError: any = null;
      for (const url of tryUrls) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
          });
          const text = await res.text();
          if (text && text.trim().startsWith("<!DOCTYPE html") && res.status === 404) {
            lastError = new Error(`Backend returned 404 at ${url}`);
            continue;
          }

          let j: any = null;
          try {
            j = text ? JSON.parse(text) : null;
          } catch {
            throw new Error((text || "").substring(0, 200) || "Signup failed");
          }

          if (!res.ok) throw new Error((j && j.error) || `Signup failed (${res.status})`);
          if (!j?.token) throw new Error("No token returned");

          login(username, j.token);
          toast.success("Account created and signed in");
          onClose();
          try {
            window.dispatchEvent(new CustomEvent("open-saved"));
          } catch {}
          return;
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError || new Error("Signup failed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Create an account</h3>
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
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={doSignup} disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
