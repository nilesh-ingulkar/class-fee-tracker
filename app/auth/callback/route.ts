import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getPostEmailVerificationRedirectPath } from "@/lib/auth";
import { resolveSiteUrl } from "@/lib/site-url";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

/**
 * Supabase email-confirmation handler (not the final page users see).
 * Confirms the account, then redirects to /login so the user signs in explicitly.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const siteOrigin = resolveSiteUrl(requestUrl.origin);
  const next = getPostEmailVerificationRedirectPath(
    requestUrl.searchParams.get("next"),
  );
  const successUrl = `${siteOrigin}${next}`;
  const errorUrl = `${siteOrigin}/login?error=auth_callback`;

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const typeParam = requestUrl.searchParams.get("type");
  const otpType =
    typeParam && OTP_TYPES.has(typeParam as EmailOtpType)
      ? (typeParam as EmailOtpType)
      : null;

  const response = NextResponse.redirect(errorUrl);
  const supabase = await createRouteHandlerClient(response);

  let success = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    success = !error;
  } else if (tokenHash && otpType) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    success = !error;
  }

  if (success) {
    // Confirmation may create a session; sign out so the user must sign in with password.
    await supabase.auth.signOut();
    response.headers.set("Location", successUrl);
  }

  return response;
}
