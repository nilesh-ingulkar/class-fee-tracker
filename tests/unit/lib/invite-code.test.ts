import { afterEach, describe, expect, it, vi } from "vitest";
import { getExpectedInviteCode, isInviteCodeValid } from "@/lib/invite-code";

describe("invite code validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns expected code from INVITE_CODE env", () => {
    vi.stubEnv("INVITE_CODE", "MYFAMILY2026");
    expect(getExpectedInviteCode()).toBe("MYFAMILY2026");
  });

  it("rejects when INVITE_CODE is not configured", () => {
    vi.stubEnv("INVITE_CODE", "");
    expect(isInviteCodeValid("MYFAMILY2026")).toBe(false);
  });

  it("accepts a matching invite code", () => {
    vi.stubEnv("INVITE_CODE", "MYFAMILY2026");
    expect(isInviteCodeValid("MYFAMILY2026")).toBe(true);
  });

  it("rejects a wrong invite code", () => {
    vi.stubEnv("INVITE_CODE", "MYFAMILY2026");
    expect(isInviteCodeValid("WRONG-CODE")).toBe(false);
  });

  it("trims whitespace before compare", () => {
    vi.stubEnv("INVITE_CODE", "MYFAMILY2026");
    expect(isInviteCodeValid("  MYFAMILY2026  ")).toBe(true);
  });
});
