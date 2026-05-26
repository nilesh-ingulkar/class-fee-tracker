import type { SessionWithDetails } from "@/lib/app-data";
import type { SessionStatus } from "@/lib/types";
import { toIsoDateOnly } from "@/lib/export/date-format";

export const SESSION_EXPORT_COLUMNS = [
  "Date",
  "Time",
  "Child",
  "Class",
  "Teacher",
  "Status",
  "Notes",
] as const;

function formatSessionStatus(status: SessionStatus): string {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function sessionsToExportRows(
  sessions: SessionWithDetails[],
): (string | number)[][] {
  return sessions.map((session) => [
    toIsoDateOnly(new Date(session.date)),
    session.startTime || "",
    session.childName,
    session.className,
    session.teacherName,
    formatSessionStatus(session.status),
    session.notes ?? "",
  ]);
}
