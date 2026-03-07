export function RowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-800 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-700 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 animate-pulse space-y-3">
      <div className="h-5 bg-slate-700 rounded w-1/3" />
      <div className="h-4 bg-slate-700 rounded w-2/3" />
      <div className="h-4 bg-slate-700 rounded w-1/2" />
    </div>
  );
}

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="min-h-screen bg-[#020617] p-10">
      <div className="max-w-6xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-48 mb-8" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 bg-[#0f172a] rounded-xl border border-slate-800" />
        ))}
      </div>
    </div>
  );
}
