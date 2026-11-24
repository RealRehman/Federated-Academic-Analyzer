import Card from '../common/Card';
import { useCountUp } from '../../hooks/useCountUp';

const TONES = {
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/30',
  violet: 'from-violet-500 to-purple-600 shadow-violet-500/30',
  sky: 'from-sky-500 to-blue-600 shadow-sky-500/30',
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
  amber: 'from-amber-500 to-orange-500 shadow-amber-500/30',
};

export default function MetricCard({ icon: Icon, label, value, suffix = '', decimals = 0, hint, tone = 'indigo', badge }) {
  const animated = useCountUp(typeof value === 'number' ? value : null);
  const shown = typeof value === 'number' ? animated.toFixed(decimals) : value ?? '—';
  return (
    <Card lift className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900">
            {shown}
            <span className="ml-0.5 text-lg font-bold text-slate-400">{suffix}</span>
          </p>
        </div>
        {Icon && (
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg ${TONES[tone]}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
        {badge}
      </div>
    </Card>
  );
}
