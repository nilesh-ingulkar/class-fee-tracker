import { timingSafeEqual } from "node:crypto";

/**
 * Invite codes must be validated on the server only.
 * Never compare INVITE_CODE in the browser — it would expose the secret
 * via NEXT_PUBLIC_* or allow bypassing checks by skipping client logic.
 *
 * Set INVITE_CODE in `.env.local` (local) or Vercel Project Settings →
 * Environment Variables (production). Do not prefix with NEXT_PUBLIC_.
 */
export function getExpectedInviteCode(): string | null {
  const value = process.env.INVITE_CODE?.trim();
  return value && value.length > 0 ? value : null;
}

function timingSafeEqualStrings(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * Returns true when the provided code matches INVITE_CODE (constant-time).
 */
export function isInviteCodeValid(provided: string): boolean {
  const expected = getExpectedInviteCode();
  if (!expected) {
    return false;
  }

  return timingSafeEqualStrings(provided.trim(), expected);
}
