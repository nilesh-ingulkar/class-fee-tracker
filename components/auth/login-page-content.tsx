"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import {
  getEmailConfirmationRedirectUrl,
  getSafeRedirectPath,
} from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useResendVerification } from "@/hooks/use-resend-verification";
import { useSignIn } from "@/hooks/use-sign-in";

const CALLBACK_ERROR =
  "We could not complete sign-in from your link. Try signing in with email and password, or request a new confirmation email.";

export function LoginPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const { state, submit } = useSignIn();
  const { state: resendState, submit: resendVerification } =
    useResendVerification();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "auth_callback") {
      setCallbackError(CALLBACK_ERROR);
    } else {
      setCallbackError(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const nextPath = getSafeRedirectPath(searchParams.get("next"));

    if (isAuthenticated) {
      router.replace(nextPath);
      return;
    }
    if (state.status === "success") {
      router.replace(nextPath);
    }
  }, [isAuthenticated, state, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCallbackError(null);
    await submit({ email, password });
  };

  const handleResendVerification = async () => {
    await resendVerification({
      email,
      emailRedirectTo: getEmailConfirmationRedirectUrl(window.location.origin),
    });
  };

  return (
    <LoginForm
      email={email}
      password={password}
      showPassword={showPassword}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onTogglePassword={() => setShowPassword((v) => !v)}
      onSubmit={handleSubmit}
      onResendVerification={handleResendVerification}
      state={state}
      resendState={resendState}
      callbackError={callbackError}
    />
  );
}
