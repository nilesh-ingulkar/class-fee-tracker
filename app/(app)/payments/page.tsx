"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import {
  getAllClassesWithDetails,
  getAllPaymentsWithDetails,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/types";
import { Plus, CreditCard, TrendingUp, Calendar, ChevronRight } from "lucide-react";

export default function PaymentsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const allClasses = getAllClassesWithDetails().filter((c) => c.isActive);
  const allPayments = getAllPaymentsWithDetails();

  const totals = allPayments.reduce(
    (acc, payment) => {
      acc[payment.currency] = (acc[payment.currency] || 0) + payment.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage all your payments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Payment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record a payment</DialogTitle>
              <DialogDescription>
                Add a payment for one of your active classes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPayment}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.child.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Currency will be determined by the selected class
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input id="notes" placeholder="Payment description" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Payment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">USD</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-sm font-bold text-green-600 sm:text-lg">
              {formatCurrency(totals.USD || 0, "USD")}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">INR</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-sm font-bold text-green-600 sm:text-lg">
              {formatCurrency(totals.INR || 0, "INR")}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-sm font-bold sm:text-lg">{allPayments.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table/Cards */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <Calendar className="h-4 w-4 shrink-0" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {allPayments.length === 0 ? (
            <Empty
              icon={CreditCard}
              title="No payments yet"
              description="Record your first payment to start tracking your expenses."
            >
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first payment
              </Button>
            </Empty>
          ) : (
            <>
              {/* Mobile: Card Layout */}
              <div className="space-y-2 sm:hidden">
                {allPayments.map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/classes/${payment.classId}`}
                    className="block"
                  >
                    <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {payment.className}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {payment.childName}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-green-600 shrink-0">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Child</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {new Date(payment.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{payment.className}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.childName}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[150px] truncate">
                          {payment.notes || "-"}
                        </TableCell>
                        <TableCell>
                          <Link href={`/classes/${payment.classId}`}>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
