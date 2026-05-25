"use client";

import { useCallback, useRef, useState } from "react";
import {
  resendVerificationEmail,
  type ResendVerificationResult,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export type ResendVerificationState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      message: string;
      result: Extract<ResendVerificationResult, { ok: true }>;
    }
  | {
      status: "error";
      reason: Extract<ResendVerificationResult, { ok: false }>["reason"];
      message: string;
    };

export function useResendVerification() {
  const [state, setState] = useState<ResendVerificationState>({
    status: "idle",
  });
  const inFlightRef = useRef(false);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const submit = useCallback(
    async (input: { email: string; emailRedirectTo: string }) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setState({ status: "loading" });

      try {
        const client = createClient();
        const result = await resendVerificationEmail(client, input);

        if (result.ok) {
          setState({
            status: "success",
            message: result.message ?? "Verification email sent.",
            result,
          });
          return;
        }

        setState({
          status: "error",
          reason: result.reason,
          message: result.message,
        });
      } finally {
        inFlightRef.current = false;
      }
    },
    [],
  );

  return { state, submit, reset };
}
