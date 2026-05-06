"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  signUpWithEmailPassword,
  type SignUpResult,
} from "@/lib/auth/email-password";

export type SignUpState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Extract<SignUpResult, { ok: true }> }
  | { status: "error"; message: string };

export function useSignUp() {
  const [state, setState] = useState<SignUpState>({ status: "idle" });
  const inFlightRef = useRef(false);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const submit = useCallback(
    async (input: {
      email: string;
      password: string;
      fullName?: string;
      emailRedirectTo: string;
    }) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setState({ status: "loading" });

      try {
        const client = createClient();
        const result = await signUpWithEmailPassword(client, input);

        if (result.ok) {
          setState({ status: "success", result });
          return;
        }

        setState({ status: "error", message: result.message });
      } finally {
        inFlightRef.current = false;
      }
    },
    [],
  );

  return { state, submit, reset };
}
