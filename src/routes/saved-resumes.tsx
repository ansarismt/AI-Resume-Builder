import { createFileRoute, redirect } from "@tanstack/react-router";

// The saved-resumes list lives on the home page, where opening a resume loads it into the editor.
export const Route = createFileRoute("/saved-resumes")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "saved-resumes" });
  },
});
