import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { requestAuth } from "@/lib/authApi";

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
      const user = await requestAuth("login", { username: username.trim(), password });
      login(user.username, user.token, user.email);
      toast.success("Signed in");
      onClose();
      window.dispatchEvent(new CustomEvent("open-saved"));
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
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={doLogin} disabled={loading}>
              {loading ? "Signing…" : "Sign in"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
