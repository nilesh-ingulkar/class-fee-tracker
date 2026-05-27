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
import { Eye, EyeOff } from "lucide-react";
import type { ResendVerificationState } from "@/hooks/use-resend-verification";
import type { SignInState } from "@/hooks/use-sign-in";

export type LoginFormProps = {
  email: string;
  password: string;
  showPassword: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onResendVerification: () => void;
  state: SignInState;
  resendState: ResendVerificationState;
  callbackError: string | null;
  verifiedMessage?: string | null;
};

export function LoginForm({
  email,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onResendVerification,
  state,
  resendState,
  callbackError,
  verifiedMessage,
}: LoginFormProps) {
  const isLoading = state.status === "loading";
  const isResending = resendState.status === "loading";
  const errorMessage =
    state.status === "error" ? state.message : null;
  const isEmailNotConfirmed =
    state.status === "error" && state.reason === "email_not_confirmed";
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
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your Class Fee Tracker account
          </p>
        </div>

        <Card className="shadow-xl shadow-primary/10">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {verifiedMessage ? (
                <Alert>
                  <AlertTitle>Email verified</AlertTitle>
                  <AlertDescription>{verifiedMessage}</AlertDescription>
                </Alert>
              ) : null}

              {callbackError ? (
                <Alert variant="destructive">
                  <AlertTitle>Sign-in link issue</AlertTitle>
                  <AlertDescription>{callbackError}</AlertDescription>
                </Alert>
              ) : null}

              {errorMessage ? (
                <Alert variant={isEmailNotConfirmed ? "default" : "destructive"}>
                  <AlertTitle>
                    {isEmailNotConfirmed ? "Email not verified" : "Sign in failed"}
                  </AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>{errorMessage}</p>
                    {isEmailNotConfirmed ? (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onResendVerification}
                          disabled={isLoading || isResending}
                        >
                          {isResending
                            ? "Sending..."
                            : "Resend verification email"}
                        </Button>
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
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Check your spam folder if it does not arrive.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </AlertDescription>
                </Alert>
              ) : null}

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    required
                    autoComplete="current-password"
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
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
