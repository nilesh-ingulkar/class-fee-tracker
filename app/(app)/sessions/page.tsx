"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
  getAllClassesWithDetails,
  getAllSessionsWithDetails,
  type SessionWithDetails,
} from "@/lib/app-data";
import type { SessionStatus } from "@/lib/types";
import { useAppData } from "@/hooks/use-app-data";
import {
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  User,
  XCircle,
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
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-700 hover:bg-red-100 text-xs"
        >
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

export default function SessionsPage() {
  const { data, isReady, addSession, updateSession, deleteSession } = useAppData();
  const allSessions = getAllSessionsWithDetails(data);
  const activeClasses = getAllClassesWithDetails(data).filter(
    (classRecord) => classRecord.isActive,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [childFilter, setChildFilter] = useState("all");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionClassId, setSessionClassId] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("scheduled");
  const visibleSessions =
    childFilter === "all"
      ? allSessions
      : allSessions.filter((session) => session.childId === childFilter);
  const sessionsByChild = data.children
    .map((child) => ({
      child,
      sessions: visibleSessions.filter((session) => session.childId === child.id),
    }))
    .filter(({ child, sessions }) =>
      childFilter === "all" ? sessions.length > 0 : child.id === childFilter,
    );
  const classesForSelectedChild = activeClasses.filter(
    (classRecord) => childFilter === "all" || classRecord.childId === childFilter,
  );

  const resetForm = () => {
    setEditingSessionId(null);
    setSessionClassId("");
    setSessionDate("");
    setSessionStartTime("");
    setSessionStatus("scheduled");
  };

  const startEditSession = (session: SessionWithDetails) => {
    setEditingSessionId(session.id);
    setSessionClassId(session.classId);
    setSessionDate(new Date(session.date).toISOString().split("T")[0]);
    setSessionStartTime(session.startTime);
    setSessionStatus(session.status);
    setIsDialogOpen(true);
  };

  const handleSaveSession = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!sessionDate || !sessionStartTime || (!editingSessionId && !sessionClassId)) {
      return;
    }

    const saved = editingSessionId
      ? await updateSession({
          id: editingSessionId,
          date: new Date(`${sessionDate}T00:00:00`),
          startTime: sessionStartTime,
          status: sessionStatus,
        })
      : await addSession({
          classId: sessionClassId,
          date: new Date(`${sessionDate}T00:00:00`),
          startTime: sessionStartTime,
          status: sessionStatus,
        });

    if (!saved) return;

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    await deleteSession(sessionId);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="blue-panel flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0">
          <p className="page-kicker">Schedule</p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Sessions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage scheduled, completed, and cancelled sessions
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Session</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSessionId ? "Edit session" : "Add a new session"}
              </DialogTitle>
              <DialogDescription>
                Track when a class session is scheduled or completed.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveSession}>
              <div className="space-y-4 py-4">
                {!editingSessionId ? (
                  <div className="space-y-2">
                    <Label htmlFor="classId">Class</Label>
                    <Select
                      required
                      value={sessionClassId}
                      onValueChange={setSessionClassId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classesForSelectedChild.map((classRecord) => (
                          <SelectItem key={classRecord.id} value={classRecord.id}>
                            {classRecord.child.name} - {classRecord.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Input
                    id="startTime"
                    type="time"
                    value={sessionStartTime}
                    onChange={(event) => setSessionStartTime(event.target.value)}
                    required
                  />
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
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!editingSessionId && classesForSelectedChild.length === 0}
                >
                  {editingSessionId ? "Save Session" : "Add Session"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="sessionChildFilter">Child</Label>
            <Select value={childFilter} onValueChange={setChildFilter}>
              <SelectTrigger id="sessionChildFilter" className="w-full sm:max-w-xs">
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

      {!isReady ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading sessions...
          </CardContent>
        </Card>
      ) : visibleSessions.length === 0 ? (
        <Empty>
          <EmptyContent>
            <EmptyMedia variant="icon">
              <Calendar className="h-6 w-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No sessions found</EmptyTitle>
              <EmptyDescription>
                {childFilter === "all"
                  ? "Add a session once you have an active class."
                  : "No sessions have been recorded for this child yet."}
              </EmptyDescription>
            </EmptyHeader>
            {classesForSelectedChild.length === 0 ? (
              <Button asChild>
                <Link href="/classes">
                  <Plus className="h-4 w-4 mr-2" />
                  Add an active class first
                </Link>
              </Button>
            ) : (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first session
              </Button>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {sessionsByChild.map(({ child, sessions }) => (
            <Card key={child.id} className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-accent via-primary/60 to-sky-400" />
              <CardContent className="p-4 space-y-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold flex min-w-0 items-center gap-2 sm:text-base">
                    <span className="blue-icon h-8 w-8">
                      <User className="h-4 w-4 shrink-0" />
                    </span>
                    <span className="truncate">{child.name}</span>
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
                  </span>
                </div>

                <div className="space-y-2 sm:hidden">
                  {sessions.map((session) => (
                    <div key={session.id} className="rounded-lg border bg-card p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{session.className}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            With {session.teacherName}
                          </p>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(session.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {session.startTime || "No time set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => startEditSession(session)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/classes/${session.classId}`}>
                            Class
                            <GraduationCap className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => {
                            void handleDeleteSession(session.id);
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
                        <TableHead>Class</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/classes/${session.classId}`}
                              className="hover:underline"
                            >
                              {session.className}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              <GraduationCap className="inline h-3 w-3 mr-1" />
                              {session.teacherName}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(session.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>{session.startTime || "No time set"}</TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditSession(session)}
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
                                  void handleDeleteSession(session.id);
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
