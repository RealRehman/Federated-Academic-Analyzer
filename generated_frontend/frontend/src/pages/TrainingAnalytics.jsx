import { Activity, Radio } from 'lucide-react';
import { useData } from '../hooks/useData';
import { COMM_REPORTED, DATASET_FACTS, DATASET_KEYS, FL_CONFIG } from '../utils/constants';
import { kb, pct, signedPp } from '../utils/format';
import Callout from '../components/common/Callout';
import Segmented from '../components/common/Segmented';
import SectionTitle from '../components/common/SectionTitle';
import MetricCard from '../components/cards/MetricCard';
import { Async, EmptyState } from '../components/common/States';
import ChartFrame from '../components/charts/ChartFrame';
import ModernArea from '../components/charts/ModernArea';
import DataTable from '../components/tables/DataTable';

const ALGOS = [
  { key: 'fedavg', label: 'FedAvg', color: '#6366f1' },
  { key: 'fedprox', label: 'FedProx', color: '#8b5cf6' },
];

function Convergence({ data, dataset }) {
  const charts = ALGOS.flatMap((a) => [
    { id: `${a.key}-acc`, algo: a, metric: 'accuracy', title: `${a.label} accuracy`, name: 'Accuracy' },
    { id: `${a.key}-f1`, algo: a, metric: 'f1', title: `${a.label} macro F1`, name: 'Macro F1' },
  ]);
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {charts.map((c) => {
        const rows = data[c.algo.key];
        const first = rows[0]?.[c.metric];
        const last = rows[rows.length - 1]?.[c.metric];
        return (
          <ChartFrame key={c.id} title={c.title} subtitle={rows.length ? `${DATASET_FACTS[dataset].label} · round 1 to ${rows[rows.length - 1].round}: ${first != null && last != null ? signedPp(last - first) : 'n/a'}` : DATASET_FACTS[dataset].label} height={260}>
            {rows.length ? (
              <ModernArea data={rows} series={[{ key: c.metric, name: c.name, color: c.algo.color }]} yLabel={`${c.name} (%)`} />
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-400">No {c.algo.label} history available</div>
            )}
          </ChartFrame>
        );
      })}
    </div>
  );
}

function Final({ data }) {
  const fin = (k) => data[k][data[k].length - 1];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ALGOS.flatMap((a) => [
        { k: `${a.key}-a`, label: `${a.label} final accuracy`, v: fin(a.key)?.accuracy, tone: a.key === 'fedavg' ? 'indigo' : 'violet' },
        { k: `${a.key}-f`, label: `${a.label} final macro F1`, v: fin(a.key)?.f1, tone: a.key === 'fedavg' ? 'sky' : 'emerald' },
      ]).map((c) => (
        <MetricCard key={c.k} label={c.label} value={c.v != null ? pct(c.v) : '—'} tone={c.tone} hint="Last recorded round" />
      ))}
    </div>
  );
}

export default function TrainingAnalytics() {
  const { dataset, setDataset, historyFor } = useData();
  const hist = historyFor(dataset);
  const rep = COMM_REPORTED[dataset];
  const h = hist.status === 'ready' ? hist.data : null;

  // Cumulative communication: from the API history when it has totals, otherwise derived from the reported per-round payload.
  const rounds = Array.from({ length: FL_CONFIG.rounds }, (_, i) => i + 1);
  const fromHistory = (key) => {
    const rows = h?.[key] || [];
    if (!rows.length || rows.some((r) => r.total == null)) return null;
    let acc = 0;
    return Object.fromEntries(rows.map((r) => [r.round, (acc += r.total)]));
  };
  const cumAvg = fromHistory('fedavg');
  const cumProx = fromHistory('fedprox');
  const derived = !cumAvg && !cumProx;
  const cumRows = rounds.map((r) => ({ round: r, fedavg: cumAvg ? cumAvg[r] ?? null : rep.perRound * r, fedprox: cumProx ? cumProx[r] ?? null : rep.perRound * r }));

  const splitRows = (h?.fedavg || []).filter((r) => r.uplink != null && r.downlink != null);
  const commTable = DATASET_KEYS.map((k) => ({ k, label: DATASET_FACTS[k].label, per: COMM_REPORTED[k].perRound, total: COMM_REPORTED[k].total }));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon={Activity} title="Convergence analysis" desc="How each federated algorithm improves across the ten communication rounds." />
        <Segmented label="Dataset" value={dataset} onChange={setDataset} options={DATASET_KEYS.map((k) => ({ value: k, label: DATASET_FACTS[k].label }))} />
      </div>

      <Async res={hist} emptyTitle="No training history found">
        {(data) => (
          <div className="space-y-4">
            <Final data={data} />
            <Convergence data={data} dataset={dataset} />
          </div>
        )}
      </Async>

      <section className="space-y-4">
        <SectionTitle icon={Radio} title="Communication analytics" desc="Serialized model payload per round. FedAvg and FedProx send the same payload size." />
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Communication per round" value={kb(rep.perRound)} hint="Reported measurement" tone="sky" />
          <MetricCard label={`Total over ${FL_CONFIG.rounds} rounds`} value={kb(rep.total, 3)} hint="Reported measurement" tone="indigo" />
          <MetricCard label="FedAvg vs FedProx payload" value="Equal" hint="Same measured payload size" tone="emerald" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartFrame title="Cumulative communication" subtitle={derived ? 'Derived: reported per-round payload × round' : 'Summed from per-round history'} height={300}
            footer={derived ? 'The two lines overlap because both algorithms have the same payload size.' : undefined}>
            <ModernArea data={cumRows} series={[{ key: 'fedavg', name: 'FedAvg', color: '#6366f1' }, { key: 'fedprox', name: 'FedProx', color: '#8b5cf6', dashed: true }]}
              yLabel="Cumulative (KB)" domain={[0, 'auto']} tickFormatter={(v) => Number(v).toFixed(0)} formatter={(v) => kb(v)} />
          </ChartFrame>
          <ChartFrame title="Uplink vs downlink per round" subtitle="FedAvg, from the backend history" height={300}>
            {splitRows.length ? (
              <ModernArea data={splitRows} series={[{ key: 'downlink', name: 'Downlink', color: '#0ea5e9' }, { key: 'uplink', name: 'Uplink', color: '#8b5cf6' }]}
                yLabel="Communication (KB)" domain={[0, 'auto']} tickFormatter={(v) => Number(v).toFixed(1)} formatter={(v) => kb(v)} />
            ) : (
              <EmptyState title="Uplink / downlink split unavailable" message="The history response did not include separate uplink and downlink values, so no split is drawn." />
            )}
          </ChartFrame>
        </div>

        <DataTable
          caption="Reported communication per dataset"
          rows={commTable}
          rowKey={(r) => r.k}
          minWidth={460}
          columns={[
            { key: 'label', header: 'Dataset', render: (r) => <span className="font-bold text-slate-900">{r.label}</span> },
            { key: 'per', header: 'Communication per round', align: 'right', render: (r) => kb(r.per) },
            { key: 'total', header: `${FL_CONFIG.rounds}-round total`, align: 'right', render: (r) => kb(r.total, 3) },
          ]}
        />
        <Callout variant="warn" title="What these numbers measure">
          These are serialized model payload estimates. They exclude transport protocol overhead, encryption, retransmissions and any other network traffic.
        </Callout>
      </section>
    </>
  );
}
