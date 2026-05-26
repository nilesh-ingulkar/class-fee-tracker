"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  getAllClassesWithDetails,
  getDashboardStats,
  getUpcomingSessions,
} from "@/lib/app-data";
import { formatCurrency, type SessionStatus } from "@/lib/types";
import { useAppData } from "@/hooks/use-app-data";
import {
  DollarSign,
  TrendingUp,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  CreditCard,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const { data, isReady, addPayment, addSession } = useAppData();
  const stats = getDashboardStats(data);
  const upcomingSessions = getUpcomingSessions(data);
  const activeClasses = getAllClassesWithDetails(data).filter((item) => item.isActive);
  const paidTotals = Object.entries(stats.totalPaid);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [sessionClassId, setSessionClassId] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("scheduled");
  const [paymentClassId, setPaymentClassId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentNotes, setPaymentNotes] = useState("");

  const childOutstanding = data.children
    .map((child) => {
      const balances: Record<string, number> = {};
      activeClasses
        .filter((classRecord) => classRecord.childId === child.id)
        .forEach((classRecord) => {
          if (classRecord.balance > 0) {
            balances[classRecord.currency] =
              (balances[classRecord.currency] ?? 0) + classRecord.balance;
          }
        });

      return {
        child,
        balances,
      };
    })
    .filter(({ balances }) =>
      Object.values(balances).some((amount) => amount > 0),
    );

  const handleAddSession = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sessionClassId || !sessionDate || !sessionTime) return;

    const created = await addSession({
      classId: sessionClassId,
      date: new Date(`${sessionDate}T00:00:00`),
      startTime: sessionTime,
      status: sessionStatus,
    });
    if (!created) return;

    setSessionClassId("");
    setSessionDate("");
    setSessionTime("");
    setSessionStatus("scheduled");
    setIsSessionOpen(false);
  };

  const handleAddPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    const classRecord = activeClasses.find((item) => item.id === paymentClassId);
    const amount = Number(paymentAmount);
    if (!classRecord || !paymentDate || Number.isNaN(amount)) return;

    const created = await addPayment({
      classId: classRecord.id,
      amount,
      currency: classRecord.currency,
      date: new Date(`${paymentDate}T00:00:00`),
      notes: paymentNotes,
    });
    if (!created) return;

    setPaymentClassId("");
    setPaymentAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentNotes("");
    setIsPaymentOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="blue-panel p-4 sm:p-6">
        <p className="page-kicker">Family fee planner</p>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your financial overview at a glance
        </p>
      </div>

      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold sm:text-base">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 px-4 pb-4 sm:grid-cols-2 sm:px-6">
          <Dialog open={isSessionOpen} onOpenChange={setIsSessionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={activeClasses.length === 0}>
                <Calendar className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add session</DialogTitle>
                <DialogDescription>
                  Record or schedule a session for an active class.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSession}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={sessionClassId} onValueChange={setSessionClassId} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeClasses.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.child.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={sessionDate}
                        onChange={(event) => setSessionDate(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={sessionTime}
                        onChange={(event) => setSessionTime(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={sessionStatus}
                      onValueChange={(value) => setSessionStatus(value as SessionStatus)}
                    >
                      <SelectTrigger className="w-full">
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
                <DialogFooter>
                  <Button type="submit">Add Session</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={activeClasses.length === 0}>
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add payment</DialogTitle>
                <DialogDescription>
                  Record a payment against an active class.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayment}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={paymentClassId} onValueChange={setPaymentClassId} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeClasses.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.child.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(event) => setPaymentAmount(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(event) => setPaymentDate(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={paymentNotes}
                      onChange={(event) => setPaymentNotes(event.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Payment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {!isReady ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading dashboard...
          </CardContent>
        </Card>
      ) : null}

      {/* Outstanding Balance - Prominent */}
      <Card>
        <CardHeader className="pb-2 px-4 pt-4 sm:px-6">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2 sm:text-sm">
            <span className="sky-icon h-8 w-8">
              <DollarSign className="h-4 w-4 shrink-0" />
            </span>
            <span className="truncate">Outstanding Balance By Child</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6">
          <div className="flex flex-col gap-3">
            {childOutstanding.map(({ child, balances }) => (
              <div
                key={child.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-background/80 p-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{child.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Outstanding across active classes
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {Object.entries(balances).map(([currency, amount]) => (
                    <span
                      key={currency}
                    className="text-sm font-bold text-primary sm:text-base"
                    >
                      {formatCurrency(amount, currency)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {childOutstanding.length === 0 && (
              <span className="text-lg font-bold text-green-600 sm:text-xl">
                All paid up!
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Across all active classes
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid - Always 2 columns */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {paidTotals.length > 0 ? (
          paidTotals.map(([currency, amount]) => (
            <Card key={currency}>
              <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Paid ({currency})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                <span className="text-base font-bold text-green-600 sm:text-lg">
                  {formatCurrency(amount, currency)}
                </span>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Paid</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <span className="text-base font-bold text-green-600 sm:text-lg">
                {formatCurrency(0, "USD")}
              </span>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Active Classes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-base font-bold sm:text-lg">{stats.activeClassesCount}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Children</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-base font-bold sm:text-lg">{stats.childrenCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <Calendar className="h-4 w-4 shrink-0" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors sm:p-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 sm:gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 sm:h-9 sm:w-9">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{session.className}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.childName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">
                      {new Date(session.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.startTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
