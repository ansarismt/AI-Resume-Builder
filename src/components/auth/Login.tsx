import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function Login({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  if (!open) return null;

  const doLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error("Enter username and password");
      return;
    }
    setLoading(true);
    try {
      // try primary backend URL first, fall back to same-origin if the response looks like an HTML 404
      const tryUrls = [
        "http://127.0.0.1:8000/api/auth/login/",
        "/api/auth/login/",
      ];
      let lastError: any = null;
      for (const url of tryUrls) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const text = await res.text();
          // quick heuristic: if body looks like HTML and it's a 404, try next
          if (text && text.trim().startsWith("<!DOCTYPE html") && res.status === 404) {
            lastError = new Error(`Backend returned 404 at ${url}`);
            continue;
          }
          let j: any = null;
          try {
            j = text ? JSON.parse(text) : null;
          } catch (err) {
            throw new Error((text || "").substring(0, 200) || "Login failed");
          }
          if (!res.ok) throw new Error((j && j.error) || `Login failed (${res.status})`);
          if (!j.token) {
            throw new Error("No token returned");
          }
          login(username, j.token);
          toast.success("Signed in");
          onClose();
          try {
            window.dispatchEvent(new CustomEvent("open-saved"));
          } catch (e) {}
          return;
        } catch (err) {
          lastError = err;
        }
      }
      throw lastError || new Error("Login failed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full z-10">
        <h3 className="font-display text-lg font-bold mb-4">Sign in</h3>
        <div className="space-y-3">
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={doLogin} disabled={loading}>{loading ? "Signing…" : "Sign in"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
