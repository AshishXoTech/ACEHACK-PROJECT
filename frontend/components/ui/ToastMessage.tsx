"use client";

import { useEffect } from "react";

interface ToastState {
  ok: boolean;
  msg: string;
}

export function ToastMessage({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className={`fixed right-5 top-5 z-50 rounded-lg border px-4 py-2 text-sm shadow-lg ${
        toast.ok
          ? "border-emerald-600/60 bg-emerald-900/40 text-emerald-200"
          : "border-rose-600/60 bg-rose-900/40 text-rose-200"
      }`}
      role="status"
      aria-live="polite"
    >
      {toast.msg}
    </div>
  );
}

