"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  BookUser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { getInitials, getUserDisplayName } from "@/lib/user-display";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/children", label: "Children", icon: Users },
  { href: "/classes", label: "Classes", icon: GraduationCap },
  { href: "/teachers", label: "Teachers", icon: BookUser },
  { href: "/sessions", label: "Sessions", icon: Calendar },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isAuthenticated, isSigningOut, signOut, user } = useAuth();
  const displayName = getUserDisplayName(user);
  const initials = getInitials(displayName);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar/95 text-sidebar-foreground border-r border-sidebar-border shadow-xl shadow-primary/5 backdrop-blur">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border bg-gradient-to-br from-sidebar-primary/15 via-transparent to-accent/30">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sidebar-primary to-sky-500 text-sidebar-primary-foreground font-bold text-sm shadow-lg shadow-sidebar-primary/20">
          CF
        </div>
        <div>
          <span className="font-semibold leading-none">Class Fee Tracker</span>
          <p className="text-xs text-sidebar-foreground/60">Family fee tracker</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-sidebar-primary to-sky-500 text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isAuthenticated ? (
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent/70">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-200 to-sky-500 flex items-center justify-center text-sm font-medium text-blue-950">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 mt-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => {
              void signOut();
            }}
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
