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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  getAllClassesWithDetails,
  getAllPaymentsWithDetails,
  type PaymentWithDetails,
} from "@/lib/app-data";
import { formatCurrency } from "@/lib/types";
import { useAppData } from "@/hooks/use-app-data";
import {
  Calendar,
  ChevronRight,
  CreditCard,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";

export default function PaymentsPage() {
  const { data, isReady, addPayment, updatePayment, deletePayment } = useAppData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [childFilter, setChildFilter] = useState("all");
  const [classId, setClassId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const allClasses = getAllClassesWithDetails(data).filter((c) => c.isActive);
  const allPayments = getAllPaymentsWithDetails(data);
  const visiblePayments =
    childFilter === "all"
      ? allPayments
      : allPayments.filter((payment) => payment.childId === childFilter);
  const paymentsByChild = data.children
    .map((child) => ({
      child,
      payments: visiblePayments.filter((payment) => payment.childId === child.id),
    }))
    .filter(({ child, payments }) =>
      childFilter === "all" ? payments.length > 0 : child.id === childFilter,
    );

  const resetForm = () => {
    setEditingPaymentId(null);
    setClassId("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const startEditPayment = (payment: PaymentWithDetails) => {
    setEditingPaymentId(payment.id);
    setClassId(payment.classId);
    setAmount(String(payment.amount));
    setDate(new Date(payment.date).toISOString().split("T")[0]);
    setNotes(payment.notes ?? "");
    setIsAddDialogOpen(true);
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("Delete this payment? This cannot be undone.")) return;
    await deletePayment(paymentId);
  };

  const classesForSelectedChild = allClasses.filter(
    (classRecord) => childFilter === "all" || classRecord.childId === childFilter,
  );

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClass = allClasses.find((classRecord) => classRecord.id === classId);
    const paymentAmount = Number(amount);

    if (!date || Number.isNaN(paymentAmount)) {
      return;
    }

    const saved = editingPaymentId
      ? await updatePayment({
          id: editingPaymentId,
          amount: paymentAmount,
          date: new Date(`${date}T00:00:00`),
          notes,
        })
      : selectedClass
        ? await addPayment({
            classId,
            amount: paymentAmount,
            currency: selectedClass.currency,
            date: new Date(`${date}T00:00:00`),
            notes,
          })
        : null;

    if (!saved) return;

    resetForm();
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="blue-panel flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0">
          <p className="page-kicker">Payments</p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage all your payments
          </p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Payment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPaymentId ? "Edit payment" : "Record a payment"}
              </DialogTitle>
              <DialogDescription>
                Add a payment for one of your active classes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPayment}>
              <div className="space-y-4 py-4">
                {!editingPaymentId ? (
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select required value={classId} onValueChange={setClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classesForSelectedChild.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.child.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
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
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Payment description"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
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
                <Button
                  type="submit"
                  disabled={!editingPaymentId && classesForSelectedChild.length === 0}
                >
                  {editingPaymentId ? "Save Payment" : "Add Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="childFilter">Child</Label>
            <Select value={childFilter} onValueChange={setChildFilter}>
              <SelectTrigger id="childFilter" className="w-full sm:max-w-xs">
                <SelectValue placeholder="Filter by child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All children</SelectItem>
                {data.children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table/Cards */}
      {!isReady ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading payments...
          </CardContent>
        </Card>
      ) : visiblePayments.length === 0 ? (
        <Empty>
          <EmptyContent>
            <EmptyMedia variant="icon">
              <CreditCard className="h-6 w-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No payments found</EmptyTitle>
              <EmptyDescription>
                {childFilter === "all"
                  ? "Record your first payment to start tracking payment history."
                  : "No payments have been recorded for this child yet."}
              </EmptyDescription>
            </EmptyHeader>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              disabled={classesForSelectedChild.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              {classesForSelectedChild.length === 0
                ? "Add a class first"
                : "Add payment"}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {paymentsByChild.map(({ child, payments }) => (
            <Card key={child.id} className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-sky-400 to-accent" />
              <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
                <CardTitle className="text-sm font-semibold flex items-center justify-between gap-3 sm:text-base">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="cyan-icon h-8 w-8">
                      <User className="h-4 w-4 shrink-0" />
                    </span>
                    <span className="truncate">{child.name}</span>
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {payments.length} {payments.length === 1 ? "payment" : "payments"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-2 sm:hidden">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {payment.className}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-green-600 shrink-0">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </div>
                      {payment.notes ? (
                        <p className="text-xs text-muted-foreground truncate">
                          {payment.notes}
                        </p>
                      ) : null}
                      <div className="flex items-center gap-2 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => startEditPayment(payment)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/classes/${payment.classId}`}>
                            Class
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => {
                            void handleDeletePayment(payment.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            <Calendar className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {new Date(payment.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>{payment.className}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[150px] truncate">
                            {payment.notes || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditPayment(payment)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/classes/${payment.classId}`}>
                                  Class
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  void handleDeletePayment(payment.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
