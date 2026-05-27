"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, EyeOff, Check, Mail } from "lucide-react";
import type { ResendVerificationState } from "@/hooks/use-resend-verification";
import type { SignUpState } from "@/hooks/use-sign-up";

const VERIFY_COPY = "Check your email to verify your account";

export type SignUpFormProps = {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
  showPassword: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onInviteCodeChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendVerification: () => void;
  passwordRequirements: { label: string; met: boolean }[];
  allRequirementsMet: boolean;
  state: SignUpState;
  resendState: ResendVerificationState;
};

export function SignUpForm({
  name,
  email,
  password,
  inviteCode,
  showPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onInviteCodeChange,
  onTogglePassword,
  onSubmit,
  onResendVerification,
  passwordRequirements,
  allRequirementsMet,
  state,
  resendState,
}: SignUpFormProps) {
  const isLoading = state.status === "loading";
  const isResending = resendState.status === "loading";
  const isSuccess = state.status === "success";
  const errorMessage = state.status === "error" ? state.message : null;
  const canResend =
    isSuccess ||
    (state.status === "error" &&
      (state.reason === "account_exists" || state.reason === "rate_limited"));
  const showSignInLink =
    state.status === "error" &&
    (state.reason === "account_exists" || state.reason === "rate_limited");
  const resendMessage =
    resendState.status === "success" || resendState.status === "error"
      ? resendState.message
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient-bg px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-500 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
            CF
          </div>
          <p className="page-kicker">CLASS FEE TRACKER</p>
          <h1 className="text-2xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-muted-foreground">
            Start tracking your class fees today
          </p>
        </div>

        <Card className="shadow-xl shadow-primary/10">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign up</CardTitle>
            <CardDescription>
              Enter your details and family invite code to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSuccess ? (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>{VERIFY_COPY}</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    We sent a confirmation link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                    . After you verify, you can sign in.
                  </p>
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Link href="/login">Go to sign in</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={onResendVerification}
                      disabled={isResending}
                    >
                      {isResending ? "Sending..." : "Resend verification email"}
                    </Button>
                  </div>
                  {resendMessage ? (
                    <p
                      className={
                        resendState.status === "success"
                          ? "text-xs text-muted-foreground"
                          : "text-xs text-destructive"
                      }
                    >
                      {resendMessage}
                    </p>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {errorMessage ? (
                  <Alert variant="destructive">
                    <AlertTitle>Could not sign up</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>{errorMessage}</p>
                      {showSignInLink ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Link href="/login">Go to sign in</Link>
                        </Button>
                      ) : null}
                      {canResend ? (
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onResendVerification}
                            disabled={
                              isLoading ||
                              isResending ||
                              state.reason === "rate_limited"
                            }
                          >
                            {isResending
                              ? "Sending..."
                              : "Resend verification email"}
                          </Button>
                          {state.reason === "rate_limited" ? (
                            <p className="text-xs text-muted-foreground">
                              Resend is temporarily unavailable while the email
                              rate limit cools down.
                            </p>
                          ) : null}
                          {resendMessage ? (
                            <p
                              className={
                                resendState.status === "success"
                                  ? "text-xs text-muted-foreground"
                                  : "text-xs text-destructive"
                              }
                            >
                              {resendMessage}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    required
                    autoComplete="name"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite code</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="Enter your invite code"
                    value={inviteCode}
                    onChange={(e) => onInviteCodeChange(e.target.value)}
                    required
                    autoComplete="off"
                    disabled={isLoading}
                    spellCheck={false}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask admin for the invite code.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => onPasswordChange(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={onTogglePassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {password ? (
                    <div className="space-y-1.5 pt-2">
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className={`h-4 w-4 rounded-full flex items-center justify-center ${
                              req.met ? "bg-green-500 text-white" : "bg-muted"
                            }`}
                          >
                            {req.met && <Check className="h-3 w-3" />}
                          </div>
                          <span
                            className={
                              req.met
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading || !allRequirementsMet || !inviteCode.trim()
                  }
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {!isSuccess ? (
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
