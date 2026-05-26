import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getEmailConfirmationRedirectUrl,
  signUpWithEmailPassword,
  SIGN_UP_SUCCESS_MESSAGE,
} from "@/lib/auth";
import type { SignUpApiErrorResponse, SignUpApiSuccessResponse } from "@/lib/auth/signup-api";
import { isInviteCodeValid } from "@/lib/invite-code";
import { createClient } from "@/lib/supabase/server";

const signUpBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteCode: z.string().min(1, "Invite code is required"),
  fullName: z.string().trim().optional(),
  emailRedirectTo: z.string().url().optional(),
});

/**
 * Server-only signup: validates INVITE_CODE before calling Supabase Auth.
 *
 * INVITE_CODE lives in server environment variables (never NEXT_PUBLIC_*).
 * On Vercel: Project → Settings → Environment Variables → add INVITE_CODE
 * for Production, Preview, and Development as needed, then redeploy.
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

  const { email, password, inviteCode, fullName, emailRedirectTo } = parsed.data;

  if (!isInviteCodeValid(inviteCode)) {
    return NextResponse.json<SignUpApiErrorResponse>(
      { error: "Invalid invite code", reason: "invalid_invite" },
      { status: 401 },
    );
  }

  const origin = new URL(request.url).origin;
  const redirectTo =
    emailRedirectTo ?? getEmailConfirmationRedirectUrl(origin);

  try {
    const supabase = await createClient();
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

    return NextResponse.json<SignUpApiSuccessResponse>({
      ok: true,
      message: result.message ?? SIGN_UP_SUCCESS_MESSAGE,
    });
  } catch {
    return NextResponse.json<SignUpApiErrorResponse>(
      { error: "Could not create your account. Try again." },
      { status: 500 },
    );
  }
}
