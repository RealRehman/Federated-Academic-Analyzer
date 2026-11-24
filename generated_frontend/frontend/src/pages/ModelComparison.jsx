import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { useData } from '../hooks/useData';
import { DATASET_FACTS, DATASET_KEYS, METHODS, METRICS } from '../utils/constants';
import { methodList, maxOf } from '../utils/results';
import { pct, signedPp } from '../utils/format';
import Card from '../components/common/Card';
import Callout from '../components/common/Callout';
import Badge from '../components/common/Badge';
import Segmented from '../components/common/Segmented';
import { Async, Unavailable } from '../components/common/States';
import ChartFrame from '../components/charts/ChartFrame';
import ModernBar from '../components/charts/ModernBar';
import DataTable from '../components/tables/DataTable';

const GLOBAL = ['centralized', 'fedavg', 'fedprox'];

function Content({ data, visible, dataset }) {
  const items = methodList(data);
  const shown = items.filter((i) => visible.includes(i.key));
  const local = data.methods.local_average;

  const chartData = METRICS.map((mt) => ({ metric: mt.label, ...Object.fromEntries(shown.map((i) => [i.key, i.metrics[mt.key]])) }));
  const series = shown.map((i) => ({ key: i.key, name: i.label, color: i.color }));

  const rows = [
    ...data.departments.map((d) => ({ key: `d${d.id}`, kind: 'Local baseline', name: d.label, metrics: d.metrics, global: false })),
    ...items.map((i) => ({ key: i.key, kind: i.key === 'local_average' ? 'Local average' : 'Global model', name: i.label, metrics: i.metrics, global: GLOBAL.includes(i.key) })),
  ];
  const globals = rows.filter((r) => r.global);
  const best = Object.fromEntries(METRICS.map((m) => [m.key, maxOf(globals, m.key)]));
  const cell = (r, m) => (
    <span className={r.global && r.metrics[m] != null && r.metrics[m] === best[m] ? 'rounded-md bg-emerald-50 px-2 py-0.5 font-extrabold text-emerald-700 ring-1 ring-emerald-200' : ''}>{pct(r.metrics[m])}</span>
  );

  const c = data.methods.centralized;
  const fa = data.methods.fedavg;
  const fp = data.methods.fedprox;
  const identical = fa && fp && METRICS.every((m) => fa[m.key] === fp[m.key]);
  const fedBeatsCentral = c && fa && fa.accuracy > c.accuracy;

  return (
    <div className="space-y-6">
      <section aria-label="Best performer per metric" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((mt) => {
          const top = maxOf(shown, mt.key);
          const winners = shown.filter((i) => i.metrics[mt.key] != null && i.metrics[mt.key] === top);
          return (
            <Card key={mt.key} lift className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">{mt.label}</p>
                <Trophy size={16} className="text-amber-500" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900">{pct(top)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {winners.map((w) => (
                  <span key={w.key} className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: w.color }}>{w.short}</span>
                ))}
              </div>
              {local && top != null && <p className="mt-2 text-xs text-slate-500">{signedPp(top - local[mt.key])} vs local average</p>}
            </Card>
          );
        })}
      </section>

      <ChartFrame title="Performance by metric" subtitle={`${DATASET_FACTS[dataset].label} · selected methods`} height={360}>
        <ModernBar data={chartData} xKey="metric" series={series} xLabel="Metric" yLabel="Score (%)" />
      </ChartFrame>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-900">Detailed results</h2>
        <DataTable
          caption="All methods and department baselines"
          rows={rows}
          rowKey={(r) => r.key}
          minWidth={720}
          rowClass={(r) => (r.global ? '' : 'bg-slate-50/50')}
          columns={[
            { key: 'name', header: 'Method', render: (r) => <span className="font-bold text-slate-900">{r.name}</span> },
            { key: 'kind', header: 'Type', render: (r) => <Badge tone={r.global ? 'indigo' : 'slate'}>{r.kind}</Badge> },
            ...METRICS.map((m) => ({ key: m.key, header: m.label, align: 'right', render: (r) => cell(r, m.key) })),
          ]}
        />
        {data.departments.length === 0 && <p className="text-xs text-slate-500">Individual department baselines: <Unavailable>not included in this data source</Unavailable></p>}
        {data.derivedLocalAverage && <p className="text-xs text-slate-500">The local average was computed here as the mean of the department baselines returned by the API.</p>}
        <p className="text-xs text-slate-400">Green cells mark the best of the global models (centralized, FedAvg, FedProx) per metric.</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {identical && <Callout variant="info" title="FedAvg and FedProx are identical here">Every metric matches between the two federated algorithms for this dataset, so the proximal term did not change the result at the configured settings.</Callout>}
        {fedBeatsCentral && <Callout variant="warn" title="Federated outperforms centralized">The centralized model is expected to be an upper bound, but FedAvg scores higher accuracy here. Centralized and federated models use different optimization implementations, so treat this as indicative until a controlled experiment is run.</Callout>}
        {!fedBeatsCentral && <Callout variant="info" title="Reading the comparison">Centralized and federated models use different optimization implementations, so differences between them need further controlled experimentation.</Callout>}
      </div>
    </div>
  );
}

export default function ModelComparison() {
  const { dataset, setDataset, resultsFor } = useData();
  const [visible, setVisible] = useState(METHODS.map((m) => m.key));
  const toggle = (k) => setVisible((v) => (v.includes(k) ? (v.length > 1 ? v.filter((x) => x !== k) : v) : [...v, k]));

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented label="Dataset" value={dataset} onChange={setDataset} options={DATASET_KEYS.map((k) => ({ value: k, label: DATASET_FACTS[k].label }))} />
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter methods">
          <span className="text-xs font-bold text-slate-500">Show</span>
          {METHODS.map((m) => {
            const on = visible.includes(m.key);
            return (
              <button key={m.key} type="button" aria-pressed={on} onClick={() => toggle(m.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5 ${on ? 'border-transparent text-white shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                style={on ? { background: m.color } : undefined}>
                {m.short}
              </button>
            );
          })}
        </div>
      </div>
      {dataset === 'pass_fail' && <Callout variant="warn" title="Secondary-school dataset">Pass / Fail is based on secondary-school mathematics performance (UCI Student Performance), not university students.</Callout>}
      <Async res={resultsFor(dataset)} emptyTitle="No comparison results found">
        {(data) => <Content data={data} visible={visible} dataset={dataset} />}
      </Async>
    </>
  );
}
