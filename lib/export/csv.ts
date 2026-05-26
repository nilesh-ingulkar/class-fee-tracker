export const CSV_UTF8_BOM = "\uFEFF";

export function escapeCsvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function rowsToCsv(
  headers: readonly string[],
  rows: readonly (readonly (string | number)[])[],
): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return `${CSV_UTF8_BOM}${lines.join("\r\n")}`;
}
