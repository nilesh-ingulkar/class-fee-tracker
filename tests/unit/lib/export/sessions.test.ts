import { describe, expect, it } from "vitest";
import type { SessionWithDetails } from "@/lib/app-data";
import {
  SESSION_EXPORT_COLUMNS,
  sessionsToExportRows,
} from "@/lib/export/sessions";

function session(overrides: Partial<SessionWithDetails> = {}): SessionWithDetails {
  return {
    id: "session-1",
    classId: "class-1",
    date: new Date("2024-03-15T10:00:00"),
    startTime: "10:00",
    endTime: "11:00",
    status: "completed",
    childId: "child-1",
    className: "Piano Lessons",
    childName: "Emma Johnson",
    teacherName: "Sarah Williams",
    notes: "Practice scales",
    ...overrides,
  };
}

describe("SESSION_EXPORT_COLUMNS", () => {
  it("defines expected column order", () => {
    expect(SESSION_EXPORT_COLUMNS).toEqual([
      "Date",
      "Time",
      "Child",
      "Class",
      "Teacher",
      "Status",
      "Notes",
    ]);
  });
});

describe("sessionsToExportRows", () => {
  it("maps session fields to export rows", () => {
    const rows = sessionsToExportRows([session()]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual([
      "2024-03-15",
      "10:00",
      "Emma Johnson",
      "Piano Lessons",
      "Sarah Williams",
      "Completed",
      "Practice scales",
    ]);
  });

  it("formats status labels in title case", () => {
    expect(sessionsToExportRows([session({ status: "scheduled" })])[0][5]).toBe(
      "Scheduled",
    );
    expect(sessionsToExportRows([session({ status: "cancelled" })])[0][5]).toBe(
      "Cancelled",
    );
  });

  it("uses empty string for missing time and notes", () => {
    const rows = sessionsToExportRows([
      session({ startTime: "", notes: undefined }),
    ]);
    expect(rows[0][1]).toBe("");
    expect(rows[0][6]).toBe("");
  });
});
