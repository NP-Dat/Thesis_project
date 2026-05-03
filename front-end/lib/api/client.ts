import type { ApiEnvelope, ApiErrorPayload } from "../types";

const BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api")
    : "http://localhost:3000/api";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const json = (await res.json()) as ApiEnvelope<T> & {
    error?: ApiErrorPayload;
  };

  if (!res.ok || !json.success) {
    const errPayload = json.error ?? {
      code: "UNKNOWN",
      message: "An unexpected error occurred",
    };

    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }

    throw new ApiError(res.status, errPayload);
  }

  return json.data;
}
