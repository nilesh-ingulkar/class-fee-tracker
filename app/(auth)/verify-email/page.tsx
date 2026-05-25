import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient-bg px-4 py-12">
      <Card className="w-full max-w-md shadow-xl shadow-primary/10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-500 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
            CF
          </div>
          <p className="page-kicker">Almost there</p>
          <CardTitle className="text-xl">
            Check your email to verify your account
          </CardTitle>
          <CardDescription>
            We sent a confirmation link. Open it to verify your email, then sign
            in. Your profile is created automatically after verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="default">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Back to sign up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
