"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllClassesWithDetails,
  getChildClasses,
  type AppData,
} from "@/lib/app-data";
import { formatCurrency, type BillingType, type Currency } from "@/lib/types";
import { useAppData } from "@/hooks/use-app-data";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  GraduationCap,
  Pencil,
  Plus,
  User,
} from "lucide-react";

function ClassCard({
  cls,
  onEdit,
}: {
  cls: ReturnType<typeof getAllClassesWithDetails>[number];
  onEdit: (cls: ReturnType<typeof getAllClassesWithDetails>[number]) => void;
}) {
  return (
      <Card className="overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all h-full">
        <div className="h-1 bg-gradient-to-r from-accent via-primary/60 to-sky-400" />
        <CardHeader className="pb-2 px-4 pt-4 sm:px-6">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{cls.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {cls.teacher.name}
              </p>
            </div>
            <Badge
              variant={cls.isActive ? "default" : "secondary"}
              className="shrink-0 text-xs"
            >
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
              <span className="font-medium">
                {formatCurrency(cls.feeAmount, cls.currency)}
              </span>
            </div>
          </div>

          {cls.balance > 0 ? (
            <div className="flex items-center justify-between pt-2 border-t text-sm">
              <span className="text-muted-foreground">Balance due</span>
              <span className="font-semibold text-destructive">
                {formatCurrency(cls.balance, cls.currency)}
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(cls)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/classes/${cls.id}`}>
                View details
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
  );
}

function EmptyClasses({
  data,
  filteredChildName,
  onAddClass,
}: {
  data: AppData;
  filteredChildName?: string;
  onAddClass: () => void;
}) {
  return (
    <Empty>
      <EmptyContent>
        <EmptyMedia variant="icon">
          <GraduationCap className="h-6 w-6" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>
            {filteredChildName ? `No classes for ${filteredChildName}` : "No classes yet"}
          </EmptyTitle>
          <EmptyDescription>
            {filteredChildName
              ? `Add a class for ${filteredChildName} to start tracking sessions and fees.`
              : "Add your first class to start tracking sessions and fees."}
          </EmptyDescription>
        </EmptyHeader>
        {data.children.length === 0 ? (
          <Button asChild>
            <Link href="/children">
              <Plus className="h-4 w-4 mr-2" />
              Add a child first
            </Link>
          </Button>
        ) : data.teachers.filter((teacher) => teacher.isActive).length === 0 ? (
          <Button asChild>
            <Link href="/teachers">
              <Plus className="h-4 w-4 mr-2" />
              Add an active teacher first
            </Link>
          </Button>
        ) : data.currencies.filter((item) => item.isActive).length === 0 ? (
          <Button asChild>
            <Link href="/settings">
              <Plus className="h-4 w-4 mr-2" />
              Add a currency first
            </Link>
          </Button>
        ) : (
          <Button onClick={onAddClass}>
            <Plus className="h-4 w-4 mr-2" />
            Add {filteredChildName ? "a" : "your first"} class
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}

export default function ClassesPage() {
  const searchParams = useSearchParams();
  const childIdFilter = searchParams.get("child");
  const { data, isReady, error, addClass, updateClass } = useAppData();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [className, setClassName] = useState("");
  const [childId, setChildId] = useState(childIdFilter || "");
  const [teacherId, setTeacherId] = useState("");
  const [billingType, setBillingType] = useState<BillingType | "">("");
  const [currency, setCurrency] = useState<Currency | "">("");
  const [feeAmount, setFeeAmount] = useState("");
  const [classIsActive, setClassIsActive] = useState(true);

  const filteredChild = childIdFilter
    ? data.children.find((child) => child.id === childIdFilter)
    : null;
  const assignableTeachers = data.teachers.filter(
    (teacher) => teacher.isActive || teacher.id === teacherId,
  );
  const allClasses = childIdFilter
    ? getChildClasses(data, childIdFilter)
    : getAllClassesWithDetails(data);
  const classesByChild = childIdFilter
    ? []
    : data.children.map((child) => ({
        child,
        classes: allClasses.filter((classRecord) => classRecord.childId === child.id),
      }));

  const resetForm = () => {
    setEditingClassId(null);
    setClassName("");
    setChildId(childIdFilter || "");
    setTeacherId("");
    setBillingType("");
    setCurrency("");
    setFeeAmount("");
    setClassIsActive(true);
  };

  const startEditClass = (
    classRecord: ReturnType<typeof getAllClassesWithDetails>[number],
  ) => {
    setEditingClassId(classRecord.id);
    setClassName(classRecord.name);
    setChildId(classRecord.childId);
    setTeacherId(classRecord.teacherId);
    setBillingType(classRecord.billingType);
    setCurrency(classRecord.currency);
    setFeeAmount(String(classRecord.feeAmount));
    setClassIsActive(classRecord.isActive);
    setIsAddDialogOpen(true);
  };

  const handleAddClass = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(feeAmount);

    if (
      !className.trim() ||
      !childId ||
      !teacherId ||
      !billingType ||
      !currency ||
      Number.isNaN(amount)
    ) {
      return;
    }

    setIsAddingClass(true);
    try {
      const saved = editingClassId
        ? await updateClass({
            id: editingClassId,
            name: className,
            childId,
            teacherId,
            billingType,
            currency,
            feeAmount: amount,
            isActive: classIsActive,
          })
        : await addClass({
            name: className,
            childId,
            teacherId,
            billingType,
            currency,
            feeAmount: amount,
          });
      if (!saved) return;

      resetForm();
      setIsAddDialogOpen(false);
    } finally {
      setIsAddingClass(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="blue-panel flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0">
          {filteredChild ? (
            <>
              <Link
                href="/children"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-1.5"
              >
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
              <p className="page-kicker">Learning</p>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Classes
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage classes for all your children
              </p>
            </>
          )}
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
              <span className="hidden sm:inline">Add Class</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClassId ? "Edit class" : "Add a new class"}
              </DialogTitle>
              <DialogDescription>
                Create a class after adding at least one child and one teacher.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClass}>
              <div className="space-y-4 py-4">
                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>
                      {editingClassId ? "Could not update class" : "Could not add class"}
                    </AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {data.children.length === 0 ||
                assignableTeachers.length === 0 ||
                data.currencies.filter((item) => item.isActive).length === 0 ? (
                  <Alert>
                    <AlertTitle>Missing setup</AlertTitle>
                    <AlertDescription>
                      Add at least one child, one active teacher, and one active
                      currency before creating a class.
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="className">Class name</Label>
                  <Input
                    id="className"
                    placeholder="e.g. Piano Lessons"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    required
                    disabled={isAddingClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="child">Child</Label>
                  <Select
                    required
                    value={childId}
                    onValueChange={setChildId}
                    disabled={isAddingClass}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select
                    required
                    value={teacherId}
                    onValueChange={setTeacherId}
                    disabled={isAddingClass}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                          {teacher.isActive ? "" : " (inactive)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="billingType">Billing</Label>
                    <Select
                      required
                      value={billingType}
                      onValueChange={(value) => setBillingType(value as BillingType)}
                      disabled={isAddingClass}
                    >
                      <SelectTrigger className="w-full">
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
                    <Select
                      required
                      value={currency}
                      onValueChange={(value) => setCurrency(value as Currency)}
                      disabled={isAddingClass}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.currencies
                          .filter((item) => item.isActive)
                          .map((item) => (
                            <SelectItem key={item.id} value={item.code}>
                              {item.code} ({item.symbol})
                            </SelectItem>
                          ))}
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
                    value={feeAmount}
                    onChange={(event) => setFeeAmount(event.target.value)}
                    required
                    min="0"
                    step="0.01"
                    disabled={isAddingClass}
                  />
                </div>
                {editingClassId ? (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label htmlFor="classActive">Active class</Label>
                      <p className="text-xs text-muted-foreground">
                        Inactive classes are hidden from dashboard quick actions.
                      </p>
                    </div>
                    <Switch
                      id="classActive"
                      checked={classIsActive}
                      onCheckedChange={setClassIsActive}
                      disabled={isAddingClass}
                    />
                  </div>
                ) : null}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAddingClass}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isAddingClass ||
                    data.children.length === 0 ||
                    assignableTeachers.length === 0 ||
                    data.currencies.filter((item) => item.isActive).length === 0
                  }
                >
                  {isAddingClass ? (
                    <>
                      <Spinner className="mr-2" />
                      {editingClassId ? "Saving..." : "Adding..."}
                    </>
                  ) : (
                    editingClassId ? "Save Class" : "Add Class"
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
            Loading classes...
          </CardContent>
        </Card>
      ) : allClasses.length === 0 ? (
        <EmptyClasses
          data={data}
          filteredChildName={filteredChild?.name}
          onAddClass={() => setIsAddDialogOpen(true)}
        />
      ) : filteredChild ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {allClasses.map((classRecord) => (
            <ClassCard
              key={classRecord.id}
              cls={classRecord}
              onEdit={startEditClass}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {classesByChild.map(({ child, classes }) => (
            <div key={child.id}>
              <div className="flex items-center gap-2 mb-3">
                  <div className="cyan-icon h-8 w-8">
                    <User className="h-3.5 w-3.5" />
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
                      onClick={() => {
                        setChildId(child.id);
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add a class
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                  {classes.map((classRecord) => (
                    <ClassCard
                      key={classRecord.id}
                      cls={classRecord}
                      onEdit={startEditClass}
                    />
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
