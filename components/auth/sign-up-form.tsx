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
import type { SignUpState } from "@/hooks/use-sign-up";

const VERIFY_COPY = "Check your email to verify your account";

export type SignUpFormProps = {
  name: string;
  email: string;
  password: string;
  showPassword: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  passwordRequirements: { label: string; met: boolean }[];
  allRequirementsMet: boolean;
  state: SignUpState;
};

export function SignUpForm({
  name,
  email,
  password,
  showPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  passwordRequirements,
  allRequirementsMet,
  state,
}: SignUpFormProps) {
  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";
  const errorMessage = state.status === "error" ? state.message : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            CF
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-muted-foreground">
            Start tracking your class fees today
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign up</CardTitle>
            <CardDescription>
              Enter your details to create your account
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
                    <span className="font-medium text-foreground">{email}</span>.
                    After you verify, you can sign in.
                  </p>
                  <Button asChild variant="outline" className="mt-2 w-full sm:w-auto">
                    <Link href="/login">Go to sign in</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {errorMessage ? (
                  <Alert variant="destructive">
                    <AlertTitle>Could not sign up</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
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
                  disabled={isLoading || !allRequirementsMet}
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
