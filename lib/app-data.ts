import type {
  Child,
  Class,
  ClassWithDetails,
  AppCurrency,
  DashboardStats,
  FeeRule,
  Payment,
  Session,
  Teacher,
} from "@/lib/types";
import { calculateClassBalance } from "@/lib/fee-engine";

export type AppData = {
  children: Child[];
  teachers: Teacher[];
  classes: Class[];
  sessions: Session[];
  payments: Payment[];
  feeRules: FeeRule[];
  currencies: AppCurrency[];
};

export type PaymentWithDetails = Payment & {
  childId: string;
  className: string;
  childName: string;
};

export type UpcomingSession = Session & {
  className: string;
  childName: string;
};

export type SessionWithDetails = Session & {
  childId: string;
  className: string;
  childName: string;
  teacherName: string;
};

export const emptyAppData: AppData = {
  children: [],
  teachers: [],
  classes: [],
  sessions: [],
  payments: [],
  feeRules: [],
  currencies: [],
};

export function getFeeRulesForClass(data: AppData, classId: string): FeeRule[] {
  return data.feeRules
    .filter((feeRule) => feeRule.classId === classId)
    .sort(
      (a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime(),
    );
}

export function getClassWithDetails(
  data: AppData,
  classId: string,
): ClassWithDetails | null {
  const classItem = data.classes.find((classRecord) => classRecord.id === classId);
  if (!classItem) return null;

  const child = data.children.find((childRecord) => childRecord.id === classItem.childId);
  const teacher = data.teachers.find(
    (teacherRecord) => teacherRecord.id === classItem.teacherId,
  );

  if (!child || !teacher) return null;

  const sessions = data.sessions.filter((session) => session.classId === classId);
  const payments = data.payments.filter((payment) => payment.classId === classId);
  const feeRules = getFeeRulesForClass(data, classId);
  const classBalance = calculateClassBalance({
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
    feeRules,
    totalFees: classBalance.totalFees,
    totalPaid: classBalance.totalPaid,
    balance: classBalance.balance,
    creditBalance: classBalance.creditBalance,
  };
}

export function getAllClassesWithDetails(data: AppData): ClassWithDetails[] {
  return data.classes
    .map((classRecord) => getClassWithDetails(data, classRecord.id))
    .filter((classRecord): classRecord is ClassWithDetails => classRecord !== null);
}

export function getChildClasses(data: AppData, childId: string): ClassWithDetails[] {
  return getAllClassesWithDetails(data).filter(
    (classRecord) => classRecord.childId === childId,
  );
}

export function getDashboardStats(data: AppData): DashboardStats {
  const allClasses = getAllClassesWithDetails(data);
  const totalOutstanding: Record<string, number> = {};
  const totalPaid: Record<string, number> = {};

  allClasses.forEach((classRecord) => {
    totalOutstanding[classRecord.currency] =
      totalOutstanding[classRecord.currency] ?? 0;
    totalPaid[classRecord.currency] = totalPaid[classRecord.currency] ?? 0;

    if (classRecord.balance > 0) {
      totalOutstanding[classRecord.currency] += classRecord.balance;
    }
    totalPaid[classRecord.currency] += classRecord.totalPaid;
  });

  return {
    totalOutstanding,
    totalPaid,
    activeClassesCount: allClasses.filter((classRecord) => classRecord.isActive).length,
    childrenCount: data.children.length,
  };
}

export function getUpcomingSessions(data: AppData): UpcomingSession[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return data.sessions
    .filter((session) => session.status === "scheduled" && new Date(session.date) >= today)
    .map((session) => {
      const classItem = data.classes.find(
        (classRecord) => classRecord.id === session.classId,
      );
      const child = data.children.find(
        (childRecord) => childRecord.id === classItem?.childId,
      );

      return {
        ...session,
        className: classItem?.name || "Unknown",
        childName: child?.name || "Unknown",
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
}

export function getAllSessionsWithDetails(data: AppData): SessionWithDetails[] {
  return data.sessions
    .map((session) => {
      const classItem = data.classes.find(
        (classRecord) => classRecord.id === session.classId,
      );
      const child = data.children.find(
        (childRecord) => childRecord.id === classItem?.childId,
      );
      const teacher = data.teachers.find(
        (teacherRecord) => teacherRecord.id === classItem?.teacherId,
      );

      return {
        ...session,
        childId: classItem?.childId || "",
        className: classItem?.name || "Unknown",
        childName: child?.name || "Unknown",
        teacherName: teacher?.name || "Unknown",
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllPaymentsWithDetails(data: AppData): PaymentWithDetails[] {
  return data.payments
    .map((payment) => {
      const classItem = data.classes.find(
        (classRecord) => classRecord.id === payment.classId,
      );
      const child = data.children.find(
        (childRecord) => childRecord.id === classItem?.childId,
      );

      return {
        ...payment,
        childId: classItem?.childId || "",
        className: classItem?.name || "Unknown",
        childName: child?.name || "Unknown",
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
