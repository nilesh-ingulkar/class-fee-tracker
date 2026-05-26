"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getChildClasses } from "@/lib/app-data";
import { useAppData } from "@/hooks/use-app-data";
import { Plus, User, GraduationCap, Eye, Pencil } from "lucide-react";

export default function ChildrenPage() {
  const { data, isReady, error, addChild, updateChild } = useAppData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [newChildName, setNewChildName] = useState("");
  const [isAddingChild, setIsAddingChild] = useState(false);

  const resetForm = () => {
    setEditingChildId(null);
    setNewChildName("");
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    setIsAddingChild(true);
    try {
      const saved = editingChildId
        ? await updateChild({ id: editingChildId, name: newChildName })
        : await addChild({ name: newChildName });
      if (!saved) return;

      setIsAddDialogOpen(false);
      resetForm();
    } finally {
      setIsAddingChild(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="blue-panel flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0">
          <p className="page-kicker">People</p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Children
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            Manage your children and their classes
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
              <span className="hidden sm:inline">Add Child</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingChildId ? "Edit child" : "Add a new child"}
              </DialogTitle>
              <DialogDescription>
                Enter the name of your child to start tracking their classes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddChild}>
              <div className="space-y-4 py-4">
                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>
                      {editingChildId ? "Could not update child" : "Could not add child"}
                    </AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="name">Child&apos;s name</Label>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    required
                    disabled={isAddingChild}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAddingChild}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAddingChild}>
                  {isAddingChild ? (
                    <>
                      <Spinner className="mr-2" />
                      {editingChildId ? "Saving..." : "Adding..."}
                    </>
                  ) : (
                    editingChildId ? "Save Child" : "Add Child"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!isReady ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading children...
          </CardContent>
        </Card>
      ) : data.children.length === 0 ? (
        <Empty>
          <EmptyContent>
            <EmptyMedia variant="icon">
              <User className="h-6 w-6" />
            </EmptyMedia>

            <EmptyHeader>
              <EmptyTitle>No children yet</EmptyTitle>
              <EmptyDescription>
                Add your first child to start tracking their classes and fees.
              </EmptyDescription>
            </EmptyHeader>

            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first child
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {data.children.map((child) => {
            const classes = getChildClasses(data, child.id);
            const activeClasses = classes.filter((c) => c.isActive);

            return (
              <Card
                key={child.id}
                className="overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                <div className="h-1 bg-gradient-to-r from-primary via-sky-400 to-accent" />
                <CardHeader className="pb-2 px-4 pt-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="blue-icon h-10 w-10 rounded-2xl">
                      <User className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base truncate sm:text-lg">
                      {child.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3 sm:px-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span>
                      {activeClasses.length} active{" "}
                      {activeClasses.length === 1 ? "class" : "classes"}
                    </span>
                  </div>

                  {activeClasses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activeClasses.slice(0, 2).map((cls) => (
                        <Badge
                          key={cls.id}
                          variant="secondary"
                          className="text-xs truncate max-w-[120px]"
                        >
                          {cls.name}
                        </Badge>
                      ))}
                      {activeClasses.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{activeClasses.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingChildId(child.id);
                        setNewChildName(child.name);
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/classes?child=${child.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Classes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
