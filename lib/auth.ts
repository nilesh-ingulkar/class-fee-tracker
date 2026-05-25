import type { AuthError, Session, SupabaseClient } from "@supabase/supabase-js";

export const SIGN_UP_SUCCESS_MESSAGE =
  "Check your email to verify your account";

const EMAIL_NOT_CONFIRMED_MESSAGE =
  "Please verify your email before signing in. Check your inbox for the confirmation link.";
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const GENERIC_SIGN_UP_MESSAGE = "Could not create your account. Try again.";
const GENERIC_SIGN_IN_MESSAGE = "Could not sign in. Try again.";
const GENERIC_RESEND_MESSAGE =
  "Could not send a verification email. Try again.";
const RESEND_SUCCESS_MESSAGE =
  "Verification email sent. Check your inbox and spam folder.";

export type AuthSuccess = { ok: true; message?: string };

export type SignUpFailureReason =
  | "account_exists"
  | "rate_limited"
  | "unknown";

export type SignInFailureReason =
  | "email_not_confirmed"
  | "invalid_credentials"
  | "unknown";

export type ResendFailureReason =
  | "email_required"
  | "rate_limited"
  | "unknown";

export type AuthFailure<Reason extends string> = {
  ok: false;
  reason: Reason;
  message: string;
};

export type SignUpResult =
  | AuthSuccess
  | AuthFailure<SignUpFailureReason>;

export type SignInResult =
  | ({ ok: true; session: Session })
  | AuthFailure<SignInFailureReason>;

export type ResendVerificationResult =
  | AuthSuccess
  | AuthFailure<ResendFailureReason>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getAuthErrorCode(error: AuthError): string | undefined {
  return typeof error.code === "string" && error.code.length > 0
    ? error.code
    : undefined;
}

function getAuthErrorMessage(error: AuthError): string {
  return error.message.toLowerCase();
}

function isEmailNotConfirmedError(error: AuthError): boolean {
  const code = getAuthErrorCode(error);
  if (
    code === "email_not_confirmed" ||
    code === "provider_email_needs_verification"
  ) {
    return true;
  }

  return getAuthErrorMessage(error).includes("email not confirmed");
}

function isInvalidCredentialsError(error: AuthError): boolean {
  const code = getAuthErrorCode(error);
  if (code === "invalid_credentials") {
    return true;
  }

  const message = getAuthErrorMessage(error);
  return (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  );
}

function isExistingUserError(error: AuthError): boolean {
  const code = getAuthErrorCode(error);
  if (code === "user_already_exists" || code === "email_exists") {
    return true;
  }

  const message = getAuthErrorMessage(error);
  return message.includes("already registered") || message.includes("already exists");
}

function isRateLimitedError(error: AuthError): boolean {
  const code = getAuthErrorCode(error);
  const message = getAuthErrorMessage(error);
  return (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    message.includes("rate limit") ||
    message.includes("too many")
  );
}

function hasNoNewIdentity(data: Awaited<ReturnType<SupabaseClient["auth"]["signUp"]>>["data"]) {
  return Boolean(data.user && data.user.identities?.length === 0);
}

export function getEmailConfirmationRedirectUrl(origin: string): string {
  return `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;
}

export function getSafeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }

  return path;
}

/**
 * Creates an email/password account without assuming the user is signed in.
 * Profiles are intentionally not created here; the database trigger owns that.
 */
export async function signUpWithEmailPassword(
  client: SupabaseClient,
  input: {
    email: string;
    password: string;
    fullName?: string;
    emailRedirectTo: string;
  },
): Promise<SignUpResult> {
  const { data, error } = await client.auth.signUp({
    email: normalizeEmail(input.email),
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
        message: "Account already exists. Please sign in or resend the verification email.",
      };
    }

    if (isRateLimitedError(error)) {
      return {
        ok: false,
        reason: "rate_limited",
        message: "Please wait a moment before requesting another email.",
      };
    }

    return {
      ok: false,
      reason: "unknown",
      message: GENERIC_SIGN_UP_MESSAGE,
    };
  }

  if (data.session) {
    await client.auth.signOut();
  }

  if (hasNoNewIdentity(data)) {
    return {
      ok: false,
      reason: "account_exists",
      message: "Account already exists. Please sign in or resend the verification email.",
    };
  }

  return { ok: true, message: SIGN_UP_SUCCESS_MESSAGE };
}

/**
 * Signs in only after Supabase has confirmed the user's email address.
 */
export async function signInWithEmailPassword(
  client: SupabaseClient,
  input: { email: string; password: string },
): Promise<SignInResult> {
  const { data, error } = await client.auth.signInWithPassword({
    email: normalizeEmail(input.email),
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
      message: GENERIC_SIGN_IN_MESSAGE,
    };
  }

  if (!data.session) {
    return {
      ok: false,
      reason: "unknown",
      message: "Could not establish a session. Try again.",
    };
  }

  if (!data.user?.email_confirmed_at) {
    await client.auth.signOut();
    return {
      ok: false,
      reason: "email_not_confirmed",
      message: EMAIL_NOT_CONFIRMED_MESSAGE,
    };
  }

  return { ok: true, session: data.session };
}

export async function resendVerificationEmail(
  client: SupabaseClient,
  input: { email: string; emailRedirectTo: string },
): Promise<ResendVerificationResult> {
  const email = normalizeEmail(input.email);

  if (!email) {
    return {
      ok: false,
      reason: "email_required",
      message: "Enter your email address to resend verification.",
    };
  }

  const { error } = await client.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: input.emailRedirectTo,
    },
  });

  if (error) {
    if (isRateLimitedError(error)) {
      return {
        ok: false,
        reason: "rate_limited",
        message: "Please wait a moment before requesting another email.",
      };
    }

    return {
      ok: false,
      reason: "unknown",
      message: GENERIC_RESEND_MESSAGE,
    };
  }

  return { ok: true, message: RESEND_SUCCESS_MESSAGE };
}

export async function logout(client: SupabaseClient): Promise<AuthSuccess> {
  await client.auth.signOut();
  return { ok: true };
}
