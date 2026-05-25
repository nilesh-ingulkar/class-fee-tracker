type DisplayUser = {
  email?: string;
  user_metadata?: {
    full_name?: unknown;
    name?: unknown;
  };
} | null | undefined;

export function getUserDisplayName(user: DisplayUser): string {
  const fullName = user?.user_metadata?.full_name;
  const name = user?.user_metadata?.name;
  const metadataName =
    typeof fullName === "string" && fullName.trim()
      ? fullName.trim()
      : typeof name === "string" && name.trim()
        ? name.trim()
        : "";

  return metadataName || user?.email?.split("@")[0] || "User";
}

export function getInitials(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "U";

  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return text.slice(0, 2).toUpperCase();
}
