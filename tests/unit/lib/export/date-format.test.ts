import { describe, expect, it } from "vitest";
import { toIsoDateOnly } from "@/lib/export/date-format";

describe("toIsoDateOnly", () => {
  it("formats date as YYYY-MM-DD", () => {
    expect(toIsoDateOnly(new Date("2024-03-15T15:30:00"))).toBe("2024-03-15");
  });
});
