import { describe, expect, it } from "vitest";
import type { PaymentWithDetails } from "@/lib/app-data";
import {
  PAYMENT_EXPORT_COLUMNS,
  paymentsToExportRows,
} from "@/lib/export/payments";

function payment(overrides: Partial<PaymentWithDetails> = {}): PaymentWithDetails {
  return {
    id: "payment-1",
    classId: "class-1",
    amount: 45,
    currency: "USD",
    date: new Date("2024-03-16T00:00:00"),
    notes: "March session",
    childId: "child-1",
    className: "Piano Lessons",
    childName: "Emma Johnson",
    ...overrides,
  };
}

describe("PAYMENT_EXPORT_COLUMNS", () => {
  it("defines expected column order", () => {
    expect(PAYMENT_EXPORT_COLUMNS).toEqual([
      "Date",
      "Child",
      "Class",
      "Amount",
      "Currency",
      "Notes",
    ]);
  });
});

describe("paymentsToExportRows", () => {
  it("maps payment fields to export rows", () => {
    const rows = paymentsToExportRows([payment()]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual([
      "2024-03-16",
      "Emma Johnson",
      "Piano Lessons",
      45,
      "USD",
      "March session",
    ]);
  });

  it("exports numeric amount for spreadsheet formulas", () => {
    const rows = paymentsToExportRows([payment({ amount: 800 })]);
    expect(rows[0][3]).toBe(800);
    expect(typeof rows[0][3]).toBe("number");
  });

  it("uses empty string for missing notes", () => {
    const rows = paymentsToExportRows([payment({ notes: undefined })]);
    expect(rows[0][5]).toBe("");
  });
});
