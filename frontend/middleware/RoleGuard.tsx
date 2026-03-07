"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace("/login");
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-4 shadow-lg shadow-slate-900/40">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          <span className="text-sm font-medium tracking-wide">
            Securing your HackFlow AI workspace...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

