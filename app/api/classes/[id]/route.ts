import { NextResponse } from "next/server";
import { z } from "zod";
import { updateClassInDatabase } from "@/lib/classes/update-class";
import { createClient } from "@/lib/supabase/server";

const updateClassBodySchema = z.object({
  childId: z.string().uuid(),
  teacherId: z.string().uuid(),
  name: z.string().min(1),
  billingType: z.enum(["PER_CLASS", "MONTHLY"]),
  currency: z.string().min(1).max(8),
  feeAmount: z.number().finite().nonnegative(),
  feeEffectiveFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  isActive: z.boolean(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: classId } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateClassBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the class details and try again." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Your session expired. Sign in again and retry." },
      { status: 401 },
    );
  }

  const result = await updateClassInDatabase(supabase, {
    id: classId,
    ...parsed.data,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    classRow: result.classRow,
    currencyRow: result.currencyRow,
    feeRuleRows: result.feeRuleRows,
    currencyCode: result.currencyCode,
  });
}
