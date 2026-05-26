import { describe, expect, it } from "vitest";
import {
  CSV_UTF8_BOM,
  escapeCsvCell,
  rowsToCsv,
} from "@/lib/export/csv";

describe("escapeCsvCell", () => {
  it("returns plain text unchanged", () => {
    expect(escapeCsvCell("Piano")).toBe("Piano");
  });

  it("wraps values containing commas", () => {
    expect(escapeCsvCell("Art, Music")).toBe('"Art, Music"');
  });

  it("escapes double quotes", () => {
    expect(escapeCsvCell('He said "hi"')).toBe('"He said ""hi"""');
  });

  it("wraps values containing newlines", () => {
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("handles null and undefined as empty", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });
});

describe("rowsToCsv", () => {
  it("includes UTF-8 BOM and header row", () => {
    const csv = rowsToCsv(["Name"], [["Emma"]]);
    expect(csv.startsWith(CSV_UTF8_BOM)).toBe(true);
    expect(csv).toContain("Name");
    expect(csv).toContain("Emma");
  });

  it("uses CRLF line endings", () => {
    const csv = rowsToCsv(["A", "B"], [["1", "2"]]);
    expect(csv).toContain("\r\n");
  });
});
