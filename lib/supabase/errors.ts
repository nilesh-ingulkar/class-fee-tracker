import type { PostgrestError } from "@supabase/supabase-js";

function isNetworkFailureMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed")
  );
}

export function getMutationErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (typeof error === "string") {
    if (isNetworkFailureMessage(error)) {
      return "Could not reach Supabase. Check your internet connection, that the project is running, and NEXT_PUBLIC_SUPABASE_URL in .env.local.";
    }
    return error;
  }

  if (error instanceof TypeError && isNetworkFailureMessage(error.message)) {
    return "Could not reach Supabase. Check your internet connection, that the project is running, and NEXT_PUBLIC_SUPABASE_URL in .env.local.";
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as PostgrestError).message);

    if (isNetworkFailureMessage(message)) {
      return "Could not reach Supabase. Check your internet connection, that the project is running, and NEXT_PUBLIC_SUPABASE_URL in .env.local.";
    }

    if (message) {
      return message;
    }
  }

  return fallback;
}
