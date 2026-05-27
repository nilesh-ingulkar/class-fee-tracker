import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BillingType, Currency, CurrencyLookup, FeeRule } from "@/lib/types";
import { formatCurrency } from "@/lib/types";
import { History } from "lucide-react";

function formatRuleDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function rateSuffix(billingType: BillingType): string {
  return billingType === "PER_CLASS" ? "/session" : "/month";
}

type FeeRateHistoryCardProps = {
  id?: string;
  rules: FeeRule[];
  currency: Currency;
  currencies: CurrencyLookup[];
  billingType: BillingType;
  classId?: string;
};

export function FeeRateHistoryCard({
  id = "rate-history",
  rules,
  currency,
  currencies,
  billingType,
  classId,
}: FeeRateHistoryCardProps) {
  const suffix = rateSuffix(billingType);

  return (
    <Card id={id}>
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
          <History className="h-4 w-4 shrink-0" />
          Rate history
        </CardTitle>
        {classId ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/classes">Change rate</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        {rules.length === 0 ? (
          <Empty>
            <EmptyContent>
              <EmptyHeader>
                <EmptyTitle>No fee rates recorded</EmptyTitle>
                <EmptyDescription>
                  Rates set when adding or editing this class will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="space-y-2 sm:hidden">
              {rules.map((rule) => {
                const isCurrent = !rule.effectiveTo;

                return (
                  <div
                    key={rule.id}
                    className="rounded-lg border bg-card p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">
                        {formatCurrency(rule.amount, currency, currencies)}
                        <span className="text-muted-foreground font-normal text-sm">
                          {suffix}
                        </span>
                      </span>
                      {isCurrent ? (
                        <Badge className="shrink-0">Current</Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          Past
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>From {formatRuleDate(rule.effectiveFrom)}</p>
                      <p>
                        Until{" "}
                        {rule.effectiveTo
                          ? formatRuleDate(rule.effectiveTo)
                          : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rate</TableHead>
                    <TableHead>Effective from</TableHead>
                    <TableHead>Effective until</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => {
                    const isCurrent = !rule.effectiveTo;

                    return (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                          {formatCurrency(rule.amount, currency, currencies)}
                          <span className="text-muted-foreground font-normal text-sm">
                            {suffix}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatRuleDate(rule.effectiveFrom)}
                        </TableCell>
                        <TableCell>
                          {rule.effectiveTo
                            ? formatRuleDate(rule.effectiveTo)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {isCurrent ? (
                            <Badge>Current</Badge>
                          ) : (
                            <Badge variant="secondary">Past</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
