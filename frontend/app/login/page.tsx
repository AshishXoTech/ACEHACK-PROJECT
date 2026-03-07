"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, GitBranch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/services/auth.service";

interface LoginFormValues {
  email: string;
  password: string;
}

const roleRedirects: Record<UserRole, string> = {
  organizer: "/dashboard/organizer",
  judge: "/dashboard/judge",
  participant: "/dashboard/participant",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setLoading(true);

    try {
      await login(values);
      const stored = window.localStorage.getItem("hackflow_ai_user");
      if (stored) {
        const user = JSON.parse(stored) as { role: UserRole };
        const redirectTo = roleRedirects[user.role] ?? "/dashboard/participant";
        router.replace(redirectTo);
      } else {
        router.replace("/dashboard/participant");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Unable to sign in. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-panel relative w-full max-w-md p-6"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/50">
            <GitBranch className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-50">
              HackFlow AI
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Secure sign-in
            </p>
          </div>
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Use the credentials issued by the organizer to access your dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="relative">
              {/* <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" /> */}
              <input
                id="email"
                type="email"
                className="input pl-10"
                placeholder="you@hackathon.dev"
                {...register("email", { required: "Email is required" })}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="relative">
              {/* <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" /> */}
              <input
                id="password"
                type="password"
                className="input pl-10"
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400">
                {errors.password.message as string}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

