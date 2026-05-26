import type { SignUpFailureReason } from "@/lib/auth";

/** Body sent from the signup form to POST /api/auth/signup */
export type SignUpApiRequest = {
  email: string;
  password: string;
  inviteCode: string;
  fullName?: string;
  emailRedirectTo: string;
};

export type SignUpApiSuccessResponse = {
  ok: true;
  message: string;
};

export type SignUpApiErrorResponse = {
  error: string;
  reason?: SignUpFailureReason | "invalid_invite";
};

export type SignUpApiResponse =
  | SignUpApiSuccessResponse
  | SignUpApiErrorResponse;

export function isSignUpApiSuccess(
  body: SignUpApiResponse,
): body is SignUpApiSuccessResponse {
  return "ok" in body && body.ok === true;
}
