import { Suspense } from "react";
import { LoginPageContent } from "@/components/auth/login-page-content";

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
