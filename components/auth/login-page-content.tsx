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
  "We could not complete sign-in from your link. Open the link in the same browser where you signed up, or sign in with email and password after verifying your email. You can also request a new confirmation email from sign up.";

const VERIFIED_MESSAGE =
  "Your email is verified. Sign in with your email and password.";

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
  const [verifiedMessage, setVerifiedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "auth_callback") {
      setCallbackError(CALLBACK_ERROR);
      setVerifiedMessage(null);
    } else if (searchParams.get("verified") === "1") {
      setVerifiedMessage(VERIFIED_MESSAGE);
      setCallbackError(null);
    } else {
      setCallbackError(null);
      setVerifiedMessage(null);
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
      emailRedirectTo: getEmailConfirmationRedirectUrl(),
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
      verifiedMessage={verifiedMessage}
    />
  );
}
