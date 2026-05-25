"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getEmailConfirmationRedirectUrl } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useResendVerification } from "@/hooks/use-resend-verification";
import { useSignUp } from "@/hooks/use-sign-up";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { state, submit } = useSignUp();
  const { state: resendState, submit: resendVerification } =
    useResendVerification();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequirementsMet) return;

    await submit({
      email,
      password,
      fullName: name.trim() || undefined,
      emailRedirectTo: getEmailConfirmationRedirectUrl(window.location.origin),
    });
  };

  const handleResendVerification = async () => {
    await resendVerification({
      email,
      emailRedirectTo: getEmailConfirmationRedirectUrl(window.location.origin),
    });
  };

  return (
    <SignUpForm
      name={name}
      email={email}
      password={password}
      showPassword={showPassword}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onTogglePassword={() => setShowPassword((v) => !v)}
      onSubmit={handleSubmit}
      onResendVerification={handleResendVerification}
      passwordRequirements={passwordRequirements}
      allRequirementsMet={allRequirementsMet}
      state={state}
      resendState={resendState}
    />
  );
}
