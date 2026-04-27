import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardStats,
  getUpcomingSessions,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/types";
import {
  DollarSign,
  TrendingUp,
  GraduationCap,
  Users,
  Calendar,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const upcomingSessions = getUpcomingSessions();

  const hasUSDOutstanding = stats.totalOutstanding.USD > 0;
  const hasINROutstanding = stats.totalOutstanding.INR > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your financial overview at a glance
        </p>
      </div>

      {/* Outstanding Balance - Prominent */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-6">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2 sm:text-sm">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span className="truncate">Total Outstanding Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6">
          <div className="flex flex-col gap-1.5">
            {hasUSDOutstanding && (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground min-w-[70px] sm:min-w-[80px]">USD:</span>
                <span className="text-lg font-bold text-destructive sm:text-xl">
                  {formatCurrency(stats.totalOutstanding.USD, "USD")}
                </span>
              </div>
            )}
            {hasINROutstanding && (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground min-w-[70px] sm:min-w-[80px]">INR:</span>
                <span className="text-lg font-bold text-destructive sm:text-xl">
                  {formatCurrency(stats.totalOutstanding.INR, "INR")}
                </span>
              </div>
            )}
            {!hasUSDOutstanding && !hasINROutstanding && (
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
        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Paid (USD)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-base font-bold text-green-600 sm:text-lg">
              {formatCurrency(stats.totalPaid.USD, "USD")}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-4 sm:pt-4 sm:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Paid (INR)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <span className="text-base font-bold text-green-600 sm:text-lg">
              {formatCurrency(stats.totalPaid.INR, "INR")}
            </span>
          </CardContent>
        </Card>

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
