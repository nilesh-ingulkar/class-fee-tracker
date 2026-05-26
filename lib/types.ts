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

export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<string, string> = {
    USD: "$",
    INR: "₹",
  };
  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = symbols[currency];

  return symbol ? `${symbol}${formattedAmount}` : `${currency} ${formattedAmount}`;
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<string, string> = {
    USD: "$",
    INR: "₹",
  };

  return symbols[currency] ?? currency;
}
