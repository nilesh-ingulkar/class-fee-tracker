import type { SupabaseClient } from "@supabase/supabase-js";
import { getMutationErrorMessage } from "@/lib/supabase/errors";

export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dayBefore(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - 1);
  return result;
}

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function shouldCreateFeeRuleChange(
  currentAmount: number,
  newAmount: number,
): boolean {
  return Math.abs(currentAmount - newAmount) > 0.000_001;
}

export type FeeRuleEffectiveDateSource = {
  classId?: string;
  class_id?: string;
  effectiveFrom?: Date;
  effective_from?: string;
};

function getEffectiveFromDateString(rule: FeeRuleEffectiveDateSource): string | null {
  if (rule.effective_from) {
    return rule.effective_from;
  }

  if (rule.effectiveFrom) {
    return toDateOnlyString(rule.effectiveFrom);
  }

  return null;
}

/** Earliest `effective_from` for a class, or null if the class has no fee rules. */
export function getEarliestFeeRuleDate(
  feeRules: FeeRuleEffectiveDateSource[],
  classId: string,
): string | null {
  const dates = feeRules
    .filter((rule) => (rule.classId ?? rule.class_id) === classId)
    .map(getEffectiveFromDateString)
    .filter((date): date is string => date !== null);

  if (dates.length === 0) {
    return null;
  }

  return dates.reduce((earliest, date) => (date < earliest ? date : earliest));
}

export function validateFeeEffectiveFrom(
  effectiveFrom: string,
  feeRules: FeeRuleEffectiveDateSource[],
  classId: string,
): { ok: true } | { ok: false; message: string } {
  const earliest = getEarliestFeeRuleDate(feeRules, classId);

  if (!earliest || effectiveFrom >= earliest) {
    return { ok: true };
  }

  return {
    ok: false,
    message: `Rate cannot start before ${earliest} (first rate for this class).`,
  };
}

/**
 * Closes open fee rules for a class that start before the new effective date.
 * Sets effective_to to the day before the new rate takes effect.
 */
export async function closeOpenFeeRulesForClass(
  supabase: SupabaseClient,
  classId: string,
  effectiveFrom: string,
): Promise<{ error: string | null }> {
  const closeThrough = toDateOnlyString(dayBefore(parseDateOnly(effectiveFrom)));

  try {
    const { error } = await supabase
      .from("fee_rules")
      .update({ effective_to: closeThrough })
      .eq("class_id", classId)
      .is("effective_to", null)
      .lt("effective_from", effectiveFrom);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (cause) {
    return {
      error: getMutationErrorMessage(
        cause,
        "Could not close the previous fee rate.",
      ),
    };
  }
}
