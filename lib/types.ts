export type Currency = string;

export type BillingType = "PER_CLASS" | "MONTHLY";

export type SessionStatus = "scheduled" | "completed" | "cancelled";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Child {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  email?: string;
  phone?: string;
}

export interface Class {
  id: string;
  childId: string;
  teacherId: string;
  name: string;
  billingType: BillingType;
  currency: Currency;
  feeAmount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Session {
  id: string;
  classId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  notes?: string;
}

export interface Payment {
  id: string;
  classId: string;
  amount: number;
  currency: Currency;
  date: Date;
  notes?: string;
}

export interface FeeRule {
  id: string;
  classId: string;
  amount: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface AppCurrency {
  id: string;
  code: Currency;
  symbol: string;
  name: string;
  isActive: boolean;
}

export interface ClassWithDetails extends Class {
  child: Child;
  teacher: Teacher;
  sessions: Session[];
  payments: Payment[];
  feeRules: FeeRule[];
  totalFees: number;
  totalPaid: number;
  balance: number;
  creditBalance: number;
}

export interface DashboardStats {
  totalOutstanding: Record<string, number>;
  totalPaid: Record<string, number>;
  activeClassesCount: number;
  childrenCount: number;
}

export type CurrencyLookup = Pick<AppCurrency, "code" | "symbol">;

const BUILTIN_CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
};

/**
 * Resolves display symbol: user-defined (Settings) first, then built-in fallbacks.
 */
export function resolveCurrencySymbol(
  currency: Currency,
  currencies?: CurrencyLookup[],
): string {
  const fromSettings = currencies
    ?.find((item) => item.code === currency)
    ?.symbol?.trim();
  if (fromSettings) {
    return fromSettings;
  }
  return BUILTIN_CURRENCY_SYMBOLS[currency] ?? currency;
}

export function formatCurrency(
  amount: number,
  currency: Currency,
  currencies?: CurrencyLookup[],
): string {
  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = resolveCurrencySymbol(currency, currencies);

  if (symbol === currency) {
    return `${currency} ${formattedAmount}`;
  }

  return `${symbol}${formattedAmount}`;
}

export function getCurrencySymbol(
  currency: Currency,
  currencies?: CurrencyLookup[],
): string {
  return resolveCurrencySymbol(currency, currencies);
}
