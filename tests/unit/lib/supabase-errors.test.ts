import { describe, expect, it } from "vitest";
import { getMutationErrorMessage } from "@/lib/supabase/errors";

describe("getMutationErrorMessage", () => {
  it("maps failed fetch to a helpful message", () => {
    expect(
      getMutationErrorMessage(
        new TypeError("Failed to fetch"),
        "Could not update class.",
      ),
    ).toContain("Could not reach Supabase");
  });

  it("returns postgrest message when present", () => {
    expect(
      getMutationErrorMessage({ message: "row-level security" }, "fallback"),
    ).toBe("row-level security");
  });

  it("returns fallback for unknown errors", () => {
    expect(getMutationErrorMessage(null, "Could not update class.")).toBe(
      "Could not update class.",
    );
  });
});
