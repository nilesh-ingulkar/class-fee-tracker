"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { emptyAppData, type AppData } from "@/lib/app-data";
import type { BillingType, Currency, SessionStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getMutationErrorMessage } from "@/lib/supabase/errors";
import { useAuth } from "@/hooks/use-auth";

type ChildRow = {
  id: string;
  profile_id: string;
  name: string;
  created_at: string;
};

type TeacherRow = {
  id: string;
  profile_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

type ClassRow = {
  id: string;
  child_id: string;
  teacher_id: string | null;
  currency_id: string | null;
  class_name: string;
  billing_type: BillingType;
  is_active: boolean;
  created_at: string;
};

type CurrencyRow = {
  id: string;
  code: string;
  symbol: string;
  name: string;
  is_active: boolean;
};

type FeeRuleRow = {
  id: string;
  class_id: string;
  amount: number | string;
  effective_from: string;
  effective_to: string | null;
};

type SessionRow = {
  id: string;
  class_id: string;
  session_date: string;
  session_time: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
};

type PaymentRow = {
  id: string;
  class_id: string;
  amount: number | string;
  payment_date: string;
  note: string | null;
};

function toDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

function mapChild(row: ChildRow): AppData["children"][number] {
  return {
    id: row.id,
    userId: row.profile_id,
    name: row.name,
    createdAt: new Date(row.created_at),
  };
}

function mapTeacher(row: TeacherRow): AppData["teachers"][number] {
  return {
    id: row.id,
    userId: row.profile_id,
    name: row.name,
    isActive: row.is_active,
  };
}

function mapCurrency(row: CurrencyRow): AppData["currencies"][number] {
  return {
    id: row.id,
    code: row.code,
    symbol: row.symbol,
    name: row.name,
    isActive: row.is_active,
  };
}

function mapFeeRule(row: FeeRuleRow): AppData["feeRules"][number] {
  return {
    id: row.id,
    classId: row.class_id,
    amount: Number(row.amount),
    effectiveFrom: new Date(`${row.effective_from}T00:00:00`),
    effectiveTo: row.effective_to
      ? new Date(`${row.effective_to}T00:00:00`)
      : undefined,
  };
}

function getCurrentFeeRule(
  feeRules: FeeRuleRow[],
  classId: string,
): FeeRuleRow | undefined {
  return feeRules
    .filter((rule) => rule.class_id === classId)
    .sort(
      (a, b) =>
        new Date(b.effective_from).getTime() -
        new Date(a.effective_from).getTime(),
    )[0];
}

function mapClass(
  row: ClassRow,
  currencies: CurrencyRow[],
  feeRules: FeeRuleRow[],
  fallbackCurrency: Currency = "USD",
): AppData["classes"][number] {
  const currency = currencies.find((item) => item.id === row.currency_id);
  const feeRule = getCurrentFeeRule(feeRules, row.id);

  return {
    id: row.id,
    childId: row.child_id,
    teacherId: row.teacher_id ?? "",
    name: row.class_name,
    billingType: row.billing_type,
    currency: currency?.code ?? fallbackCurrency,
    feeAmount: Number(feeRule?.amount ?? 0),
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
  };
}

function mapSession(row: SessionRow): AppData["sessions"][number] {
  return {
    id: row.id,
    classId: row.class_id,
    date: new Date(`${row.session_date}T00:00:00`),
    startTime: row.session_time?.slice(0, 5) ?? "",
    endTime: "",
    status: row.status.toLowerCase() as SessionStatus,
  };
}

function mapPayment(
  row: PaymentRow,
  classes: AppData["classes"],
): AppData["payments"][number] {
  const classRecord = classes.find((item) => item.id === row.class_id);

  return {
    id: row.id,
    classId: row.class_id,
    amount: Number(row.amount),
    currency: classRecord?.currency ?? "USD",
    date: new Date(`${row.payment_date}T00:00:00`),
    notes: row.note ?? undefined,
  };
}

export function useAppData() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(emptyAppData);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!user) {
        setData(emptyAppData);
        setIsReady(true);
        return;
      }

      setIsReady(false);
      setError(null);

      const supabase = createClient();
      const [
        childrenResult,
        teachersResult,
        classesResult,
        currenciesResult,
        feeRulesResult,
        sessionsResult,
        paymentsResult,
      ] = await Promise.all([
        supabase
          .from("children")
          .select("id,profile_id,name,created_at")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("teachers")
          .select("id,profile_id,name,is_active,created_at")
          .eq("profile_id", user.id)
          .order("name", { ascending: true }),
        supabase
          .from("classes")
          .select(
            "id,child_id,teacher_id,currency_id,class_name,billing_type,is_active,created_at",
          )
          .order("created_at", { ascending: true }),
        supabase
          .from("currencies")
          .select("id,code,symbol,name,is_active")
          .eq("is_active", true),
        supabase
          .from("fee_rules")
          .select("id,class_id,amount,effective_from,effective_to")
          .order("effective_from", { ascending: false }),
        supabase
          .from("sessions")
          .select("id,class_id,session_date,session_time,status")
          .order("session_date", { ascending: true }),
        supabase
          .from("payments")
          .select("id,class_id,amount,payment_date,note")
          .order("payment_date", { ascending: false }),
      ]);

      if (cancelled) return;

      const firstError =
        childrenResult.error ??
        teachersResult.error ??
        classesResult.error ??
        currenciesResult.error ??
        feeRulesResult.error ??
        sessionsResult.error ??
        paymentsResult.error;

      if (firstError) {
        setError(firstError.message);
        setData(emptyAppData);
        setIsReady(true);
        return;
      }

      const currencies = (currenciesResult.data ?? []) as CurrencyRow[];
      const feeRules = (feeRulesResult.data ?? []) as FeeRuleRow[];
      const classes = ((classesResult.data ?? []) as ClassRow[]).map((row) =>
        mapClass(row, currencies, feeRules),
      );

      setData({
        children: ((childrenResult.data ?? []) as ChildRow[]).map(mapChild),
        teachers: ((teachersResult.data ?? []) as TeacherRow[]).map(mapTeacher),
        classes,
        sessions: ((sessionsResult.data ?? []) as SessionRow[]).map(mapSession),
        payments: ((paymentsResult.data ?? []) as PaymentRow[]).map((row) =>
          mapPayment(row, classes),
        ),
        feeRules: feeRules.map(mapFeeRule),
        currencies: currencies.map(mapCurrency),
      });
      setIsReady(true);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addChild = useCallback(
    async (input: { name: string }) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: insertError } = await supabase
        .from("children")
        .insert({
          profile_id: user.id,
          name: input.name.trim(),
        })
        .select("id,profile_id,name,created_at")
        .single();

      if (insertError || !row) {
        setError(insertError?.message ?? "Could not add child.");
        return null;
      }

      const child = mapChild(row as ChildRow);
      setData((current) => ({
        ...current,
        children: [...current.children, child],
      }));
      return child;
    },
    [user],
  );

  const addTeacher = useCallback(
    async (input: { name: string; email?: string; phone?: string }) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: insertError } = await supabase
        .from("teachers")
        .insert({
          profile_id: user.id,
          name: input.name.trim(),
          is_active: true,
        })
        .select("id,profile_id,name,is_active,created_at")
        .single();

      if (insertError || !row) {
        setError(insertError?.message ?? "Could not add teacher.");
        return null;
      }

      const teacher = mapTeacher(row as TeacherRow);
      setData((current) => ({
        ...current,
        teachers: [...current.teachers, teacher],
      }));
      return teacher;
    },
    [user],
  );

  const updateChild = useCallback(
    async (input: { id: string; name: string }) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: updateError } = await supabase
        .from("children")
        .update({ name: input.name.trim() })
        .eq("id", input.id)
        .select("id,profile_id,name,created_at")
        .single();

      if (updateError || !row) {
        setError(updateError?.message ?? "Could not update child.");
        return null;
      }

      const child = mapChild(row as ChildRow);
      setData((current) => ({
        ...current,
        children: current.children.map((item) =>
          item.id === child.id ? child : item,
        ),
      }));
      return child;
    },
    [user],
  );

  const updateTeacher = useCallback(
    async (input: { id: string; name: string }) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: updateError } = await supabase
        .from("teachers")
        .update({ name: input.name.trim() })
        .eq("id", input.id)
        .select("id,profile_id,name,is_active,created_at")
        .single();

      if (updateError || !row) {
        setError(updateError?.message ?? "Could not update teacher.");
        return null;
      }

      const teacher = mapTeacher(row as TeacherRow);
      setData((current) => ({
        ...current,
        teachers: current.teachers.map((item) =>
          item.id === teacher.id ? teacher : item,
        ),
      }));
      return teacher;
    },
    [user],
  );

  const updateTeacherActive = useCallback(
    async (id: string, isActive: boolean) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: updateError } = await supabase
        .from("teachers")
        .update({ is_active: isActive })
        .eq("id", id)
        .select("id,profile_id,name,is_active,created_at")
        .single();

      if (updateError || !row) {
        setError(updateError?.message ?? "Could not update teacher status.");
        return null;
      }

      const teacher = mapTeacher(row as TeacherRow);
      setData((current) => ({
        ...current,
        teachers: current.teachers.map((item) =>
          item.id === teacher.id ? teacher : item,
        ),
      }));
      return teacher;
    },
    [user],
  );

  const addClass = useCallback(
    async (input: {
      childId: string;
      teacherId: string;
      name: string;
      billingType: BillingType;
      currency: Currency;
      feeAmount: number;
    }) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: currencyRow, error: currencyError } = await supabase
        .from("currencies")
        .select("id,code,symbol,name,is_active")
        .eq("code", input.currency)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (currencyError || !currencyRow) {
        setError(
          currencyError?.message ??
            `Currency ${input.currency} is not active or does not exist.`,
        );
        return null;
      }

      const { data: insertedClasses, error: insertError } = await supabase
        .from("classes")
        .insert({
          child_id: input.childId,
          teacher_id: input.teacherId,
          currency_id: (currencyRow as CurrencyRow).id,
          class_name: input.name.trim(),
          billing_type: input.billingType,
        })
        .select(
          "id,child_id,teacher_id,currency_id,class_name,billing_type,is_active,created_at",
        )
        .limit(1);

      const row = (insertedClasses?.[0] ?? null) as ClassRow | null;

      if (insertError || !row) {
        setError(insertError?.message ?? "Could not add class.");
        return null;
      }

      const { data: insertedFeeRules, error: feeRuleError } = await supabase
        .from("fee_rules")
        .insert({
          class_id: row.id,
          amount: input.feeAmount,
          effective_from: toDateOnly(new Date()),
        })
        .select("id,class_id,amount,effective_from,effective_to")
        .limit(1);

      const feeRuleRow = (insertedFeeRules?.[0] ?? null) as FeeRuleRow | null;

      if (feeRuleError || !feeRuleRow) {
        setError(feeRuleError?.message ?? "Could not add class fee.");
        return null;
      }

      const classRecord = mapClass(
        row,
        [currencyRow as CurrencyRow],
        [feeRuleRow],
        input.currency,
      );
      setData((current) => ({
        ...current,
        classes: [...current.classes, classRecord],
        feeRules: [...current.feeRules, mapFeeRule(feeRuleRow)],
      }));
      return classRecord;
    },
    [user],
  );

  const updateClass = useCallback(
    async (input: {
      id: string;
      childId: string;
      teacherId: string;
      name: string;
      billingType: BillingType;
      currency: Currency;
      feeAmount: number;
      feeEffectiveFrom?: string;
      isActive: boolean;
    }) => {
      if (!user) return null;

      setError(null);

      try {
        const response = await fetch(`/api/classes/${input.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId: input.childId,
            teacherId: input.teacherId,
            name: input.name,
            billingType: input.billingType,
            currency: input.currency,
            feeAmount: input.feeAmount,
            feeEffectiveFrom: input.feeEffectiveFrom,
            isActive: input.isActive,
          }),
        });

        type UpdateClassResponse = {
          error?: string;
          classRow?: ClassRow;
          currencyRow?: CurrencyRow;
          feeRuleRows?: FeeRuleRow[];
          currencyCode?: Currency;
        };

        let payload: UpdateClassResponse = {};

        try {
          payload = (await response.json()) as UpdateClassResponse;
        } catch {
          payload = {};
        }

        if (!response.ok) {
          setError(payload.error ?? "Could not update class.");
          return null;
        }

        if (!payload.classRow || !payload.currencyRow || !payload.feeRuleRows) {
          setError("Could not update class.");
          return null;
        }

        const classRecord = mapClass(
          payload.classRow,
          [payload.currencyRow],
          payload.feeRuleRows,
          payload.currencyCode ?? input.currency,
        );
        setData((current) => ({
          ...current,
          classes: current.classes.map((item) =>
            item.id === classRecord.id ? classRecord : item,
          ),
          feeRules: [
            ...current.feeRules.filter((rule) => rule.classId !== input.id),
            ...payload.feeRuleRows!.map(mapFeeRule),
          ],
        }));
        return classRecord;
      } catch (cause) {
        setError(getMutationErrorMessage(cause, "Could not update class."));
        return null;
      }
    },
    [user],
  );

  const addSession = useCallback(
    async (input: {
      classId: string;
      date: Date;
      startTime: string;
      status: SessionStatus;
      notes?: string;
    }) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: insertError } = await supabase
        .from("sessions")
        .insert({
          class_id: input.classId,
          session_date: toDateOnly(input.date),
          session_time: input.startTime || null,
          status: input.status.toUpperCase(),
        })
        .select("id,class_id,session_date,session_time,status")
        .single();

      if (insertError || !row) {
        setError(insertError?.message ?? "Could not add session.");
        return null;
      }

      const session = mapSession(row as SessionRow);
      setData((current) => ({
        ...current,
        sessions: [...current.sessions, session],
      }));
      return session;
    },
    [user],
  );

  const updateSession = useCallback(
    async (input: {
      id: string;
      date: Date;
      startTime: string;
      status: SessionStatus;
    }) => {
      if (!user) return null;

      setError(null);

      try {
        const response = await fetch(`/api/sessions/${input.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: toDateOnly(input.date),
            startTime: input.startTime,
            status: input.status,
          }),
        });

        type UpdateSessionResponse = {
          error?: string;
          sessionRow?: SessionRow;
        };

        let payload: UpdateSessionResponse = {};

        try {
          payload = (await response.json()) as UpdateSessionResponse;
        } catch {
          payload = {};
        }

        if (!response.ok) {
          setError(payload.error ?? "Could not update session.");
          return null;
        }

        if (!payload.sessionRow) {
          setError("Could not update session.");
          return null;
        }

        const session = mapSession(payload.sessionRow);
        setData((current) => ({
          ...current,
          sessions: current.sessions.map((item) =>
            item.id === session.id ? session : item,
          ),
        }));
        return session;
      } catch (cause) {
        setError(getMutationErrorMessage(cause, "Could not update session."));
        return null;
      }
    },
    [user],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      if (!user) return false;

      setError(null);
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("sessions")
        .delete()
        .eq("id", id);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      setData((current) => ({
        ...current,
        sessions: current.sessions.filter((item) => item.id !== id),
      }));
      return true;
    },
    [user],
  );

  const addPayment = useCallback(
    async (input: {
      classId: string;
      amount: number;
      currency: Currency;
      date: Date;
      notes?: string;
    }) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: insertError } = await supabase
        .from("payments")
        .insert({
          class_id: input.classId,
          amount: input.amount,
          payment_date: toDateOnly(input.date),
          note: input.notes?.trim() || null,
        })
        .select("id,class_id,amount,payment_date,note")
        .single();

      if (insertError || !row) {
        setError(insertError?.message ?? "Could not add payment.");
        return null;
      }

      const payment = mapPayment(row as PaymentRow, data.classes);
      setData((current) => ({
        ...current,
        payments: [...current.payments, payment],
      }));
      return payment;
    },
    [data.classes, user],
  );

  const updatePayment = useCallback(
    async (input: {
      id: string;
      amount: number;
      date: Date;
      notes?: string;
    }) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: updateError } = await supabase
        .from("payments")
        .update({
          amount: input.amount,
          payment_date: toDateOnly(input.date),
          note: input.notes?.trim() || null,
        })
        .eq("id", input.id)
        .select("id,class_id,amount,payment_date,note")
        .single();

      if (updateError || !row) {
        setError(updateError?.message ?? "Could not update payment.");
        return null;
      }

      const payment = mapPayment(row as PaymentRow, data.classes);
      setData((current) => ({
        ...current,
        payments: current.payments.map((item) =>
          item.id === payment.id ? payment : item,
        ),
      }));
      return payment;
    },
    [data.classes, user],
  );

  const deletePayment = useCallback(
    async (id: string) => {
      if (!user) return false;

      setError(null);
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("payments")
        .delete()
        .eq("id", id);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      setData((current) => ({
        ...current,
        payments: current.payments.filter((item) => item.id !== id),
      }));
      return true;
    },
    [user],
  );

  const addCurrency = useCallback(
    async (input: { code: string; name: string; symbol: string }) => {
      if (!user) return null;

      setError(null);
      const code = input.code.trim().toUpperCase();
      const supabase = createClient();
      const { data: row, error: upsertError } = await supabase
        .from("currencies")
        .upsert(
          {
            code,
            name: input.name.trim(),
            symbol: input.symbol.trim(),
            is_active: true,
          },
          { onConflict: "code" },
        )
        .select("id,code,symbol,name,is_active")
        .limit(1)
        .maybeSingle();

      if (upsertError || !row) {
        setError(upsertError?.message ?? "Could not add currency.");
        return null;
      }

      const currency = mapCurrency(row as CurrencyRow);
      setData((current) => ({
        ...current,
        currencies: [
          ...current.currencies.filter((item) => item.code !== currency.code),
          currency,
        ].sort((a, b) => a.code.localeCompare(b.code)),
      }));
      return currency;
    },
    [user],
  );

  const setCurrencyActive = useCallback(
    async (code: string, isActive: boolean) => {
      if (!user) return null;

      setError(null);
      const supabase = createClient();
      const { data: row, error: updateError } = await supabase
        .from("currencies")
        .update({ is_active: isActive })
        .eq("code", code)
        .select("id,code,symbol,name,is_active")
        .limit(1)
        .maybeSingle();

      if (updateError || !row) {
        setError(updateError?.message ?? "Could not update currency.");
        return null;
      }

      const currency = mapCurrency(row as CurrencyRow);
      setData((current) => ({
        ...current,
        currencies: current.currencies.map((item) =>
          item.code === currency.code ? currency : item,
        ),
      }));
      return currency;
    },
    [user],
  );

  return useMemo(
    () => ({
      data,
      isReady,
      error,
      addChild,
      addTeacher,
      updateChild,
      updateTeacher,
      updateTeacherActive,
      addClass,
      updateClass,
      addSession,
      updateSession,
      deleteSession,
      addPayment,
      updatePayment,
      deletePayment,
      addCurrency,
      setCurrencyActive,
    }),
    [
      addChild,
      addClass,
      addCurrency,
      addPayment,
      addSession,
      addTeacher,
      data,
      deletePayment,
      deleteSession,
      error,
      isReady,
      setCurrencyActive,
      updateChild,
      updateClass,
      updatePayment,
      updateSession,
      updateTeacher,
      updateTeacherActive,
    ],
  );
}
