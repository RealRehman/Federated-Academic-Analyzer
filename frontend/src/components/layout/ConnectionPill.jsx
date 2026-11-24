import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useData } from '../../hooks/useData';

const MAP = {
  online: { label: 'Backend connected', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', icon: Wifi },
  offline: { label: 'Backend offline', cls: 'border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-rose-500', icon: WifiOff },
  checking: { label: 'Checking backend…', cls: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500', icon: Loader2 },
};

export default function ConnectionPill({ short = false }) {
  const { connection, apiBase } = useData();
  const m = MAP[connection];
  const Icon = m.icon;
  return (
    <span title={apiBase} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${m.cls}`} role="status">
      <span className="relative flex h-2 w-2">
        {connection === 'online' && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${m.dot}`} />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${m.dot}`} />
      </span>
      <Icon size={13} className={connection === 'checking' ? 'animate-spin' : ''} aria-hidden="true" />
      {!short && m.label}
    </span>
  );
}
