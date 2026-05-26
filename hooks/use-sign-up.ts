"use client";

import { useCallback, useRef, useState } from "react";
import type { SignUpFailureReason } from "@/lib/auth";
import {
  isSignUpApiSuccess,
  type SignUpApiErrorResponse,
  type SignUpApiResponse,
} from "@/lib/auth/signup-api";

export type SignUpState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | {
      status: "error";
      reason: SignUpFailureReason | "invalid_invite";
      message: string;
    };

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
      inviteCode: string;
      fullName?: string;
      emailRedirectTo: string;
    }) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setState({ status: "loading" });

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: input.email,
            password: input.password,
            inviteCode: input.inviteCode,
            fullName: input.fullName,
            emailRedirectTo: input.emailRedirectTo,
          }),
        });

        const body = (await response.json()) as SignUpApiResponse;

        if (response.ok && isSignUpApiSuccess(body)) {
          setState({ status: "success", message: body.message });
          return;
        }

        const errorBody = body as SignUpApiErrorResponse;

        setState({
          status: "error",
          reason:
            response.status === 401
              ? "invalid_invite"
              : (errorBody.reason ?? "unknown"),
          message: errorBody.error ?? "Could not create your account. Try again.",
        });
      } catch {
        setState({
          status: "error",
          reason: "unknown",
          message: "Could not create your account. Try again.",
        });
      } finally {
        inFlightRef.current = false;
      }
    },
    [],
  );

  return { state, submit, reset };
}
