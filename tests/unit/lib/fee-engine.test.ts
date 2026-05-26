import { describe, expect, it } from "vitest";
import {
  calculateClassBalance,
  getEffectiveFeeAmount,
} from "@/lib/fee-engine";
import type { FeeRule, Payment, Session } from "@/lib/types";

const CLASS_ID = "class-1";

function session(
  id: string,
  date: string,
  status: Session["status"],
): Session {
  return {
    id,
    classId: CLASS_ID,
    date: new Date(`${date}T10:00:00`),
    startTime: "10:00",
    endTime: "11:00",
    status,
  };
}

function feeRule(
  id: string,
  amount: number,
  effectiveFrom: string,
  effectiveTo?: string,
): FeeRule {
  return {
    id,
    classId: CLASS_ID,
    amount,
    effectiveFrom: new Date(`${effectiveFrom}T00:00:00`),
    effectiveTo: effectiveTo ? new Date(`${effectiveTo}T00:00:00`) : undefined,
  };
}

function payment(id: string, amount: number, date = "2024-03-01"): Payment {
  return {
    id,
    classId: CLASS_ID,
    amount,
    currency: "USD",
    date: new Date(`${date}T00:00:00`),
  };
}

describe("getEffectiveFeeAmount", () => {
  it("returns fallback when no fee rules exist", () => {
    expect(getEffectiveFeeAmount([], new Date("2024-06-01"), 50)).toBe(50);
  });

  it("returns fallback when no rule covers the session date", () => {
    const rules = [feeRule("r1", 40, "2024-01-01", "2024-03-31")];
    expect(
      getEffectiveFeeAmount(rules, new Date("2024-04-01T12:00:00"), 50),
    ).toBe(50);
  });

  it("uses the rule amount when session date is within range", () => {
    const rules = [feeRule("r1", 40, "2024-01-01", "2024-12-31")];
    expect(
      getEffectiveFeeAmount(rules, new Date("2024-06-15T12:00:00"), 50),
    ).toBe(40);
  });

  it("includes session date on effectiveFrom boundary", () => {
    const rules = [feeRule("r1", 40, "2024-06-01")];
    expect(
      getEffectiveFeeAmount(rules, new Date("2024-06-01T12:00:00"), 50),
    ).toBe(40);
  });

  it("includes session date on effectiveTo boundary", () => {
    const rules = [feeRule("r1", 40, "2024-01-01", "2024-06-30")];
    expect(
      getEffectiveFeeAmount(rules, new Date("2024-06-30T12:00:00"), 50),
    ).toBe(40);
  });

  it("excludes session date after effectiveTo", () => {
    const rules = [feeRule("r1", 40, "2024-01-01", "2024-06-30")];
    expect(
      getEffectiveFeeAmount(rules, new Date("2024-07-01T12:00:00"), 50),
    ).toBe(50);
  });

  it("picks the most recent rule when multiple rules overlap", () => {
    const rules = [
      feeRule("old", 30, "2024-01-01"),
      feeRule("new", 45, "2024-06-01"),
    ];
    expect(getEffectiveFeeAmount(rules, new Date("2024-06-15T12:00:00"), 50)).toBe(45);
  });

  it("applies fee change mid-cycle per session date", () => {
    const rules = [
      feeRule("old", 30, "2024-01-01", "2024-05-31"),
      feeRule("new", 45, "2024-06-01"),
    ];

    expect(
      getEffectiveFeeAmount(rules, new Date("2024-05-15T12:00:00"), 50),
    ).toBe(30);
    expect(
      getEffectiveFeeAmount(rules, new Date("2024-06-15T12:00:00"), 50),
    ).toBe(45);
  });

  it("supports open-ended rules without effectiveTo", () => {
    const rules = [feeRule("open", 55, "2024-01-01")];
    expect(getEffectiveFeeAmount(rules, new Date("2025-12-31T12:00:00"), 50)).toBe(55);
  });
});

