export type ExportKind = "sessions" | "payments";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildExportFilename(
  kind: ExportKind,
  childFilterLabel?: string,
  date = new Date(),
): string {
  const datePart = date.toISOString().slice(0, 10);
  const childPart =
    childFilterLabel && childFilterLabel.trim()
      ? `-${slugify(childFilterLabel)}`
      : "";
  return `class-fee-tracker-${kind}${childPart}-${datePart}.csv`;
}
