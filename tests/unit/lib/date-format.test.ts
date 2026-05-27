import { describe, expect, it } from "vitest";
import {
  formatTimeForInput,
  snapTimeToFiveMinutes,
  toIsoDateOnly,
} from "@/lib/export/date-format";

describe("toIsoDateOnly", () => {
  it("formats using local calendar date", () => {
    expect(toIsoDateOnly(new Date("2024-06-15T15:30:00"))).toBe("2024-06-15");
  });
});

describe("formatTimeForInput", () => {
  it("returns empty string for missing values", () => {
    expect(formatTimeForInput(null)).toBe("");
    expect(formatTimeForInput("")).toBe("");
  });

  it("normalizes Postgres time to HH:MM", () => {
    expect(formatTimeForInput("9:30:00")).toBe("09:30");
    expect(formatTimeForInput("14:05:00")).toBe("14:05");
  });
});

describe("snapTimeToFiveMinutes", () => {
  it("rounds to the nearest 5-minute mark", () => {
    expect(snapTimeToFiveMinutes("09:32")).toBe("09:30");
    expect(snapTimeToFiveMinutes("09:33")).toBe("09:35");
    expect(snapTimeToFiveMinutes("14:58")).toBe("15:00");
  });
});
