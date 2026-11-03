import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { requestAuth } from "@/lib/authApi";

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
      const user = await requestAuth("signup", {
        username: username.trim(),
        email: email.trim(),
        password,
      });
      login(user.username, user.token, user.email);
      toast.success("Account created and signed in");
      onClose();
      window.dispatchEvent(new CustomEvent("open-saved"));
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
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={doSignup} disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
