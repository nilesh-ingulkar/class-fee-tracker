import type {
  Child,
  Teacher,
  Class,
  Session,
  Payment,
  FeeRule,
  ClassWithDetails,
  DashboardStats,
} from "./types";
import { calculateClassBalance } from "./fee-engine";

export const mockChildren: Child[] = [
  {
    id: "child-1",
    userId: "user-1",
    name: "Emma Johnson",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "child-2",
    userId: "user-1",
    name: "Liam Johnson",
    createdAt: new Date("2024-02-20"),
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: "teacher-1",
    userId: "user-1",
    name: "Sarah Williams",
    isActive: true,
    email: "sarah@music.com",
    phone: "+1 555-0101",
  },
  {
    id: "teacher-2",
    userId: "user-1",
    name: "Michael Chen",
    isActive: true,
    email: "michael@art.com",
    phone: "+1 555-0102",
  },
  {
    id: "teacher-3",
    userId: "user-1",
    name: "Priya Sharma",
    isActive: true,
    email: "priya@math.com",
    phone: "+91 98765-43210",
  },
];

export const mockClasses: Class[] = [
  {
    id: "class-1",
    childId: "child-1",
    teacherId: "teacher-1",
    name: "Piano Lessons",
    billingType: "PER_CLASS",
    currency: "USD",
    feeAmount: 45,
    isActive: true,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "class-2",
    childId: "child-1",
    teacherId: "teacher-2",
    name: "Art Class",
    billingType: "MONTHLY",
    currency: "USD",
    feeAmount: 200,
    isActive: true,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "class-3",
    childId: "child-2",
    teacherId: "teacher-3",
    name: "Math Tutoring",
    billingType: "PER_CLASS",
    currency: "INR",
    feeAmount: 800,
    isActive: true,
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "class-4",
    childId: "child-2",
    teacherId: "teacher-1",
    name: "Guitar Lessons",
    billingType: "MONTHLY",
    currency: "USD",
    feeAmount: 180,
    isActive: false,
    createdAt: new Date("2024-01-15"),
  },
];

export const mockSessions: Session[] = [
  // Piano Lessons sessions
  {
    id: "session-1",
    classId: "class-1",
    date: new Date("2024-03-15"),
    startTime: "10:00",
    endTime: "11:00",
    status: "completed",
  },
  {
    id: "session-2",
    classId: "class-1",
    date: new Date("2024-03-22"),
    startTime: "10:00",
    endTime: "11:00",
    status: "completed",
  },
  {
    id: "session-3",
    classId: "class-1",
    date: new Date("2024-03-29"),
    startTime: "10:00",
    endTime: "11:00",
    status: "cancelled",
    notes: "Teacher unavailable",
  },
  {
    id: "session-4",
    classId: "class-1",
    date: new Date("2024-04-05"),
    startTime: "10:00",
    endTime: "11:00",
    status: "scheduled",
  },
  {
    id: "session-5",
    classId: "class-1",
    date: new Date("2024-04-12"),
    startTime: "10:00",
    endTime: "11:00",
    status: "scheduled",
  },
  // Art Class sessions
  {
    id: "session-6",
    classId: "class-2",
    date: new Date("2024-03-10"),
    startTime: "14:00",
    endTime: "15:30",
    status: "completed",
  },
  {
    id: "session-7",
    classId: "class-2",
    date: new Date("2024-03-17"),
    startTime: "14:00",
    endTime: "15:30",
    status: "completed",
  },
  {
    id: "session-8",
    classId: "class-2",
    date: new Date("2024-03-24"),
    startTime: "14:00",
    endTime: "15:30",
    status: "scheduled",
  },
  // Math Tutoring sessions
  {
    id: "session-9",
    classId: "class-3",
    date: new Date("2024-03-12"),
    startTime: "16:00",
    endTime: "17:00",
    status: "completed",
  },
  {
    id: "session-10",
    classId: "class-3",
    date: new Date("2024-03-19"),
    startTime: "16:00",
    endTime: "17:00",
    status: "completed",
  },
  {
    id: "session-11",
    classId: "class-3",
    date: new Date("2024-03-26"),
    startTime: "16:00",
    endTime: "17:00",
    status: "scheduled",
  },
  {
    id: "session-12",
    classId: "class-3",
    date: new Date("2024-04-02"),
    startTime: "16:00",
    endTime: "17:00",
    status: "scheduled",
  },
];

