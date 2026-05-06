"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { useSignIn } from "@/hooks/use-sign-in";

const CALLBACK_ERROR =
  "We could not complete sign-in from your link. Try signing in with email and password, or request a new confirmation email.";

export function LoginPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const { state, submit } = useSignIn();
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
    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }
    if (state.status === "success") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, state, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCallbackError(null);
    await submit({ email, password });
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
      state={state}
      callbackError={callbackError}
    />
  );
}
