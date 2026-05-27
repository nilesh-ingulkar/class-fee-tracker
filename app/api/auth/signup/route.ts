import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getEmailConfirmationRedirectUrl,
  signUpWithEmailPassword,
  SIGN_UP_SUCCESS_MESSAGE,
} from "@/lib/auth";
import type { SignUpApiErrorResponse, SignUpApiSuccessResponse } from "@/lib/auth/signup-api";
import { isInviteCodeValid } from "@/lib/invite-code";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

const signUpBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteCode: z.string().min(1, "Invite code is required"),
  fullName: z.string().trim().optional(),
});

/**
 * Server-only signup: validates INVITE_CODE before calling Supabase Auth.
 * Uses a cookie-aware Supabase client so PKCE code_verifier is stored in the
 * browser that submitted signup (required for email confirmation links).
 */
export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json<SignUpApiErrorResponse>(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = signUpBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json<SignUpApiErrorResponse>(
      { error: "Please check your email, password, and invite code." },
      { status: 400 },
    );
  }

  const { email, password, inviteCode, fullName } = parsed.data;

  if (!isInviteCodeValid(inviteCode)) {
    return NextResponse.json<SignUpApiErrorResponse>(
      { error: "Invalid invite code", reason: "invalid_invite" },
      { status: 401 },
    );
  }

  const requestOrigin = new URL(request.url).origin;
  const redirectTo = getEmailConfirmationRedirectUrl(requestOrigin);

  try {
    const response = NextResponse.json<SignUpApiSuccessResponse>({
      ok: true,
      message: SIGN_UP_SUCCESS_MESSAGE,
    });
    const supabase = await createRouteHandlerClient(response);
    const result = await signUpWithEmailPassword(supabase, {
      email,
      password,
      fullName: fullName || undefined,
      emailRedirectTo: redirectTo,
    });

    if (!result.ok) {
      const status = result.reason === "rate_limited" ? 429 : 400;
      return NextResponse.json<SignUpApiErrorResponse>(
        { error: result.message, reason: result.reason },
        { status },
      );
    }

    return response;
  } catch {
    return NextResponse.json<SignUpApiErrorResponse>(
      { error: "Could not create your account. Try again." },
      { status: 500 },
    );
  }
}
