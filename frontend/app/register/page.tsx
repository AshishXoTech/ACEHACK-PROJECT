"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, UserCircle2, GitBranch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/services/auth.service";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const roleRedirects: Record<UserRole, string> = {
  organizer: "/dashboard/organizer",
  judge: "/dashboard/judge",
  participant: "/dashboard/participant",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "participant",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setLoading(true);

    try {
      await registerUser(values);
      const redirectTo = roleRedirects[values.role] ?? "/dashboard/participant";
      router.replace(redirectTo);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Unable to register. Please try again.";
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
              Create account
            </p>
          </div>
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Join the hackathon
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {/* Participants, judges, and organizers all sign in from the same space. */}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="label">
              Full name
            </label>
            <div className="relative">
              {/* <UserCircle2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" /> */}
              <input
                id="name"
                type="text"
                className="input pl-9"
                placeholder="e.g. Ashish Kumar Jha"
                {...register("name", { required: "Name is required" })}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-400">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="relative">
              {/* <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" /> */}
              <input
                id="email"
                type="email"
                className="input pl-9"
                placeholder="e.g. xyz@gmail.com"
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
                className="input pl-9"
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400">
                {errors.password.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="label">
              Role
            </label>
            <select
              id="role"
              className="select"
              {...register("role", { required: "Role is required" })}
            >
              <option value="participant">Participant</option>
              <option value="judge">Judge</option>
              <option value="organizer">Organizer</option>
            </select>
            {errors.role && (
              <p className="text-xs text-rose-400">
                {errors.role.message as string}
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
            <UserPlus className="h-4 w-4" />
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

