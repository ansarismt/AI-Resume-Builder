import { createFileRoute } from "@tanstack/react-router";
import { Signup } from "@/components/auth/Signup";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Signup open={true} onClose={() => (window.location.href = "/")} />
    </div>
  );
}
