import type { SupabaseClient } from "@supabase/supabase-js";
import { toIsoDateOnly } from "@/lib/export/date-format";
import { getMutationErrorMessage } from "@/lib/supabase/errors";
import type { SessionStatus } from "@/lib/types";

export type UpdateSessionInput = {
  id: string;
  date: Date;
  startTime: string;
  status: SessionStatus;
};

type SessionRow = {
  id: string;
  class_id: string;
  session_date: string;
  session_time: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
};

export type UpdateSessionSuccess = {
  ok: true;
  sessionRow: SessionRow;
};

export type UpdateSessionFailure = {
  ok: false;
  error: string;
  status: number;
};

export type UpdateSessionResult = UpdateSessionSuccess | UpdateSessionFailure;

function failure(error: string, status: number): UpdateSessionFailure {
  return { ok: false, error, status };
}

export async function updateSessionInDatabase(
  supabase: SupabaseClient,
  input: UpdateSessionInput,
): Promise<UpdateSessionResult> {
  const { data: row, error: updateError } = await supabase
    .from("sessions")
    .update({
      session_date: toIsoDateOnly(input.date),
      session_time: input.startTime.trim() || null,
      status: input.status.toUpperCase(),
    })
    .eq("id", input.id)
    .select("id,class_id,session_date,session_time,status")
    .maybeSingle();

  if (updateError) {
    return failure(
      getMutationErrorMessage(updateError, "Could not update session."),
      400,
    );
  }

  if (!row) {
    return failure(
      "Session was not updated. It may have been removed or you may not have permission.",
      404,
    );
  }

  return { ok: true, sessionRow: row as SessionRow };
}
