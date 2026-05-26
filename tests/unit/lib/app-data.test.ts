import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  emptyAppData,
  getAllClassesWithDetails,
  getAllPaymentsWithDetails,
  getAllSessionsWithDetails,
  getChildClasses,
  getClassWithDetails,
  getDashboardStats,
  getUpcomingSessions,
  type AppData,
} from "@/lib/app-data";
import type { Class, FeeRule, Payment, Session } from "@/lib/types";

const child = {
  id: "child-1",
  userId: "user-1",
  name: "Emma Johnson",
  createdAt: new Date("2024-01-15"),
};

const teacher = {
  id: "teacher-1",
  userId: "user-1",
  name: "Sarah Williams",
  isActive: true,
};

const teacherInactive = {
  id: "teacher-2",
  userId: "user-1",
  name: "Inactive Teacher",
  isActive: false,
};

const perClass: Class = {
  id: "class-1",
  childId: "child-1",
  teacherId: "teacher-1",
  name: "Piano Lessons",
  billingType: "PER_CLASS",
  currency: "USD",
  feeAmount: 45,
  isActive: true,
  createdAt: new Date("2024-01-20"),
};

const monthlyClass: Class = {
  id: "class-2",
  childId: "child-1",
  teacherId: "teacher-1",
  name: "Art Class",
  billingType: "MONTHLY",
  currency: "USD",
  feeAmount: 200,
  isActive: true,
  createdAt: new Date("2024-02-01"),
};

const inrClass: Class = {
  id: "class-3",
  childId: "child-1",
  teacherId: "teacher-1",
  name: "Math Tutoring",
  billingType: "PER_CLASS",
  currency: "INR",
  feeAmount: 800,
  isActive: false,
  createdAt: new Date("2024-03-01"),
};

function session(
  id: string,
  classId: string,
  date: string,
  status: Session["status"],
): Session {
  return {
    id,
    classId,
    date: new Date(`${date}T10:00:00`),
    startTime: "10:00",
    endTime: "11:00",
    status,
  };
}

function payment(
  id: string,
  classId: string,
  amount: number,
  currency: string,
): Payment {
  return {
    id,
    classId,
    amount,
    currency,
    date: new Date("2024-03-01"),
  };
}

function feeRule(classId: string, amount: number): FeeRule {
  return {
    id: `fee-${classId}`,
    classId,
    amount,
    effectiveFrom: new Date("2024-01-01"),
  };
}

function buildAppData(overrides: Partial<AppData> = {}): AppData {
  return {
    children: [child],
    teachers: [teacher, teacherInactive],
    classes: [perClass, monthlyClass, inrClass],
    sessions: [
      session("s1", "class-1", "2024-03-15", "completed"),
      session("s2", "class-1", "2024-03-22", "completed"),
      session("s3", "class-1", "2024-03-29", "cancelled"),
      session("s4", "class-1", "2024-04-05", "scheduled"),
      session("s5", "class-2", "2024-03-10", "completed"),
    ],
    payments: [
      payment("p1", "class-1", 45, "USD"),
      payment("p2", "class-1", 45, "USD"),
      payment("p3", "class-2", 200, "USD"),
      payment("p4", "class-3", 400, "INR"),
    ],
    feeRules: [
      feeRule("class-1", 45),
      feeRule("class-2", 200),
      feeRule("class-3", 800),
    ],
    currencies: [
      { id: "cur-usd", code: "USD", symbol: "$", name: "US Dollar", isActive: true },
      { id: "cur-inr", code: "INR", symbol: "₹", name: "Indian Rupee", isActive: true },
    ],
    ...overrides,
  };
}

describe("getClassWithDetails", () => {
  it("returns null for unknown class", () => {
    expect(getClassWithDetails(buildAppData(), "missing")).toBeNull();
  });

  it("returns null when child or teacher is missing", () => {
    const data = buildAppData({
      classes: [{ ...perClass, childId: "missing-child" }],
    });
    expect(getClassWithDetails(data, "class-1")).toBeNull();
  });

  it("calculates PER_CLASS balance excluding cancelled sessions", () => {
    const details = getClassWithDetails(buildAppData(), "class-1");
    expect(details).not.toBeNull();
    expect(details?.totalFees).toBe(90);
    expect(details?.totalPaid).toBe(90);
    expect(details?.balance).toBe(0);
    expect(details?.creditBalance).toBe(0);
  });

  it("calculates MONTHLY balance from current fee amount", () => {
    const details = getClassWithDetails(buildAppData(), "class-2");
    expect(details?.totalFees).toBe(200);
    expect(details?.balance).toBe(0);
  });

  it("tracks partial payment and credit separately by class", () => {
    const details = getClassWithDetails(buildAppData(), "class-3");
    expect(details?.totalFees).toBe(0);
    expect(details?.totalPaid).toBe(400);
    expect(details?.balance).toBe(0);
    expect(details?.creditBalance).toBe(400);
  });
});

