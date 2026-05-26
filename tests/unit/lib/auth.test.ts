import type { AuthError, Session, SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import {
  getEmailConfirmationRedirectUrl,
  getSafeRedirectPath,
  resendVerificationEmail,
  SIGN_UP_SUCCESS_MESSAGE,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "@/lib/auth";

function authError(
  message: string,
  code?: string,
): AuthError {
  return { message, code, name: "AuthApiError", status: 400 } as AuthError;
}

function createMockClient(handlers: {
  signUp?: ReturnType<typeof vi.fn>;
  signInWithPassword?: ReturnType<typeof vi.fn>;
  signOut?: ReturnType<typeof vi.fn>;
  resend?: ReturnType<typeof vi.fn>;
}): SupabaseClient {
  return {
    auth: {
      signUp: handlers.signUp ?? vi.fn(),
      signInWithPassword: handlers.signInWithPassword ?? vi.fn(),
      signOut: handlers.signOut ?? vi.fn().mockResolvedValue({ error: null }),
      resend: handlers.resend ?? vi.fn(),
    },
  } as unknown as SupabaseClient;
}

const session = { access_token: "token" } as Session;

describe("getEmailConfirmationRedirectUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers NEXT_PUBLIC_SITE_URL when set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example.com");
    expect(getEmailConfirmationRedirectUrl()).toBe(
      "https://app.example.com/auth/callback?next=%2Fdashboard",
    );
  });

  it("falls back to request origin when env is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getEmailConfirmationRedirectUrl("https://example.com")).toBe(
      "https://example.com/auth/callback?next=%2Fdashboard",
    );
  });
});

describe("getSafeRedirectPath", () => {
  it("returns dashboard for missing path", () => {
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
    expect(getSafeRedirectPath(undefined)).toBe("/dashboard");
  });

  it("returns dashboard for external or protocol-relative paths", () => {
    expect(getSafeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.com")).toBe("/dashboard");
  });

  it("allows safe relative paths", () => {
    expect(getSafeRedirectPath("/children")).toBe("/children");
    expect(getSafeRedirectPath("/classes/class-1")).toBe("/classes/class-1");
  });
});

describe("signUpWithEmailPassword", () => {
  it("returns success message when signup succeeds without session", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { identities: [{ id: "1" }] }, session: null },
      error: null,
    });
    const client = createMockClient({ signUp });

    const result = await signUpWithEmailPassword(client, {
      email: "Parent@Example.com",
      password: "secret123",
      fullName: "Parent Name",
      emailRedirectTo: "https://example.com/auth/callback",
    });

    expect(result).toEqual({ ok: true, message: SIGN_UP_SUCCESS_MESSAGE });
    expect(signUp).toHaveBeenCalledWith({
      email: "parent@example.com",
      password: "secret123",
      options: {
        emailRedirectTo: "https://example.com/auth/callback",
        data: { full_name: "Parent Name" },
      },
    });
  });

  it("signs out when signup returns an active session", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { identities: [{ id: "1" }] }, session },
      error: null,
    });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const client = createMockClient({ signUp, signOut });

    await signUpWithEmailPassword(client, {
      email: "parent@example.com",
      password: "secret123",
      emailRedirectTo: "https://example.com/auth/callback",
    });

    expect(signOut).toHaveBeenCalled();
  });

  it("maps duplicate account errors", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: authError("User already registered", "user_already_exists"),
    });
    const client = createMockClient({ signUp });

    const result = await signUpWithEmailPassword(client, {
      email: "parent@example.com",
      password: "secret123",
      emailRedirectTo: "https://example.com/auth/callback",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("account_exists");
    }
  });

  it("maps rate limit errors", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: authError("Too many requests", "over_email_send_rate_limit"),
    });
    const client = createMockClient({ signUp });

    const result = await signUpWithEmailPassword(client, {
      email: "parent@example.com",
      password: "secret123",
      emailRedirectTo: "https://example.com/auth/callback",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("rate_limited");
    }
  });

  it("detects existing account when identities array is empty", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { identities: [] }, session: null },
      error: null,
    });
    const client = createMockClient({ signUp });

    const result = await signUpWithEmailPassword(client, {
      email: "parent@example.com",
      password: "secret123",
      emailRedirectTo: "https://example.com/auth/callback",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("account_exists");
    }
  });
});

describe("signInWithEmailPassword", () => {
  it("returns session for verified users", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: {
        session,
        user: { email_confirmed_at: "2024-01-01T00:00:00Z" },
      },
      error: null,
    });
    const client = createMockClient({ signInWithPassword });

    const result = await signInWithEmailPassword(client, {
      email: "Parent@Example.com",
      password: "secret123",
    });

    expect(result).toEqual({ ok: true, session });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "parent@example.com",
      password: "secret123",
    });
  });

  it("blocks unverified email from error response", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: authError("Email not confirmed", "email_not_confirmed"),
    });
    const client = createMockClient({ signInWithPassword });

    const result = await signInWithEmailPassword(client, {
      email: "parent@example.com",
      password: "secret123",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("email_not_confirmed");
    }
  });

  it("blocks unverified email even when session is returned", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: {
        session,
        user: { email_confirmed_at: null },
      },
      error: null,
    });
    const client = createMockClient({ signInWithPassword, signOut });

    const result = await signInWithEmailPassword(client, {
      email: "parent@example.com",
      password: "secret123",
    });

    expect(signOut).toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("email_not_confirmed");
    }
  });

  it("maps invalid credentials", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: authError("Invalid login credentials", "invalid_credentials"),
    });
    const client = createMockClient({ signInWithPassword });

    const result = await signInWithEmailPassword(client, {
      email: "parent@example.com",
      password: "wrong",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("invalid_credentials");
    }
  });

  it("returns unknown error when session is missing", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: { session: null, user: { email_confirmed_at: "2024-01-01" } },
      error: null,
    });
    const client = createMockClient({ signInWithPassword });

    const result = await signInWithEmailPassword(client, {
      email: "parent@example.com",
      password: "secret123",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("unknown");
    }
  });
});

describe("resendVerificationEmail", () => {
  it("requires email", async () => {
    const client = createMockClient({});
    const result = await resendVerificationEmail(client, {
      email: "   ",
      emailRedirectTo: "https://example.com/auth/callback",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("email_required");
    }
  });

  it("returns success when resend succeeds", async () => {
    const resend = vi.fn().mockResolvedValue({ error: null });
    const client = createMockClient({ resend });

    const result = await resendVerificationEmail(client, {
      email: "Parent@Example.com",
      emailRedirectTo: "https://example.com/auth/callback",
    });

    expect(result.ok).toBe(true);
    expect(resend).toHaveBeenCalledWith({
      type: "signup",
      email: "parent@example.com",
      options: { emailRedirectTo: "https://example.com/auth/callback" },
    });
  });

  it("maps resend rate limit errors", async () => {
    const resend = vi.fn().mockResolvedValue({
      error: authError("Rate limit exceeded", "over_email_send_rate_limit"),
    });
    const client = createMockClient({ resend });

    const result = await resendVerificationEmail(client, {
      email: "parent@example.com",
      emailRedirectTo: "https://example.com/auth/callback",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("rate_limited");
    }
  });
});
