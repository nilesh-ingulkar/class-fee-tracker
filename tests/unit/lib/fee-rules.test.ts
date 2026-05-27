import { describe, expect, it } from "vitest";
import {
  dayBefore,
  getEarliestFeeRuleDate,
  parseDateOnly,
  shouldCreateFeeRuleChange,
  toDateOnlyString,
  validateFeeEffectiveFrom,
} from "@/lib/fee-rules";

describe("fee-rules helpers", () => {
  it("toDateOnlyString formats as YYYY-MM-DD", () => {
    expect(toDateOnlyString(new Date("2024-06-15T15:30:00"))).toBe("2024-06-15");
  });

  it("dayBefore returns previous calendar day", () => {
    const result = dayBefore(parseDateOnly("2024-06-15"));
    expect(toDateOnlyString(result)).toBe("2024-06-14");
  });

  it("shouldCreateFeeRuleChange detects amount changes", () => {
    expect(shouldCreateFeeRuleChange(50, 60)).toBe(true);
    expect(shouldCreateFeeRuleChange(50, 50)).toBe(false);
    expect(shouldCreateFeeRuleChange(50, 50.0000001)).toBe(false);
  });
});

describe("getEarliestFeeRuleDate", () => {
  const classId = "class-1";

  it("returns null when the class has no fee rules", () => {
    expect(getEarliestFeeRuleDate([], classId)).toBeNull();
  });

  it("returns the minimum effective_from for the class", () => {
    expect(
      getEarliestFeeRuleDate(
        [
          { class_id: classId, effective_from: "2024-06-01" },
          { class_id: classId, effective_from: "2024-03-15" },
          { class_id: "other", effective_from: "2024-01-01" },
        ],
        classId,
      ),
    ).toBe("2024-03-15");
  });
});

describe("validateFeeEffectiveFrom", () => {
  const classId = "class-1";
  const rules = [{ class_id: classId, effective_from: "2024-06-01" }];

  it("rejects dates before the earliest rule", () => {
    const result = validateFeeEffectiveFrom("2024-05-01", rules, classId);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("2024-06-01");
    }
  });

  it("allows the earliest date and later dates", () => {
    expect(validateFeeEffectiveFrom("2024-06-01", rules, classId).ok).toBe(true);
    expect(validateFeeEffectiveFrom("2024-09-01", rules, classId).ok).toBe(true);
  });
});
