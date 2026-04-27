"use client";

import { useState } from "react";
import Link from "next/link";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { mockChildren, getChildClasses } from "@/lib/mock-data";
import { Plus, User, GraduationCap, Eye } from "lucide-react";

export default function ChildrenPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddDialogOpen(false);
    setNewChildName("");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Children
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            Manage your children and their classes
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Child</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a new child</DialogTitle>
              <DialogDescription>
                Enter the name of your child to start tracking their classes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddChild}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Child&apos;s name</Label>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
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
                <Button type="submit">Add Child</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {mockChildren.length === 0 ? (
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
          {mockChildren.map((child) => {
            const classes = getChildClasses(child.id);
            const activeClasses = classes.filter((c) => c.isActive);

            return (
              <Card
                key={child.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2 px-4 pt-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
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

                  <Link
                    href={`/classes?child=${child.id}`}
                    className="block pt-1"
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Classes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