describe("calculateClassBalance — PER_CLASS billing", () => {
  it("bills only completed sessions", () => {
    const result = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 50,
      sessions: [
        session("s1", "2024-03-01", "completed"),
        session("s2", "2024-03-08", "scheduled"),
        session("s3", "2024-03-15", "cancelled"),
      ],
      payments: [],
      feeRules: [],
    });

    expect(result.totalFees).toBe(50);
    expect(result.balance).toBe(50);
    expect(result.creditBalance).toBe(0);
  });

  it("sums per-session fees using historical fee rules", () => {
    const result = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 50,
      sessions: [
        session("s1", "2024-05-15", "completed"),
        session("s2", "2024-06-15", "completed"),
      ],
      payments: [],
      feeRules: [
        feeRule("old", 30, "2024-01-01", "2024-05-31"),
        feeRule("new", 45, "2024-06-01"),
      ],
    });

    expect(result.totalFees).toBe(75);
  });

  it("returns zero fees when there are no completed sessions", () => {
    const result = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 50,
      sessions: [session("s1", "2024-03-01", "scheduled")],
      payments: [],
      feeRules: [],
    });

    expect(result.totalFees).toBe(0);
    expect(result.balance).toBe(0);
  });

  it("handles partial payments", () => {
    const result = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 50,
      sessions: [
        session("s1", "2024-03-01", "completed"),
        session("s2", "2024-03-08", "completed"),
      ],
      payments: [payment("p1", 60)],
      feeRules: [],
    });

    expect(result.totalFees).toBe(100);
    expect(result.totalPaid).toBe(60);
    expect(result.balance).toBe(40);
    expect(result.creditBalance).toBe(0);
  });

  it("handles exact payment with zero balance", () => {
    const result = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 50,
      sessions: [session("s1", "2024-03-01", "completed")],
      payments: [payment("p1", 50)],
      feeRules: [],
    });

    expect(result.balance).toBe(0);
    expect(result.creditBalance).toBe(0);
  });

  it("handles overpayments as credit balance", () => {
    const result = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 50,
      sessions: [session("s1", "2024-03-01", "completed")],
      payments: [payment("p1", 80)],
      feeRules: [],
    });

    expect(result.totalFees).toBe(50);
    expect(result.totalPaid).toBe(80);
    expect(result.balance).toBe(0);
    expect(result.creditBalance).toBe(30);
  });

  it("sums multiple payments", () => {
    const result = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 40,
      sessions: [session("s1", "2024-03-01", "completed")],
      payments: [payment("p1", 10), payment("p2", 15)],
      feeRules: [],
    });

    expect(result.totalPaid).toBe(25);
    expect(result.balance).toBe(15);
  });
});

describe("calculateClassBalance — MONTHLY billing", () => {
  it("uses current fee amount regardless of session count", () => {
    const result = calculateClassBalance({
      billingType: "MONTHLY",
      currentFeeAmount: 200,
      sessions: [
        session("s1", "2024-03-01", "completed"),
        session("s2", "2024-03-08", "completed"),
        session("s3", "2024-03-15", "scheduled"),
      ],
      payments: [],
      feeRules: [],
    });

    expect(result.totalFees).toBe(200);
  });

  it("does not add fees for completed sessions beyond the monthly amount", () => {
    const result = calculateClassBalance({
      billingType: "MONTHLY",
      currentFeeAmount: 200,
      sessions: [
        session("s1", "2024-03-01", "completed"),
        session("s2", "2024-03-08", "completed"),
      ],
      payments: [payment("p1", 200)],
      feeRules: [],
    });

    expect(result.totalFees).toBe(200);
    expect(result.balance).toBe(0);
    expect(result.creditBalance).toBe(0);
  });

  it("handles partial monthly payment", () => {
    const result = calculateClassBalance({
      billingType: "MONTHLY",
      currentFeeAmount: 200,
      sessions: [],
      payments: [payment("p1", 75)],
      feeRules: [],
    });

    expect(result.balance).toBe(125);
    expect(result.creditBalance).toBe(0);
  });

  it("handles monthly overpayment as credit", () => {
    const result = calculateClassBalance({
      billingType: "MONTHLY",
      currentFeeAmount: 200,
      sessions: [],
      payments: [payment("p1", 250)],
      feeRules: [],
    });

    expect(result.balance).toBe(0);
    expect(result.creditBalance).toBe(50);
  });
});

describe("calculateClassBalance — currency isolation", () => {
  it("calculates balance independently per class input", () => {
    const usd = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 45,
      sessions: [session("s1", "2024-03-01", "completed")],
      payments: [payment("p1", 45)],
      feeRules: [],
    });

    const inr = calculateClassBalance({
      billingType: "PER_CLASS",
      currentFeeAmount: 800,
      sessions: [session("s2", "2024-03-01", "completed")],
      payments: [payment("p2", 400)],
      feeRules: [],
    });

    expect(usd.balance).toBe(0);
    expect(inr.balance).toBe(400);
  });
});
