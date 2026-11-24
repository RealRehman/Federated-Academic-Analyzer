import { AlertTriangle, Inbox, Loader2, RefreshCw, FlaskConical } from 'lucide-react';
import { useData } from '../../hooks/useData';
import Card from './Card';

export function Loading({ label = 'Loading experiment data…' }) {
  return (
    <Card className="grid min-h-[220px] place-items-center p-8" spotlight={false} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="animate-spin text-indigo-500" size={28} aria-hidden="true" />
        <p className="text-sm font-semibold">{label}</p>
      </div>
    </Card>
  );
}

export function ErrorState({ message, onRetry, onDemo }) {
  return (
    <Card className="p-6" role="alert">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <AlertTriangle size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-slate-900">Could not load data from the backend</h3>
          <p className="mt-1 break-words text-sm text-slate-600">{message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {onRetry && (
              <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700">
                <RefreshCw size={15} aria-hidden="true" /> Retry
              </button>
            )}
            {onDemo && (
              <button onClick={onDemo} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700">
                <FlaskConical size={15} aria-hidden="true" /> Use demo data
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-400">Demo data is the static figures from the project brief and is clearly labelled whenever it is shown.</p>
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({ title = 'Nothing to show yet', message, icon: Icon = Inbox, children }) {
  return (
    <Card className="grid place-items-center p-8 text-center" spotlight={false}>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-extrabold text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-xl text-sm text-slate-500">{message}</p>}
      {children}
    </Card>
  );
}

/** Small inline notice for a value that the project data does not provide. */
export function Unavailable({ children = 'Unavailable' }) {
  return <span className="text-xs font-semibold italic text-slate-400">{children}</span>;
}

/**
 * Renders loading / error / empty states for a `resultsFor` / `historyFor` result,
 * otherwise calls children(data).
 */
export function Async({ res, children, emptyTitle = 'No data returned', emptyMessage }) {
  const { refresh, setDemo } = useData();
  if (res.status === 'loading') return <Loading />;
  if (res.status === 'error') return <ErrorState message={res.error} onRetry={refresh} onDemo={() => setDemo(true)} />;
  if (res.status === 'demo-none')
    return <EmptyState title="Round-level history is not part of the demo data" message="Switch the demo fallback off in Settings to read training histories from the backend." />;
  if (res.status === 'empty')
    return (
      <EmptyState title={emptyTitle} message={emptyMessage || 'The backend responded, but no recognisable records were found. Open Settings to inspect the raw response.'}>
        <button onClick={refresh} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700">
          <RefreshCw size={15} aria-hidden="true" /> Refresh
        </button>
      </EmptyState>
    );
  return children(res.data, res);
}
