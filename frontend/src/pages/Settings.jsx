import { useState } from 'react';
import { CheckCircle2, FlaskConical, RefreshCw, Server, XCircle } from 'lucide-react';
import { useData } from '../hooks/useData';
import Card from '../components/common/Card';
import Callout from '../components/common/Callout';
import Badge from '../components/common/Badge';
import SectionTitle from '../components/common/SectionTitle';
import Keycap from '../components/common/Keycap';
import ConnectionPill from '../components/layout/ConnectionPill';
import { NAV } from '../utils/nav';

const ENDPOINTS = [
  { key: 'health', path: '/health' },
  { key: 'overview', path: '/api/experiments/' },
  { key: 'graduate_dropout:results', path: '/api/experiments/graduate_dropout' },
  { key: 'pass_fail:results', path: '/api/experiments/pass_fail' },
  { key: 'graduate_dropout:history', path: '/api/experiments/graduate_dropout/history' },
  { key: 'pass_fail:history', path: '/api/experiments/pass_fail/history' },
];

const CORS = `from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)`;

export default function Settings() {
  const { apiBase, demo, setDemo, refresh, loading, raw, errors, updatedAt } = useData();
  const [sel, setSel] = useState(ENDPOINTS[0].key);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <SectionTitle icon={Server} title="Backend connection" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">API base URL</dt><dd className="break-all font-bold text-slate-900">{apiBase}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Set by</dt><dd className="font-bold text-slate-900">VITE_API_BASE_URL</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Status</dt><dd><ConnectionPill /></dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Last refreshed</dt><dd className="font-bold text-slate-900">{updatedAt ? updatedAt.toLocaleTimeString() : '—'}</dd></div>
          </dl>
          <Keycap onClick={refresh} hint="R"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" /> Refresh now</Keycap>
        </Card>

        <Card className="space-y-4 p-5">
          <SectionTitle icon={FlaskConical} title="Demo data fallback" desc="Off by default. Live backend results are never replaced silently." />
          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div>
              <p className="font-bold text-slate-900">Use demo data</p>
              <p className="text-xs text-slate-500">Shows the static comparison figures from the project brief, labelled as demo data. Round histories and department details are not part of it.</p>
            </div>
            <button role="switch" aria-checked={demo} aria-label="Use demo data" onClick={() => setDemo(!demo)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${demo ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${demo ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-900">Keyboard shortcuts</p>
            <div className="flex flex-wrap gap-2">
              {NAV.map((n) => <span key={n.to} className="inline-flex items-center gap-1.5 text-xs text-slate-600"><kbd className="keycap-hint !bg-slate-100">{n.key}</kbd>{n.short}</span>)}
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600"><kbd className="keycap-hint !bg-slate-100">R</kbd>Refresh</span>
            </div>
          </div>
        </Card>
      </div>

      <section className="space-y-3">
        <SectionTitle title="Endpoints used" desc="Only existing backend endpoints are called; this app is read-only." />
        <Card className="divide-y divide-slate-100" spotlight={false}>
          {ENDPOINTS.map((e) => {
            const ok = raw[e.key] !== undefined;
            const bad = errors[e.key];
            return (
              <button key={e.key} onClick={() => setSel(e.key)} className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-indigo-50/50 ${sel === e.key ? 'bg-indigo-50/60' : ''}`}>
                <span className="flex min-w-0 items-center gap-2"><Badge tone="slate">GET</Badge><code className="truncate text-sm font-semibold text-slate-800">{e.path}</code></span>
                {bad ? <span className="flex items-center gap-1 text-xs font-bold text-rose-600"><XCircle size={15} aria-hidden="true" /> Failed</span> : ok ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={15} aria-hidden="true" /> OK</span> : <span className="text-xs text-slate-400">—</span>}
              </button>
            );
          })}
        </Card>
        <div>
          <p className="mb-2 text-sm font-bold text-slate-900">Raw response: <code>{ENDPOINTS.find((e) => e.key === sel).path}</code></p>
          <pre className="max-h-96 overflow-auto rounded-xl bg-navy-900 p-4 text-xs leading-relaxed text-slate-200">{errors[sel] ? `Error: ${errors[sel]}` : raw[sel] !== undefined ? JSON.stringify(raw[sel], null, 2) : 'No response yet.'}</pre>
        </div>
      </section>

      <Callout variant="info" title="CORS: required FastAPI change">
        <p>The browser calls the API from a different origin (the Vite dev server). If requests fail with a network error, allow the frontend origin in FastAPI:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-white/70 p-3 text-xs">{CORS}</pre>
      </Callout>
    </>
  );
}