export const mockPayments: Payment[] = [
  {
    id: "payment-1",
    classId: "class-1",
    amount: 45,
    currency: "USD",
    date: new Date("2024-03-16"),
    notes: "Payment for March 15 session",
  },
  {
    id: "payment-2",
    classId: "class-1",
    amount: 45,
    currency: "USD",
    date: new Date("2024-03-23"),
    notes: "Payment for March 22 session",
  },
  {
    id: "payment-3",
    classId: "class-2",
    amount: 200,
    currency: "USD",
    date: new Date("2024-03-01"),
    notes: "March monthly fee",
  },
  {
    id: "payment-4",
    classId: "class-3",
    amount: 800,
    currency: "INR",
    date: new Date("2024-03-13"),
    notes: "Payment for March 12 session",
  },
];

export const mockFeeRules: FeeRule[] = mockClasses.map((classItem) => ({
  id: `fee-rule-${classItem.id}`,
  classId: classItem.id,
  amount: classItem.feeAmount,
  effectiveFrom: classItem.createdAt,
}));

export function getClassWithDetails(classId: string): ClassWithDetails | null {
  const classItem = mockClasses.find((c) => c.id === classId);
  if (!classItem) return null;

  const child = mockChildren.find((c) => c.id === classItem.childId);
  const teacher = mockTeachers.find((t) => t.id === classItem.teacherId);
  const sessions = mockSessions.filter((s) => s.classId === classId);
  const payments = mockPayments.filter((p) => p.classId === classId);
  const feeRules = mockFeeRules.filter((rule) => rule.classId === classId);

  if (!child || !teacher) return null;

  const balance = calculateClassBalance({
    billingType: classItem.billingType,
    currentFeeAmount: classItem.feeAmount,
    sessions,
    payments,
    feeRules,
  });

  return {
    ...classItem,
    child,
    teacher,
    sessions,
    payments,
    totalFees: balance.totalFees,
    totalPaid: balance.totalPaid,
    balance: balance.balance,
    creditBalance: balance.creditBalance,
  };
}

export function getAllClassesWithDetails(): ClassWithDetails[] {
  return mockClasses
    .map((c) => getClassWithDetails(c.id))
    .filter((c): c is ClassWithDetails => c !== null);
}

export function getChildClasses(childId: string): ClassWithDetails[] {
  return getAllClassesWithDetails().filter((c) => c.childId === childId);
}

export function getDashboardStats(): DashboardStats {
  const allClasses = getAllClassesWithDetails();

  const totalOutstanding: Record<string, number> = {};
  const totalPaid: Record<string, number> = {};

  allClasses.forEach((c) => {
    totalOutstanding[c.currency] = totalOutstanding[c.currency] ?? 0;
    totalPaid[c.currency] = totalPaid[c.currency] ?? 0;

    if (c.balance > 0) {
      totalOutstanding[c.currency] += c.balance;
    }
    totalPaid[c.currency] += c.totalPaid;
  });

  return {
    totalOutstanding,
    totalPaid,
    activeClassesCount: allClasses.filter((c) => c.isActive).length,
    childrenCount: mockChildren.length,
  };
}

export function getUpcomingSessions(): (Session & {
  className: string;
  childName: string;
})[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return mockSessions
    .filter((s) => s.status === "scheduled" && new Date(s.date) >= today)
    .map((s) => {
      const classItem = mockClasses.find((c) => c.id === s.classId);
      const child = mockChildren.find((c) => c.id === classItem?.childId);
      return {
        ...s,
        className: classItem?.name || "Unknown",
        childName: child?.name || "Unknown",
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
}

export function getAllPaymentsWithDetails(): (Payment & {
  className: string;
  childName: string;
})[] {
  return mockPayments
    .map((p) => {
      const classItem = mockClasses.find((c) => c.id === p.classId);
      const child = mockChildren.find((c) => c.id === classItem?.childId);
      return {
        ...p,
        className: classItem?.name || "Unknown",
        childName: child?.name || "Unknown",
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
