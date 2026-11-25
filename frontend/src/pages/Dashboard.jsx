import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Building2, Cpu, Database, LineChart, Network, Repeat, ShieldAlert, Server, TrendingUp } from 'lucide-react';
import hero from '../assets/hero.svg';
import dept1 from '../assets/dept1.svg';
import dept2 from '../assets/dept2.svg';
import dept3 from '../assets/dept3.svg';
import { useData } from '../hooks/useData';
import { COMM_REPORTED, DATASET_FACTS, DATASET_KEYS, FL_CONFIG, METHODS } from '../utils/constants';
import { pct, kb } from '../utils/format';
import MetricCard from '../components/cards/MetricCard';
import ChartFrame from '../components/charts/ChartFrame';
import ModernBar from '../components/charts/ModernBar';
import DataTable from '../components/tables/DataTable';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Keycap from '../components/common/Keycap';
import SectionTitle from '../components/common/SectionTitle';
import { ErrorState, Loading } from '../components/common/States';

const SERIES = [
  { key: 'graduate', name: 'Graduate / Dropout', color: '#6366f1' },
  { key: 'pass', name: 'Pass / Fail', color: '#0ea5e9' },
];

const QUICK = [
  { to: '/comparison', icon: BarChart3, title: 'Model comparison', desc: 'Local, centralized, FedAvg and FedProx side by side.' },
  { to: '/federated', icon: Network, title: 'Federated learning', desc: 'Architecture, configuration and round-by-round history.' },
  { to: '/datasets', icon: Database, title: 'Dataset analysis', desc: 'Class balance, splits and department partitions.' },
  { to: '/training', icon: LineChart, title: 'Training analytics', desc: 'Convergence curves and communication cost.' },
];

