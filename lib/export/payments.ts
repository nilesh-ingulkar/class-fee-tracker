import type { PaymentWithDetails } from "@/lib/app-data";
import { toIsoDateOnly } from "@/lib/export/date-format";

export const PAYMENT_EXPORT_COLUMNS = [
  "Date",
  "Child",
  "Class",
  "Amount",
  "Currency",
  "Notes",
] as const;

export function paymentsToExportRows(
  payments: PaymentWithDetails[],
): (string | number)[][] {
  return payments.map((payment) => [
    toIsoDateOnly(new Date(payment.date)),
    payment.childName,
    payment.className,
    payment.amount,
    payment.currency,
    payment.notes ?? "",
  ]);
}
