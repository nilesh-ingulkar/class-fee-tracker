import { describe, expect, it } from "vitest";
import {
  formatTimeForInput,
  parseTime24To12,
  snapTimeToFiveMinutes,
  toIsoDateOnly,
  toTime24Hour,
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

describe("12-hour time helpers", () => {
  it("converts between 24h storage and 12h parts", () => {
    expect(toTime24Hour(8, 30, "PM")).toBe("20:30");
    expect(parseTime24To12("20:30")).toEqual({
      hour12: 8,
      minute: 30,
      period: "PM",
    });
    expect(toTime24Hour(12, 0, "AM")).toBe("00:00");
    expect(toTime24Hour(12, 15, "PM")).toBe("12:15");
  });
});

describe("snapTimeToFiveMinutes", () => {
  it("rounds to the nearest 5-minute mark", () => {
    expect(snapTimeToFiveMinutes("09:32")).toBe("09:30");
    expect(snapTimeToFiveMinutes("09:33")).toBe("09:35");
    expect(snapTimeToFiveMinutes("14:58")).toBe("15:00");
  });
});
