import { Building2 } from 'lucide-react';
import dept1 from '../assets/dept1.svg';
import dept2 from '../assets/dept2.svg';
import dept3 from '../assets/dept3.svg';
import { useData } from '../hooks/useData';
import { DATASET_FACTS, DATASET_KEYS, FL_CONFIG } from '../utils/constants';
import { int, pct, signedPp } from '../utils/format';
import Card from '../components/common/Card';
import Callout from '../components/common/Callout';
import Badge from '../components/common/Badge';
import Segmented from '../components/common/Segmented';
import SectionTitle from '../components/common/SectionTitle';
import { Async, EmptyState, Unavailable } from '../components/common/States';
import ChartFrame from '../components/charts/ChartFrame';
import ModernBar from '../components/charts/ModernBar';

const IMGS = [dept1, dept2, dept3, dept1, dept2];
const PALETTE = ['#6366f1', '#f97316', '#0ea5e9', '#10b981'];

function ClassMix({ dist }) {
  const entries = Object.entries(dist).filter(([, v]) => typeof v === 'number');
  const total = entries.reduce((a, [, v]) => a + v, 0);
  if (!total) return <Unavailable>Class distribution unavailable</Unavailable>;
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
        {entries.map(([k, v], i) => <span key={k} style={{ width: `${(v / total) * 100}%`, background: PALETTE[i % PALETTE.length] }} title={`${k}: ${int(v)}`} />)}
      </div>
      <p className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
        {entries.map(([k, v], i) => <span key={k} className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />{k} {int(v)}</span>)}
      </p>
    </div>
  );
}

function Content({ data, dataset, otherSizes }) {
  const ids = Array.from({ length: FL_CONFIG.clients }, (_, i) => i + 1);
  const fedavg = data.methods.fedavg;
  const fedprox = data.methods.fedprox;
  const find = (id) => data.departments.find((d) => d.id === id);

  const rows = ids.map((id) => {
    const m = find(id)?.metrics;
    return {
      dept: `Dept 0${id}`,
      localAcc: m?.accuracy ?? null, localF1: m?.f1 ?? null,
      avgAcc: fedavg?.accuracy ?? null, avgF1: fedavg?.f1 ?? null,
      proxAcc: fedprox?.accuracy ?? null, proxF1: fedprox?.f1 ?? null,
      dAcc: m && fedavg ? fedavg.accuracy - m.accuracy : null,
      dF1: m && fedavg ? fedavg.f1 - m.f1 : null,
    };
  });
  const local = { key: 'local', color: '#94a3b8' };
  const accSeries = [{ key: 'localAcc', name: 'Local baseline', color: local.color }, { key: 'avgAcc', name: 'Global FedAvg', color: '#6366f1' }, { key: 'proxAcc', name: 'Global FedProx', color: '#8b5cf6' }];
  const f1Series = [{ key: 'localF1', name: 'Local baseline', color: local.color }, { key: 'avgF1', name: 'Global FedAvg', color: '#6366f1' }, { key: 'proxF1', name: 'Global FedProx', color: '#8b5cf6' }];
  const hasLocal = data.departments.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {ids.map((id, i) => {
          const d = find(id);
          const sizeHere = d?.trainSize ?? null;
          return (
            <Card key={id} lift className="p-5">
              <div className="flex items-center gap-3">
                <img src={IMGS[i]} alt="" className="h-12 w-12 rounded-xl" />
                <div>
                  <h3 className="font-extrabold text-slate-900">Department 0{id}</h3>
                  <Badge tone="violet">Simulated client</Badge>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Training records ({DATASET_FACTS[dataset].short})</dt><dd className="font-bold tabular-nums">{sizeHere != null ? int(sizeHere) : <Unavailable />}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Training records ({DATASET_FACTS[dataset === 'pass_fail' ? 'graduate_dropout' : 'pass_fail'].short})</dt><dd className="font-bold tabular-nums">{otherSizes[i] != null ? int(otherSizes[i]) : <Unavailable />}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Local accuracy</dt><dd className="font-bold tabular-nums">{d ? pct(d.metrics.accuracy) : <Unavailable />}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Local macro F1</dt><dd className="font-bold tabular-nums">{d ? pct(d.metrics.f1) : <Unavailable />}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">FedAvg accuracy vs local</dt><dd className={`font-bold tabular-nums ${rows[i].dAcc > 0 ? 'text-emerald-600' : rows[i].dAcc < 0 ? 'text-rose-600' : ''}`}>{rows[i].dAcc != null ? signedPp(rows[i].dAcc) : <Unavailable />}</dd></div>
              </dl>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="mb-1.5 text-xs font-bold text-slate-500">Class distribution</p>
                {d?.classDist ? <ClassMix dist={d.classDist} /> : <Unavailable>Class distribution unavailable</Unavailable>}
              </div>
            </Card>
          );
        })}
      </div>

      {hasLocal ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartFrame title="Department accuracy" subtitle="Local baseline vs global models" height={320}>
              <ModernBar data={rows} xKey="dept" series={accSeries} xLabel="Department" yLabel="Accuracy (%)" />
            </ChartFrame>
            <ChartFrame title="Department macro F1" subtitle="Local baseline vs global models" height={320}>
              <ModernBar data={rows} xKey="dept" series={f1Series} xLabel="Department" yLabel="Macro F1 (%)" />
            </ChartFrame>
          </div>
          <ChartFrame title="Gain from the global FedAvg model" subtitle="Global minus local, percentage points" height={300}>
            <ModernBar data={rows} xKey="dept" series={[{ key: 'dAcc', name: 'Accuracy difference', color: '#6366f1' }, { key: 'dF1', name: 'Macro F1 difference', color: '#10b981' }]} domain={['auto', 'auto']} tickFormatter={(v) => `${Number(v).toFixed(0)}`} formatter={signedPp} xLabel="Department" yLabel="Difference (pp)" />
          </ChartFrame>
        </>
      ) : (
        <EmptyState title="Per-department results unavailable" message="No department-level baseline metrics were found in this data source, so department charts are not drawn. Nothing is estimated. Inspect the raw response in Settings." />
      )}
    </div>
  );
}

export default function DepartmentAnalysis() {
  const { dataset, setDataset, resultsFor } = useData();
  const other = dataset === 'pass_fail' ? 'graduate_dropout' : 'pass_fail';
  const otherDeps = resultsFor(other).data?.departments || [];
  const otherSizes = Array.from({ length: FL_CONFIG.clients }, (_, i) => otherDeps.find((d) => d.id === i + 1)?.trainSize ?? null);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon={Building2} title="Simulated department clients" desc="Each department trains on its own, differently distributed shard of the training data." />
        <Segmented label="Dataset" value={dataset} onChange={setDataset} options={DATASET_KEYS.map((k) => ({ value: k, label: DATASET_FACTS[k].label }))} />
      </div>
      <Callout variant="info" title={`Non-IID partitioning (Dirichlet α = ${FL_CONFIG.alpha})`}>
        Departments receive different amounts and class mixes of data, so their local models behave differently. This is why a single global model can help every department.
      </Callout>
      <Async res={resultsFor(dataset)} emptyTitle="No department results found">
        {(data) => <Content data={data} dataset={dataset} otherSizes={otherSizes} />}
      </Async>
    </>
  );
}
