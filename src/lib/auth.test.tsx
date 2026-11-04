import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/resumeApi", () => ({
  getApiErrorMessage: (_error: unknown, fallback: string) => fallback,
  getCurrentUser: vi.fn().mockResolvedValue({
    username: "saved-user",
    email: "saved@example.com",
    is_staff: false,
  }),
  logoutApi: vi.fn(),
}));

import { AuthProvider, useAuth } from "./auth";

function AuthStatus() {
  const { isAuthenticated, username } = useAuth();
  return <p>{isAuthenticated ? `authenticated:${username}` : "signed out"}</p>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("uses the saved token and username on the first render", () => {
    window.localStorage.setItem("token", "saved-token");
    window.localStorage.setItem("username", "saved-user");

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );

    expect(screen.getByText("authenticated:saved-user")).toBeInTheDocument();
  });
});
