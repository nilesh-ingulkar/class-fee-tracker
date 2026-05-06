"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  signInWithEmailPassword,
  type SignInResult,
} from "@/lib/auth/email-password";

export type SignInState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Extract<SignInResult, { ok: true }> }
  | {
      status: "error";
      reason: Extract<SignInResult, { ok: false }>["reason"];
      message: string;
    };

export function useSignIn() {
  const [state, setState] = useState<SignInState>({ status: "idle" });
  const inFlightRef = useRef(false);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const submit = useCallback(
    async (input: { email: string; password: string }) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setState({ status: "loading" });

      try {
        const client = createClient();
        const result = await signInWithEmailPassword(client, input);

        if (result.ok) {
          setState({ status: "success", result });
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
