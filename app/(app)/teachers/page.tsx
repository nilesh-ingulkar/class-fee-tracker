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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAppData } from "@/hooks/use-app-data";
import { GraduationCap, Pencil, Plus } from "lucide-react";

export default function TeachersPage() {
  const { data, isReady, addTeacher, updateTeacher, updateTeacherActive } =
    useAppData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const resetForm = () => {
    setEditingTeacherId(null);
    setName("");
  };

  const handleAddTeacher = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const saved = editingTeacherId
      ? await updateTeacher({ id: editingTeacherId, name })
      : await addTeacher({ name });
    if (!saved) return;

    resetForm();
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="blue-panel flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0">
          <p className="page-kicker">Instructors</p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Teachers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage teachers before assigning them to classes
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
              <span className="hidden sm:inline">Add Teacher</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTeacherId ? "Edit teacher" : "Add a teacher"}
              </DialogTitle>
              <DialogDescription>
                Add a teacher so classes can be assigned correctly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTeacher}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teacherName">Teacher name</Label>
                  <Input
                    id="teacherName"
                    placeholder="Enter name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
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
                <Button type="submit">
                  {editingTeacherId ? "Save Teacher" : "Add Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!isReady ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading teachers...
          </CardContent>
        </Card>
      ) : data.teachers.length === 0 ? (
        <Empty>
          <EmptyContent>
            <EmptyMedia variant="icon">
              <GraduationCap className="h-6 w-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No teachers yet</EmptyTitle>
              <EmptyDescription>
                Add your first teacher so classes can be assigned correctly.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first teacher
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {data.teachers.map((teacher) => (
            <Card key={teacher.id} className="overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="h-1 bg-gradient-to-r from-sky-400 via-primary/70 to-accent" />
              <CardHeader className="pb-2 px-4 pt-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="sky-icon h-10 w-10">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base truncate sm:text-lg">
                      {teacher.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={teacher.isActive ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {teacher.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3 sm:px-6">
                <p className="text-sm text-muted-foreground">
                  {teacher.isActive
                    ? "Available for new class assignment."
                    : "Hidden from new class assignment."}
                </p>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor={`teacher-active-${teacher.id}`}>
                      Active teacher
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Keep off when the teacher is no longer available.
                    </p>
                  </div>
                  <Switch
                    id={`teacher-active-${teacher.id}`}
                    checked={teacher.isActive}
                    onCheckedChange={(checked) => {
                      void updateTeacherActive(teacher.id, checked);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEditingTeacherId(teacher.id);
                    setName(teacher.name);
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
