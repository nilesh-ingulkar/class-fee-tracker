import { describe, expect, it } from "vitest";
import { formatCurrency, getCurrencySymbol } from "@/lib/types";

describe("formatCurrency", () => {
  it("formats USD with dollar symbol", () => {
    expect(formatCurrency(45, "USD")).toBe("$45.00");
  });

  it("formats INR with rupee symbol", () => {
    expect(formatCurrency(800, "INR")).toBe("₹800.00");
  });

  it("formats unknown currency with code prefix", () => {
    expect(formatCurrency(100, "EUR")).toBe("EUR 100.00");
  });

  it("includes thousands separators", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });
});

describe("getCurrencySymbol", () => {
  it("returns known symbols", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("INR")).toBe("₹");
  });

  it("returns the currency code for unknown currencies", () => {
    expect(getCurrencySymbol("EUR")).toBe("EUR");
  });
});
