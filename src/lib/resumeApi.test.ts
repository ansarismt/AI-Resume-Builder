import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const api = {
    delete: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
    post: vi.fn(),
    put: vi.fn(),
  };
  return {
    api,
    create: vi.fn(() => api),
    isAxiosError: vi.fn(),
  };
});

vi.mock("axios", () => ({
  default: {
    create: mocks.create,
    isAxiosError: mocks.isAxiosError,
  },
}));

import { emptyResume } from "@/components/resume/types";
import { createResume, getApiBase, normalizeTemplate, requestAuth } from "./resumeApi";

describe("resumeApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses one configured API base and normalizes legacy template ids", () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.test/api/");

    expect(getApiBase()).toBe("https://api.example.test");
    expect(normalizeTemplate("unknown")).toBe("template1");
    expect(normalizeTemplate("template20")).toBe("template20");

    vi.unstubAllEnvs();
  });

  it("sends authentication requests through the shared axios client", async () => {
    const user = {
      token: "token",
      user_id: 1,
      username: "candidate",
      email: "candidate@example.com",
      is_staff: false,
    };
    mocks.api.post.mockResolvedValue({ data: user });

    await expect(
      requestAuth("login", { username: "candidate", password: "secret" }),
    ).resolves.toEqual(user);
    expect(mocks.api.post).toHaveBeenCalledWith("/api/auth/login/", {
      username: "candidate",
      password: "secret",
    });
  });

  it("shapes resume payloads and normalizes API responses", async () => {
    mocks.api.post.mockResolvedValue({
      data: {
        ...emptyResume,
        id: 12,
        template: "not-a-template",
        headline: "Lead analyst",
        user_type: "college",
        detected_user_type: "college",
      },
    });

    const result = await createResume({
      ...emptyResume,
      user_type: "school",
      years_of_experience: 8,
      experience: "Legacy work details",
      headline: "Lead analyst",
      job_title_target: "HR",
    });
    const [, payload] = mocks.api.post.mock.calls[0];

    expect(payload).toMatchObject({
      user_type: "school",
      years_of_experience: 0,
      experience: "",
      headline: "Lead analyst",
      job_title_target: "HR",
    });
    expect(result.id).toBe("12");
    expect(result.template).toBe("template1");
    expect(result.headline).toBe("Lead analyst");
  });
});
