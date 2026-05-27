import type { SupabaseClient } from "@supabase/supabase-js";
import {
  closeOpenFeeRulesForClass,
  shouldCreateFeeRuleChange,
  validateFeeEffectiveFrom,
} from "@/lib/fee-rules";
import { getMutationErrorMessage } from "@/lib/supabase/errors";
import type { BillingType, Currency } from "@/lib/types";

export type UpdateClassInput = {
  id: string;
  childId: string;
  teacherId: string;
  name: string;
  billingType: BillingType;
  currency: Currency;
  feeAmount: number;
  feeEffectiveFrom?: string;
  isActive: boolean;
};

type CurrencyRow = {
  id: string;
  code: string;
  symbol: string;
  name: string;
  is_active: boolean;
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

type FeeRuleRow = {
  id: string;
  class_id: string;
  amount: number | string;
  effective_from: string;
  effective_to: string | null;
};

export type UpdateClassSuccess = {
  ok: true;
  classRow: ClassRow;
  currencyRow: CurrencyRow;
  feeRuleRows: FeeRuleRow[];
  currencyCode: Currency;
};

export type UpdateClassFailure = {
  ok: false;
  error: string;
  status: number;
};

export type UpdateClassResult = UpdateClassSuccess | UpdateClassFailure;

function failure(error: string, status: number): UpdateClassFailure {
  return { ok: false, error, status };
}

/**
 * Updates a class and optional fee rules. Intended for server-side callers with a
 * cookie-authenticated Supabase client.
 */
export async function updateClassInDatabase(
  supabase: SupabaseClient,
  input: UpdateClassInput,
): Promise<UpdateClassResult> {
  const { data: currencyRow, error: currencyError } = await supabase
    .from("currencies")
    .select("id,code,symbol,name,is_active")
    .eq("code", input.currency)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (currencyError) {
    return failure(
      getMutationErrorMessage(
        currencyError,
        `Currency ${input.currency} is not active or does not exist.`,
      ),
      400,
    );
  }

  if (!currencyRow) {
    return failure(
      `Currency ${input.currency} is not active or does not exist.`,
      400,
    );
  }

  const teacherId = input.teacherId.trim() || null;

  const { data: row, error: updateError } = await supabase
    .from("classes")
    .update({
      child_id: input.childId,
      teacher_id: teacherId,
      currency_id: (currencyRow as CurrencyRow).id,
      class_name: input.name.trim(),
      billing_type: input.billingType,
      is_active: input.isActive,
    })
    .eq("id", input.id)
    .select(
      "id,child_id,teacher_id,currency_id,class_name,billing_type,is_active,created_at",
    )
    .maybeSingle();

  if (updateError) {
    return failure(
      getMutationErrorMessage(updateError, "Could not update class."),
      400,
    );
  }

  if (!row) {
    return failure(
      "Class was not updated. It may have been removed or you may not have permission.",
      404,
    );
  }

  const { data: existingFeeRules, error: existingFeeRulesError } = await supabase
    .from("fee_rules")
    .select("id,class_id,amount,effective_from,effective_to")
    .eq("class_id", input.id)
    .order("effective_from", { ascending: false });

  if (existingFeeRulesError) {
    return failure(
      getMutationErrorMessage(
        existingFeeRulesError,
        "Could not load fee rules for this class.",
      ),
      400,
    );
  }

  const feeRuleRows = (existingFeeRules ?? []) as FeeRuleRow[];
  const openRule =
    feeRuleRows.find((rule) => rule.effective_to === null) ?? feeRuleRows[0];
  const currentAmount = Number(openRule?.amount ?? input.feeAmount);
  const feeChanged = shouldCreateFeeRuleChange(currentAmount, input.feeAmount);

  let feeRulesForClass = feeRuleRows;

  if (feeChanged) {
    if (!input.feeEffectiveFrom) {
      return failure("Select when the new rate takes effect.", 400);
    }

    const validation = validateFeeEffectiveFrom(
      input.feeEffectiveFrom,
      feeRuleRows,
      input.id,
    );

    if (!validation.ok) {
      return failure(validation.message, 400);
    }

    const ruleOnSameDay = feeRuleRows.find(
      (rule) => rule.effective_from === input.feeEffectiveFrom,
    );

    if (ruleOnSameDay) {
      const { error: updateFeeError } = await supabase
        .from("fee_rules")
        .update({ amount: input.feeAmount })
        .eq("id", ruleOnSameDay.id);

      if (updateFeeError) {
        return failure(
          getMutationErrorMessage(updateFeeError, "Could not update class fee."),
          400,
        );
      }
    } else {
      const { error: closeError } = await closeOpenFeeRulesForClass(
        supabase,
        input.id,
        input.feeEffectiveFrom,
      );

      if (closeError) {
        return failure(closeError, 400);
      }

      const { data: insertedFeeRules, error: feeRuleError } = await supabase
        .from("fee_rules")
        .insert({
          class_id: input.id,
          amount: input.feeAmount,
          effective_from: input.feeEffectiveFrom,
        })
        .select("id,class_id,amount,effective_from,effective_to")
        .limit(1);

      if (feeRuleError) {
        return failure(
          getMutationErrorMessage(feeRuleError, "Could not update class fee."),
          400,
        );
      }

      if (!insertedFeeRules?.[0]) {
        return failure("Could not save the new fee rate.", 400);
      }
    }

    const { data: refreshedFeeRules, error: refreshError } = await supabase
      .from("fee_rules")
      .select("id,class_id,amount,effective_from,effective_to")
      .eq("class_id", input.id)
      .order("effective_from", { ascending: false });

    if (refreshError) {
      return failure(
        getMutationErrorMessage(
          refreshError,
          "Could not refresh fee rules for this class.",
        ),
        400,
      );
    }

    feeRulesForClass = (refreshedFeeRules ?? []) as FeeRuleRow[];
  }

  return {
    ok: true,
    classRow: row as ClassRow,
    currencyRow: currencyRow as CurrencyRow,
    feeRuleRows: feeRulesForClass,
    currencyCode: input.currency,
  };
}
