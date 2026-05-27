import { NextResponse } from "next/server";
import { z } from "zod";
import { updateSessionInDatabase } from "@/lib/sessions/update-session";
import { createClient } from "@/lib/supabase/server";

const updateSessionBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().max(8).optional().default(""),
  status: z.enum(["scheduled", "completed", "cancelled"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateSessionBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the session details and try again." },
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

  const result = await updateSessionInDatabase(supabase, {
    id: sessionId,
    date: new Date(`${parsed.data.date}T00:00:00`),
    startTime: parsed.data.startTime ?? "",
    status: parsed.data.status,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ sessionRow: result.sessionRow });
}
