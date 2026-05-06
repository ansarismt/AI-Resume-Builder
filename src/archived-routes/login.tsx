import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/components/auth/Login";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Login open={true} onClose={() => (window.location.href = "/")} />
    </div>
  );
}