export default function Dashboard() {
  const { resultsFor, refresh, setDemo } = useData();
  const g = resultsFor('graduate_dropout');
  const p = resultsFor('pass_fail');
  const results = { graduate_dropout: g, pass_fail: p };
  const ready = [g, p].filter((r) => r.data?.hasData);
  const failed = [g, p].find((r) => r.status === 'error');

  const chartData = (metric) =>
    METHODS.map((m) => ({
      method: m.short,
      graduate: g.data?.methods?.[m.key]?.[metric] ?? null,
      pass: p.data?.methods?.[m.key]?.[metric] ?? null,
    }));

  const tableRows = DATASET_KEYS.flatMap((k) =>
    METHODS.map((m) => ({ id: `${k}-${m.key}`, dataset: DATASET_FACTS[k].label, method: m, metrics: results[k].data?.methods?.[m.key], status: results[k].status })),
  );

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-navy-900 text-white shadow-lift">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-transparent" />
        <div className="relative max-w-2xl space-y-4 p-6 sm:p-10">
          <div className="flex flex-wrap gap-2">
            <Badge tone="amber"><ShieldAlert size={12} aria-hidden="true" /> Simulated federated environment</Badge>
            <Badge tone="indigo">Dirichlet α = {FL_CONFIG.alpha}</Badge>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Three departments train together without sharing their student records.
          </h2>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Compare local, centralized and federated logistic regression on two academic prediction tasks. All three departments run on one machine, so this demonstrates the method rather than a production deployment.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Keycap as={Link} to="/comparison" active>Compare models <ArrowRight size={14} aria-hidden="true" /></Keycap>
            <Keycap as={Link} to="/federated">Federated learning</Keycap>
          </div>
        </div>
      </section>

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Building2} label="Total departments" value={FL_CONFIG.clients} hint="Simulated client institutions" tone="indigo" />
        <MetricCard icon={Database} label="Available datasets" value={2} hint="Graduate / Dropout and Pass / Fail" tone="sky" />
        <MetricCard icon={Cpu} label="ML approaches" value={4} hint="Local, centralized, FedAvg, FedProx" tone="violet" />
        <MetricCard icon={Repeat} label="Communication rounds" value={FL_CONFIG.rounds} hint={`${FL_CONFIG.localEpochs} local epochs per round`} tone="emerald" />
      </section>

      <section>
        <SectionTitle icon={TrendingUp} title="Model performance overview" desc="Held-out test performance for each approach. Local baseline is the average of the three department models." />
        {g.status === 'loading' && p.status === 'loading' ? (
          <Loading />
        ) : ready.length === 0 && failed ? (
          <ErrorState message={failed.error} onRetry={refresh} onDemo={() => setDemo(true)} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartFrame title="Accuracy by approach" subtitle="Test accuracy, both datasets" height={320}>
              <ModernBar data={chartData('accuracy')} xKey="method" series={SERIES} xLabel="Approach" yLabel="Accuracy (%)" />
            </ChartFrame>
            <ChartFrame title="Macro F1 by approach" subtitle="Test macro F1, both datasets" height={320}>
              <ModernBar data={chartData('f1')} xKey="method" series={SERIES} xLabel="Approach" yLabel="Macro F1 (%)" />
            </ChartFrame>
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-1">
          <SectionTitle icon={Server} title="Federated learning overview" />
          <div className="mb-4 flex -space-x-2">
            {[dept1, dept2, dept3].map((src, i) => (
              <img key={src} src={src} alt={`Department 0${i + 1}`} className="h-11 w-11 rounded-xl ring-2 ring-white transition hover:z-10 hover:-translate-y-1" />
            ))}
          </div>
          <dl className="space-y-2.5 text-sm">
            {[
              ['Participating departments', '5 (simulated)'],
              ['Algorithms', 'FedAvg, FedProx'],
              ['Rounds completed', `${FL_CONFIG.rounds} of ${FL_CONFIG.rounds}`],
              ['Status', null],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-bold text-slate-900">{v ?? <Badge tone="green">Experiments completed</Badge>}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs font-bold text-slate-500">Communication cost (serialized payload)</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {DATASET_KEYS.map((k) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <p className="text-[11px] font-semibold text-slate-500">{DATASET_FACTS[k].short}</p>
                <p className="text-sm font-extrabold text-slate-900">{kb(COMM_REPORTED[k].total, 3)}</p>
                <p className="text-[11px] text-slate-400">{kb(COMM_REPORTED[k].perRound)} / round</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3 xl:col-span-2">
          <SectionTitle title="Recent experiment results" desc="Final test metrics for every dataset and approach." />
          <DataTable
            caption="Experiment results"
            rows={tableRows}
            rowKey={(r) => r.id}
            columns={[
              { key: 'dataset', header: 'Dataset', render: (r) => <span className="font-bold text-slate-900">{r.dataset}</span> },
              { key: 'method', header: 'Algorithm', render: (r) => <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: r.method.color }} />{r.method.label}</span> },
              { key: 'acc', header: 'Accuracy', align: 'right', render: (r) => pct(r.metrics?.accuracy) },
              { key: 'f1', header: 'Macro F1', align: 'right', render: (r) => pct(r.metrics?.f1) },
              {
                key: 'status', header: 'Status',
                render: (r) => r.metrics ? <Badge tone={r.status === 'demo' ? 'amber' : 'green'}>{r.status === 'demo' ? 'Demo data' : 'Completed'}</Badge> : <Badge tone={r.status === 'loading' ? 'amber' : 'slate'}>{r.status === 'loading' ? 'Loading' : 'Unavailable'}</Badge>,
              },
            ]}
          />
        </div>
      </section>

      <section>
        <SectionTitle title="Quick navigation" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK.map(({ to, icon: Icon, title, desc }) => (
            <Card key={to} as={Link} to={to} lift className="group block p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white"><Icon size={19} aria-hidden="true" /></span>
              <h3 className="mt-3 font-extrabold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-indigo-600">Open <ArrowRight size={14} className="transition group-hover:translate-x-1" aria-hidden="true" /></span>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
