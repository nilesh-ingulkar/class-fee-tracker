import { describe, expect, it } from "vitest";
import { buildExportFilename } from "@/lib/export/filename";

describe("buildExportFilename", () => {
  const fixedDate = new Date("2026-05-25T12:00:00");

  it("builds default sessions filename", () => {
    expect(buildExportFilename("sessions", undefined, fixedDate)).toBe(
      "class-fee-tracker-sessions-2026-05-25.csv",
    );
  });

  it("builds default payments filename", () => {
    expect(buildExportFilename("payments", undefined, fixedDate)).toBe(
      "class-fee-tracker-payments-2026-05-25.csv",
    );
  });

  it("slugifies child name in filename", () => {
    expect(buildExportFilename("sessions", "Emma Johnson", fixedDate)).toBe(
      "class-fee-tracker-sessions-emma-johnson-2026-05-25.csv",
    );
  });

  it("ignores empty child label", () => {
    expect(buildExportFilename("payments", "   ", fixedDate)).toBe(
      "class-fee-tracker-payments-2026-05-25.csv",
    );
  });
});
