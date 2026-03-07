import { motion } from "framer-motion";

interface SimpleBarChartProps {
  title: string;
  data: { label: string; value: number }[];
}

export function SimpleBarChart({ title, data }: SimpleBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="glass-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-100">{title}</p>
          <p className="text-xs text-slate-500">
            Relative scores across top teams.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">{item.label}</span>
              <span className="font-medium text-slate-200">{item.value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-900/80">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              />
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-500">
            Leaderboard will light up as submissions are scored.
          </p>
        )}
      </div>
    </div>
  );
}

