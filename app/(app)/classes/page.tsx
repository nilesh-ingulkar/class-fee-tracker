"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty } from "@/components/ui/empty";
import {
  mockChildren,
  mockTeachers,
  getAllClassesWithDetails,
  getChildClasses,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/types";
import {
  Plus,
  GraduationCap,
  User,
  DollarSign,
  Calendar,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function ClassesPage() {
  const searchParams = useSearchParams();
  const childIdFilter = searchParams.get("child");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const filteredChild = childIdFilter 
    ? mockChildren.find(c => c.id === childIdFilter) 
    : null;
  
  const allClasses = childIdFilter 
    ? getChildClasses(childIdFilter)
    : getAllClassesWithDetails();

  const classesByChild = childIdFilter
    ? []
    : mockChildren.map((child) => ({
        child,
        classes: allClasses.filter((c) => c.childId === child.id),
      }));

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddDialogOpen(false);
  };

  const ClassCard = ({ cls }: { cls: typeof allClasses[0] }) => (
    <Link href={`/classes/${cls.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-6">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{cls.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {cls.teacher.name}
              </p>
            </div>
            <Badge variant={cls.isActive ? "default" : "secondary"} className="shrink-0 text-xs">
              {cls.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2 sm:px-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{cls.billingType === "PER_CLASS" ? "Per Class" : "Monthly"}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium">
                {formatCurrency(cls.feeAmount, cls.currency)}
              </span>
            </div>
          </div>

          {cls.balance > 0 && (
            <div className="flex items-center justify-between pt-2 border-t text-sm">
              <span className="text-muted-foreground">Balance due</span>
              <span className="font-semibold text-destructive">
                {formatCurrency(cls.balance, cls.currency)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end text-xs text-muted-foreground pt-1">
            <span>View details</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {filteredChild ? (
            <>
              <Link href="/children" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-1.5">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Link>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl truncate">
                {filteredChild.name}&apos;s Classes
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {allClasses.length} {allClasses.length === 1 ? "class" : "classes"}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Classes
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage classes for all your children
              </p>
            </>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Class</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a new class</DialogTitle>
              <DialogDescription>
                Create a new class for one of your children.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClass}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class name</Label>
                  <Input id="className" placeholder="e.g. Piano Lessons" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child">Child</Label>
                  <Select required defaultValue={childIdFilter || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockChildren.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="billingType">Billing</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PER_CLASS">Per Class</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeAmount">Fee amount</Label>
                  <Input
                    id="feeAmount"
                    type="number"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
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
                <Button type="submit">Add Class</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {allClasses.length === 0 ? (
        <Empty
          icon={GraduationCap}
          title={filteredChild ? `No classes for ${filteredChild.name}` : "No classes yet"}
          description={filteredChild 
            ? `Add a class for ${filteredChild.name} to start tracking sessions and fees.`
            : "Add your first class to start tracking sessions and fees."
          }
        >
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add {filteredChild ? "a" : "your first"} class
          </Button>
        </Empty>
      ) : filteredChild ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {allClasses.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {classesByChild.map(({ child, classes }) => (
            <div key={child.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <h2 className="text-base font-semibold truncate">{child.name}</h2>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {classes.length}
                </Badge>
              </div>

              {classes.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No classes for {child.name} yet.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add a class
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                  {classes.map((cls) => (
                    <ClassCard key={cls.id} cls={cls} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
