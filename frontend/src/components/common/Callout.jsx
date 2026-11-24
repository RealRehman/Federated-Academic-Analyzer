import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const V = {
  info: { icon: Info, cls: 'border-sky-200 bg-sky-50/70 text-sky-900', ic: 'text-sky-600' },
  warn: { icon: AlertTriangle, cls: 'border-amber-200 bg-amber-50/80 text-amber-900', ic: 'text-amber-600' },
  success: { icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50/70 text-emerald-900', ic: 'text-emerald-600' },
};

export default function Callout({ variant = 'info', title, children, className = '' }) {
  const { icon: Icon, cls, ic } = V[variant];
  return (
    <div role="note" className={`flex gap-3 rounded-xl border p-4 text-sm leading-relaxed ${cls} ${className}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${ic}`} aria-hidden="true" />
      <div>
        {title && <p className="font-bold">{title}</p>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  );
}
