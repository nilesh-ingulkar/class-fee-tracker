"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getClassWithDetails } from "@/lib/mock-data";
import { formatCurrency, getCurrencySymbol } from "@/lib/types";
import type { SessionStatus } from "@/lib/types";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Calendar,
  DollarSign,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";

function getStatusBadge(status: SessionStatus) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Done
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "scheduled":
      return (
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>
      );
    default:
      return null;
  }
}

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const classData = getClassWithDetails(id);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  if (!classData) {
    notFound();
  }

  const sortedSessions = [...classData.sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sortedPayments = [...classData.payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button */}
      <Link
        href="/classes"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
        Back to Classes
      </Link>

      {/* Class Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl truncate">
            {classData.name}
          </h1>
          <Badge variant={classData.isActive ? "default" : "secondary"} className="shrink-0">
            {classData.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{classData.child.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{classData.teacher.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatCurrency(classData.feeAmount, classData.currency)}
              {classData.billingType === "PER_CLASS" ? "/session" : "/month"}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-sm font-bold sm:text-lg">
              {formatCurrency(classData.totalFees, classData.currency)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-sm font-bold text-green-600 sm:text-lg">
              {formatCurrency(classData.totalPaid, classData.currency)}
            </span>
          </CardContent>
        </Card>

        <Card className={classData.balance > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span
              className={`text-sm font-bold sm:text-lg ${
                classData.balance > 0 ? "text-destructive" : "text-green-600"
              }`}
            >
              {classData.balance > 0
                ? formatCurrency(classData.balance, classData.currency)
                : "Paid"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <Calendar className="h-4 w-4 shrink-0" />
            Sessions
          </CardTitle>
          <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a new session</DialogTitle>
                <DialogDescription>
                  Schedule a new session for this class.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsAddSessionOpen(false);
                }}
              >
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionDate">Date</Label>
                    <Input id="sessionDate" type="date" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start</Label>
                      <Input id="startTime" type="time" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End</Label>
                      <Input id="endTime" type="time" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue="scheduled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddSessionOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Session</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {sortedSessions.length === 0 ? (
            <Empty
              icon={Calendar}
              title="No sessions yet"
              description="Add your first session to start tracking attendance."
            />
          ) : (
            <>
              {/* Mobile: Card Layout */}
              <div className="space-y-2 sm:hidden">
                {sortedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(session.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.startTime} - {session.endTime}
                        </p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                    {session.notes && (
                      <p className="text-xs text-muted-foreground truncate">
                        {session.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {new Date(session.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {session.startTime} - {session.endTime}
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {session.notes || "-"}
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

      {/* Payments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <CreditCard className="h-4 w-4 shrink-0" />
            Payments
          </CardTitle>
          <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record a payment</DialogTitle>
                <DialogDescription>
                  Add a payment record for this class.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsAddPaymentOpen(false);
                }}
              >
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount ({getCurrencySymbol(classData.currency)})
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Date</Label>
                    <Input id="paymentDate" type="date" required />
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
                    onClick={() => setIsAddPaymentOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Payment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {sortedPayments.length === 0 ? (
            <Empty
              icon={CreditCard}
              title="No payments yet"
              description="Record your first payment to track fee payments."
            />
          ) : (
            <>
              {/* Mobile: Card Layout */}
              <div className="space-y-2 sm:hidden">
                {sortedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {new Date(payment.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {payment.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-green-600 shrink-0">
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {new Date(payment.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {payment.notes || "-"}
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