describe("getAllClassesWithDetails", () => {
  it("filters out invalid class records", () => {
    const data = buildAppData({
      classes: [perClass, { ...monthlyClass, teacherId: "missing-teacher" }],
    });
    expect(getAllClassesWithDetails(data)).toHaveLength(1);
  });
});

describe("getChildClasses", () => {
  it("returns only classes for the requested child", () => {
    const data = buildAppData({
      children: [
        child,
        { id: "child-2", userId: "user-1", name: "Liam", createdAt: new Date() },
      ],
      classes: [perClass, { ...monthlyClass, childId: "child-2" }],
    });

    expect(getChildClasses(data, "child-1")).toHaveLength(1);
    expect(getChildClasses(data, "child-1")[0]?.id).toBe("class-1");
  });
});

describe("getDashboardStats", () => {
  it("aggregates outstanding and paid totals by currency", () => {
    const stats = getDashboardStats(buildAppData());
    expect(stats.totalOutstanding.USD).toBe(0);
    expect(stats.totalPaid.USD).toBe(290);
    expect(stats.totalPaid.INR).toBe(400);
    expect(stats.activeClassesCount).toBe(2);
    expect(stats.childrenCount).toBe(1);
  });

  it("includes positive balances in outstanding totals", () => {
    const data: AppData = {
      children: [child],
      teachers: [teacher],
      classes: [perClass],
      sessions: [session("s-only", "class-1", "2024-03-15", "completed")],
      payments: [],
      feeRules: [feeRule("class-1", 45)],
      currencies: [],
    };
    const stats = getDashboardStats(data);
    expect(stats.totalOutstanding.USD).toBe(45);
  });

  it("returns empty aggregates for empty data", () => {
    const stats = getDashboardStats(emptyAppData);
    expect(stats.totalOutstanding).toEqual({});
    expect(stats.totalPaid).toEqual({});
    expect(stats.activeClassesCount).toBe(0);
    expect(stats.childrenCount).toBe(0);
  });
});

describe("getUpcomingSessions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-04-01T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns scheduled sessions on or after today", () => {
    const upcoming = getUpcomingSessions(buildAppData());
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0]?.id).toBe("s4");
    expect(upcoming[0]?.className).toBe("Piano Lessons");
    expect(upcoming[0]?.childName).toBe("Emma Johnson");
  });

  it("excludes completed and cancelled sessions", () => {
    const data = buildAppData({
      sessions: [
        session("done", "class-1", "2024-04-10", "completed"),
        session("cancelled", "class-1", "2024-04-11", "cancelled"),
      ],
    });
    expect(getUpcomingSessions(data)).toHaveLength(0);
  });

  it("limits results to five sessions", () => {
    const sessions = Array.from({ length: 7 }, (_, index) =>
      session(
        `future-${index}`,
        "class-1",
        `2024-04-${String(index + 2).padStart(2, "0")}`,
        "scheduled",
      ),
    );
    expect(getUpcomingSessions(buildAppData({ sessions }))).toHaveLength(5);
  });
});

describe("getAllSessionsWithDetails", () => {
  it("enriches sessions with child, class, and teacher names", () => {
    const sessions = getAllSessionsWithDetails(buildAppData());
    const pianoSession = sessions.find((item) => item.id === "s1");
    expect(pianoSession?.className).toBe("Piano Lessons");
    expect(pianoSession?.childName).toBe("Emma Johnson");
    expect(pianoSession?.teacherName).toBe("Sarah Williams");
  });

  it("sorts sessions newest first", () => {
    const sessions = getAllSessionsWithDetails(buildAppData());
    expect(sessions[0]?.date.getTime()).toBeGreaterThanOrEqual(
      sessions[sessions.length - 1]?.date.getTime() ?? 0,
    );
  });
});

describe("getAllPaymentsWithDetails", () => {
  it("enriches payments with child and class names", () => {
    const payments = getAllPaymentsWithDetails(buildAppData());
    const paymentItem = payments.find((item) => item.id === "p1");
    expect(paymentItem?.className).toBe("Piano Lessons");
    expect(paymentItem?.childName).toBe("Emma Johnson");
    expect(paymentItem?.childId).toBe("child-1");
  });

  it("sorts payments newest first", () => {
    const payments = getAllPaymentsWithDetails(buildAppData());
    expect(payments.length).toBeGreaterThan(1);
    expect(payments[0]?.date.getTime()).toBeGreaterThanOrEqual(
      payments[payments.length - 1]?.date.getTime() ?? 0,
    );
  });
});
