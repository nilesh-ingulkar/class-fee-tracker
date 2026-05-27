import type { BillingType, FeeRule, Payment, Session } from "@/lib/types";

export type ClassBalanceInput = {
  billingType: BillingType;
  currentFeeAmount: number;
  sessions: Session[];
  payments: Payment[];
  feeRules: FeeRule[];
};

export type ClassBalance = {
  totalFees: number;
  totalPaid: number;
  balance: number;
  creditBalance: number;
};

function dateOnlyTime(value: Date): number {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function getEffectiveFeeAmount(
  feeRules: FeeRule[],
  sessionDate: Date,
  fallbackAmount: number,
): number {
  const sessionTime = dateOnlyTime(sessionDate);
  const rule = feeRules
    .filter((item) => {
      const effectiveFrom = dateOnlyTime(item.effectiveFrom);
      const effectiveTo = item.effectiveTo ? dateOnlyTime(item.effectiveTo) : null;

      return (
        effectiveFrom <= sessionTime &&
        (effectiveTo === null || sessionTime <= effectiveTo)
      );
    })
    .sort(
      (a, b) =>
        dateOnlyTime(b.effectiveFrom) - dateOnlyTime(a.effectiveFrom),
    )[0];

  return rule?.amount ?? fallbackAmount;
}

function getCompletedSessionYearMonths(sessions: Session[]): string[] {
  const months = new Set<string>();

  for (const session of sessions) {
    if (session.status !== "completed") continue;
    const date = session.date;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    months.add(`${date.getFullYear()}-${month}`);
  }

  return [...months].sort();
}

function firstDayOfYearMonth(yearMonth: string): Date {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function calculateMonthlyFees(
  sessions: Session[],
  feeRules: FeeRule[],
  fallbackAmount: number,
): number {
  return getCompletedSessionYearMonths(sessions).reduce(
    (sum, yearMonth) =>
      sum +
      getEffectiveFeeAmount(
        feeRules,
        firstDayOfYearMonth(yearMonth),
        fallbackAmount,
      ),
    0,
  );
}

export function calculateClassBalance(input: ClassBalanceInput): ClassBalance {
  const feeRules = input.feeRules;
  const totalFees =
    input.billingType === "PER_CLASS"
      ? input.sessions
          .filter((session) => session.status === "completed")
          .reduce(
            (sum, session) =>
              sum +
              getEffectiveFeeAmount(
                feeRules,
                session.date,
                input.currentFeeAmount,
              ),
            0,
          )
      : calculateMonthlyFees(
          input.sessions,
          feeRules,
          input.currentFeeAmount,
        );

  const totalPaid = input.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const netBalance = totalFees - totalPaid;

  return {
    totalFees,
    totalPaid,
    balance: Math.max(netBalance, 0),
    creditBalance: Math.max(-netBalance, 0),
  };
}
