import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trendLabel?: string;
  trendValue?: string;
  highlight?: "positive" | "negative" | "neutral";
}

export function StatCard({
  label,
  value,
  icon,
  trendLabel,
  trendValue,
  highlight = "neutral",
}: StatCardProps) {
  const trendColor =
    highlight === "positive"
      ? "text-emerald-400"
      : highlight === "negative"
        ? "text-rose-400"
        : "text-slate-400";

  const ringColor =
    highlight === "positive"
      ? "ring-emerald-500/40"
      : highlight === "negative"
        ? "ring-rose-500/40"
        : "ring-slate-700/80";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`glass-panel flex flex-col gap-3 p-4 ring-1 ${ringColor}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            {value}
          </p>
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/70 text-cyan-300">
            {icon}
          </div>
        )}
      </div>
      {trendLabel && trendValue && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{trendLabel}</span>
          <span className={trendColor}>{trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}

