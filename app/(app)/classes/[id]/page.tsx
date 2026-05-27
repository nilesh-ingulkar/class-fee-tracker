"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { FeeRateHistoryCard } from "@/components/fee-rate-history-card";
import { TimePicker } from "@/components/time-picker";
import { Spinner } from "@/components/ui/spinner";
import { getClassWithDetails } from "@/lib/app-data";
import { formatTimeForInput, toIsoDateOnly } from "@/lib/export";
import { formatCurrency, getCurrencySymbol } from "@/lib/types";
import type { SessionStatus } from "@/lib/types";
import { useAppData } from "@/hooks/use-app-data";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Calendar,
  Coins,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Pencil,
  Trash2,
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
  const {
    data,
    isReady,
    error,
    addPayment,
    addSession,
    updatePayment,
    updateSession,
    deleteSession,
    deletePayment,
  } = useAppData();
  const classData = getClassWithDetails(data, id);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("scheduled");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentNotes, setPaymentNotes] = useState("");
  const [pendingDelete, setPendingDelete] = useState<
    { type: "session"; id: string } | { type: "payment"; id: string } | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionFormError, setSessionFormError] = useState<string | null>(null);

  if (!isReady) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading class...
        </CardContent>
      </Card>
    );
  }

  if (!classData) {
    notFound();
  }

  const sortedSessions = [...classData.sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sortedPayments = [...classData.payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddSession = async (event: React.FormEvent) => {
    event.preventDefault();
    setSessionFormError(null);

    if (!sessionDate) {
      setSessionFormError("Enter a session date.");
      return;
    }

    setIsSavingSession(true);
    try {
      const saved = editingSessionId
        ? await updateSession({
            id: editingSessionId,
            date: new Date(`${sessionDate}T00:00:00`),
            startTime: sessionStartTime,
            status: sessionStatus,
          })
        : await addSession({
            classId: classData.id,
            date: new Date(`${sessionDate}T00:00:00`),
            startTime: sessionStartTime,
            status: sessionStatus,
          });

      if (!saved) {
        return;
      }

      setEditingSessionId(null);
      setSessionDate("");
      setSessionStartTime("");
      setSessionStatus("scheduled");
      setIsAddSessionOpen(false);
    } finally {
      setIsSavingSession(false);
    }
  };

  const openSessionEditor = (session: (typeof sortedSessions)[number]) => {
    setSessionFormError(null);
    setEditingSessionId(session.id);
    setSessionDate(toIsoDateOnly(session.date));
    setSessionStartTime(formatTimeForInput(session.startTime));
    setSessionStatus(session.status);
    setIsAddSessionOpen(true);
  };

  const handleAddPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(paymentAmount);

    if (!paymentDate || Number.isNaN(amount)) {
      return;
    }

    const saved = editingPaymentId
      ? await updatePayment({
          id: editingPaymentId,
          amount,
          date: new Date(`${paymentDate}T00:00:00`),
          notes: paymentNotes,
        })
      : await addPayment({
          classId: classData.id,
          amount,
          currency: classData.currency,
          date: new Date(`${paymentDate}T00:00:00`),
          notes: paymentNotes,
        });

    if (!saved) return;

    setEditingPaymentId(null);
    setPaymentAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentNotes("");
    setIsAddPaymentOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      if (pendingDelete.type === "session") {
        await deleteSession(pendingDelete.id);
      } else {
        await deletePayment(pendingDelete.id);
      }
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="blue-panel p-4 sm:p-6">
        <p className="page-kicker">Class details</p>
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
            <Coins className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatCurrency(classData.feeAmount, classData.currency, data.currencies)}
              {classData.billingType === "PER_CLASS" ? "/session" : "/month"}
            </span>
            {classData.feeRules.length > 0 ? (
              <a
                href="#rate-history"
                className="text-primary hover:underline underline-offset-2"
              >
                View rate history
              </a>
            ) : null}
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
              {formatCurrency(classData.totalFees, classData.currency, data.currencies)}
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
              {formatCurrency(classData.totalPaid, classData.currency, data.currencies)}
            </span>
          </CardContent>
        </Card>

        <Card
          className={
            classData.balance > 0
              ? "border-destructive/50 bg-destructive/5"
              : classData.creditBalance > 0
                ? "border-green-500/50 bg-green-50"
                : ""
          }
        >
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              {classData.creditBalance > 0 ? "Credit" : "Balance"}
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
                : classData.creditBalance > 0
                  ? formatCurrency(classData.creditBalance, classData.currency)
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
          <Dialog
            open={isAddSessionOpen}
            onOpenChange={(open) => {
              setIsAddSessionOpen(open);
              if (!open) {
                setEditingSessionId(null);
                setSessionDate("");
                setSessionStartTime("");
                setSessionStatus("scheduled");
                setSessionFormError(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingSessionId ? "Edit session" : "Add a new session"}
                </DialogTitle>
                <DialogDescription>
                  Schedule a new session for this class.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSession}>
                <div className="space-y-4 py-4">
                  {sessionFormError || error ? (
                    <Alert variant="destructive">
                      <AlertTitle>
                        {editingSessionId
                          ? "Could not update session"
                          : "Could not add session"}
                      </AlertTitle>
                      <AlertDescription>
                        {sessionFormError ?? error}
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="sessionDate">Date</Label>
                    <Input
                      id="sessionDate"
                      type="date"
                      value={sessionDate}
                      onChange={(event) => setSessionDate(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Time</Label>
                    <TimePicker
                      id="startTime"
                      value={sessionStartTime}
                      onChange={setSessionStartTime}
                      optional
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional — leave blank if no specific time.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={sessionStatus}
                      onValueChange={(value) =>
                        setSessionStatus(value as SessionStatus)
                      }
                    >
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
                    onClick={() => {
                      setEditingSessionId(null);
                      setIsAddSessionOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSavingSession}>
                    {isSavingSession ? (
                      <>
                        <Spinner className="mr-2" />
                        Saving...
                      </>
                    ) : editingSessionId ? (
                      "Save changes"
                    ) : (
                      "Add Session"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {sortedSessions.length === 0 ? (
            <Empty>
              <EmptyContent>
                <EmptyMedia variant="icon">
                  <Calendar className="h-6 w-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No sessions yet</EmptyTitle>
                  <EmptyDescription>
                    Add your first session to start tracking attendance.
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
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
                          {session.startTime || "No time set"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(session.status)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openSessionEditor(session)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setPendingDelete({ type: "session", id: session.id })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                      <TableHead>Actions</TableHead>
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
                          {session.startTime || "No time set"}
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openSessionEditor(session)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setPendingDelete({ type: "session", id: session.id })
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
          <Dialog
            open={isAddPaymentOpen}
            onOpenChange={(open) => {
              setIsAddPaymentOpen(open);
              if (!open) {
                setEditingPaymentId(null);
                setPaymentAmount("");
                setPaymentDate(new Date().toISOString().split("T")[0]);
                setPaymentNotes("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPaymentId ? "Edit payment" : "Record a payment"}
                </DialogTitle>
                <DialogDescription>
                  Add a payment record for this class.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayment}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount ({getCurrencySymbol(classData.currency, data.currencies)})
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentDate}
                      onChange={(event) => setPaymentDate(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Payment description"
                      value={paymentNotes}
                      onChange={(event) => setPaymentNotes(event.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingPaymentId(null);
                      setIsAddPaymentOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPaymentId ? "Save Payment" : "Add Payment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {sortedPayments.length === 0 ? (
            <Empty>
              <EmptyContent>
                <EmptyMedia variant="icon">
                  <CreditCard className="h-6 w-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No payments yet</EmptyTitle>
                  <EmptyDescription>
                    Record your first payment to track fee payments.
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
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
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(payment.amount, payment.currency, data.currencies)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPaymentId(payment.id);
                          setPaymentAmount(String(payment.amount));
                          setPaymentDate(
                            new Date(payment.date).toISOString().split("T")[0],
                          );
                          setPaymentNotes(payment.notes ?? "");
                          setIsAddPaymentOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setPendingDelete({ type: "payment", id: payment.id })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                      <TableHead>Actions</TableHead>
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
                          {formatCurrency(payment.amount, payment.currency, data.currencies)}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {payment.notes || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingPaymentId(payment.id);
                                setPaymentAmount(String(payment.amount));
                                setPaymentDate(
                                  new Date(payment.date).toISOString().split("T")[0],
                                );
                                setPaymentNotes(payment.notes ?? "");
                                setIsAddPaymentOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setPendingDelete({ type: "payment", id: payment.id })
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
            </>
          )}
        </CardContent>
      </Card>

      <FeeRateHistoryCard
        rules={classData.feeRules}
        currency={classData.currency}
        currencies={data.currencies}
        billingType={classData.billingType}
        classId={classData.id}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPendingDelete(null);
          }
        }}
        title={
          pendingDelete?.type === "payment" ? "Delete payment?" : "Delete session?"
        }
        description={
          pendingDelete?.type === "payment"
            ? "This payment will be removed permanently. This cannot be undone."
            : "This session will be removed permanently. This cannot be undone."
        }
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
