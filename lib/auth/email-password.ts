import type { SupabaseClient } from "@supabase/supabase-js";

export type SignUpSuccess = { ok: true };

export type SignUpFailure = {
  ok: false;
  reason: "account_exists" | "unknown";
  message: string;
};

export type SignUpResult = SignUpSuccess | SignUpFailure;

export type SignInSuccess = { ok: true };

export type SignInFailureReason =
  | "email_not_confirmed"
  | "invalid_credentials"
  | "unknown";

export type SignInFailure = {
  ok: false;
  reason: SignInFailureReason;
  message: string;
};

export type SignInResult = SignInSuccess | SignInFailure;

function getAuthErrorCode(error: { code?: string; message?: string }): string | undefined {
  if (typeof error.code === "string" && error.code.length > 0) {
    return error.code;
  }
  return undefined;
}

function isEmailNotConfirmedError(error: {
  code?: string;
  message?: string;
}): boolean {
  const code = getAuthErrorCode(error);
  if (
    code === "email_not_confirmed" ||
    code === "provider_email_needs_verification"
  ) {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("email not confirmed");
}

function isInvalidCredentialsError(error: {
  code?: string;
  message?: string;
}): boolean {
  const code = getAuthErrorCode(error);
  if (code === "invalid_credentials") {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return (
    msg.includes("invalid login credentials") || msg.includes("invalid credentials")
  );
}

function isExistingUserError(error: { code?: string; message?: string }): boolean {
  const code = getAuthErrorCode(error);
  if (code === "user_already_exists" || code === "email_exists") {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return msg.includes("already registered") || msg.includes("already exists");
}

/**
 * Sign up with email/password. Assumes email confirmation is enabled in Supabase.
 * Does not treat the user as logged in: clears any session returned by signUp so the
 * app always follows the verify-email path.
 */
export async function signUpWithEmailPassword(
  client: SupabaseClient,
  input: {
    email: string;
    password: string;
    /** Optional user metadata; profile row should still come from a DB trigger. */
    fullName?: string;
    emailRedirectTo: string;
  },
): Promise<SignUpResult> {
  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: input.emailRedirectTo,
      data: input.fullName ? { full_name: input.fullName } : undefined,
    },
  });

  if (error) {
    if (isExistingUserError(error)) {
      return {
        ok: false,
        reason: "account_exists",
        message: "Account already exists. Please log in.",
      };
    }
    return {
      ok: false,
      reason: "unknown",
      message: error.message || "Could not create your account. Try again.",
    };
  }

  if (data.session) {
    await client.auth.signOut();
  }

  return { ok: true };
}

const EMAIL_NOT_CONFIRMED_MESSAGE =
  "Please verify your email before signing in. Check your inbox for the confirmation link.";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

/**
 * Password sign-in. Maps common errors, including login before email verification.
 */
export async function signInWithEmailPassword(
  client: SupabaseClient,
  input: { email: string; password: string },
): Promise<SignInResult> {
  const { data, error } = await client.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    if (isEmailNotConfirmedError(error)) {
      return {
        ok: false,
        reason: "email_not_confirmed",
        message: EMAIL_NOT_CONFIRMED_MESSAGE,
      };
    }
    if (isInvalidCredentialsError(error)) {
      return {
        ok: false,
        reason: "invalid_credentials",
        message: INVALID_CREDENTIALS_MESSAGE,
      };
    }
    return {
      ok: false,
      reason: "unknown",
      message: error.message || "Something went wrong. Try again.",
    };
  }

  if (!data.session) {
    return {
      ok: false,
      reason: "unknown",
      message: "Could not establish a session. Try again.",
    };
  }

  return { ok: true };
}
