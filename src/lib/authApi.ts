const DEFAULT_API_BASE = "http://127.0.0.1:8000";

type AuthPayload = {
  username: string;
  password: string;
  email?: string;
};

type AuthResponse = {
  token: string;
  user_id: number;
  username: string;
  email: string;
};

function normalizeApiBase(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_API_BASE;
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
}

function getAuthApiBases() {
  const envBase = normalizeApiBase(import.meta.env.VITE_API_URL || "");
  return [envBase, DEFAULT_API_BASE].filter(
    (value, index, self) => !!value && self.indexOf(value) === index,
  );
}

async function readJsonResponse(response: Response, endpoint: string) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  console.error(`Unexpected non-JSON response from ${endpoint}:`, response.status, text);
  throw new Error(`Server error (${response.status})`);
}

export async function requestAuth(endpoint: "login" | "signup", payload: AuthPayload) {
  let sawNetworkFailure = false;

  for (const base of getAuthApiBases()) {
    const url = `${base}/api/auth/${endpoint}/`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJsonResponse(response, `/api/auth/${endpoint}/`);

      if (!response.ok) {
        throw new Error(
          data?.error || `${endpoint === "login" ? "Login" : "Signup"} failed (${response.status})`,
        );
      }

      if (!data?.token) {
        throw new Error("No token returned");
      }

      return data as AuthResponse;
    } catch (error) {
      if (error instanceof TypeError) {
        sawNetworkFailure = true;
        continue;
      }

      throw error;
    }
  }

  if (sawNetworkFailure) {
    throw new Error(
      `Cannot reach Django API at ${DEFAULT_API_BASE}. Start it with: python manage.py runserver 127.0.0.1:8000`,
    );
  }

  throw new Error(`${endpoint === "login" ? "Login" : "Signup"} failed`);
}
