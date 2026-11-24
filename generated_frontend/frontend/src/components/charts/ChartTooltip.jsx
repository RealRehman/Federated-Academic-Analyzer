export default function ChartTooltip({ active, payload, label, formatter = (v) => v, labelPrefix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[150px] rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-xs shadow-lift backdrop-blur">
      <p className="mb-1.5 font-extrabold text-slate-900">
        {labelPrefix}
        {label}
      </p>
      <div className="space-y-1">
        {payload
          .filter((p) => p.value != null)
          .map((p) => (
            <div key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill || p.stroke }} />
                {p.name}
              </span>
              <b className="tabular-nums text-slate-900">{formatter(p.value, p.name)}</b>
            </div>
          ))}
      </div>
    </div>
  );
}
