import { describe, expect, it } from "vitest";
import { getInitials, getUserDisplayName } from "@/lib/user-display";

describe("getUserDisplayName", () => {
  it("prefers full_name from user metadata", () => {
    expect(
      getUserDisplayName({
        email: "john@example.com",
        user_metadata: { full_name: "John Doe" },
      }),
    ).toBe("John Doe");
  });

  it("falls back to name metadata when full_name is missing", () => {
    expect(
      getUserDisplayName({
        email: "john@example.com",
        user_metadata: { name: "John Doe" },
      }),
    ).toBe("John Doe");
  });

  it("uses email local part when metadata names are empty", () => {
    expect(
      getUserDisplayName({
        email: "john@example.com",
        user_metadata: { full_name: "   " },
      }),
    ).toBe("john");
  });

  it("returns User when no user is provided", () => {
    expect(getUserDisplayName(null)).toBe("User");
    expect(getUserDisplayName(undefined)).toBe("User");
  });

  it("trims whitespace from metadata names", () => {
    expect(
      getUserDisplayName({
        email: "jane@example.com",
        user_metadata: { full_name: "  Jane Smith  " },
      }),
    ).toBe("Jane Smith");
  });
});

describe("getInitials", () => {
  it("returns first letters of first and last name", () => {
    expect(getInitials("Sarah Williams")).toBe("SW");
  });

  it("handles multiple spaces between names", () => {
    expect(getInitials("Sarah   Williams")).toBe("SW");
  });

  it("returns first two characters for single-word names", () => {
    expect(getInitials("Priya")).toBe("PR");
  });

  it("returns U for empty or missing values", () => {
    expect(getInitials("")).toBe("U");
    expect(getInitials("   ")).toBe("U");
    expect(getInitials(null)).toBe("U");
    expect(getInitials(undefined)).toBe("U");
  });

  it("uppercases initials", () => {
    expect(getInitials("emma johnson")).toBe("EJ");
  });
});
