import { useState } from 'react';
import { ArrowDown, ArrowRight, Cpu, Globe, Server, Settings2 } from 'lucide-react';
import dept1 from '../assets/dept1.svg';
import dept2 from '../assets/dept2.svg';
import dept3 from '../assets/dept3.svg';
import { useData } from '../hooks/useData';
import { COMM_REPORTED, DATASET_FACTS, DATASET_KEYS, FL_CONFIG } from '../utils/constants';
import { int, kb, pct } from '../utils/format';
import Card from '../components/common/Card';
import Callout from '../components/common/Callout';
import Segmented from '../components/common/Segmented';
import SectionTitle from '../components/common/SectionTitle';
import { Async, Unavailable } from '../components/common/States';
import ChartFrame from '../components/charts/ChartFrame';
import ModernArea from '../components/charts/ModernArea';
import ModernBar from '../components/charts/ModernBar';
import DataTable from '../components/tables/DataTable';

const DEPTS = [dept1, dept2, dept3];

function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-1 text-indigo-500 lg:px-2">
      <span className="text-center text-[11px] font-bold text-slate-500">{label}</span>
      <ArrowRight size={26} className="hidden lg:block" aria-hidden="true" />
      <ArrowDown size={26} className="lg:hidden" aria-hidden="true" />
    </div>
  );
}

function Diagram() {
  return (
    <Card className="p-5" spotlight={false}>
      <div className="grid items-center gap-2 lg:grid-cols-[1.1fr_auto_1fr_auto_1fr]">
        <div className="space-y-2.5">
          {DEPTS.map((src, i) => (
            <div key={src} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
              <img src={src} alt="" className="h-11 w-11 rounded-lg" />
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-slate-900">Department 0{i + 1}</p>
                <p className="text-xs text-slate-500">Trains locally on its own records</p>
              </div>
            </div>
          ))}
        </div>
        <Arrow label="Model updates (weights only)" />
        <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-indigo-900 p-5 text-center text-white shadow-lift transition hover:-translate-y-0.5">
          <Server className="mx-auto text-indigo-300" size={30} aria-hidden="true" />
          <p className="mt-2 font-extrabold">Central server</p>
          <p className="mt-1 text-xs text-slate-300">Aggregates updates each round (FedAvg or FedProx)</p>
        </div>
        <Arrow label="Global model distribution" />
        <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/70 p-5 text-center transition hover:-translate-y-0.5">
          <Globe className="mx-auto text-emerald-600" size={30} aria-hidden="true" />
          <p className="mt-2 font-extrabold text-slate-900">Global model</p>
          <p className="mt-1 text-xs text-slate-600">Sent back to all departments for the next round</p>
        </div>
      </div>
      <ol className="mt-5 grid gap-2 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
        {['Each department trains a local model.', 'Only model updates are sent to the server.', 'The server aggregates them into one global model.', 'The global model is sent back and the cycle repeats.'].map((t, i) => (
          <li key={t} className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-100 text-[11px] font-extrabold text-indigo-700">{i + 1}</span>{t}</li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-slate-400">Simulation: all three clients run on one machine; this diagram shows the logical flow, not physically separated institutions.</p>
    </Card>
  );
}

export default function FederatedLearning() {
  const { dataset, setDataset, historyFor } = useData();
  const [algo, setAlgo] = useState('fedavg');
  const algoLabel = algo === 'fedavg' ? 'FedAvg' : 'FedProx';
  const cfg = [
    ['Clients', int(FL_CONFIG.clients)], ['Rounds', int(FL_CONFIG.rounds)], ['Local epochs', int(FL_CONFIG.localEpochs)],
    ['Learning rate', FL_CONFIG.learningRate], ['L2 regularization', FL_CONFIG.l2], ['FedProx μ', FL_CONFIG.mu], ['Dirichlet α', FL_CONFIG.alpha],
  ];

  return (
    <>
      <section>
        <SectionTitle icon={Cpu} title="Architecture" desc="How a federated round works in this project." />
        <Diagram />
      </section>

      <section>
        <SectionTitle icon={Settings2} title="Training configuration" right={
          <div className="flex flex-wrap gap-3">
            <Segmented label="Dataset" value={dataset} onChange={setDataset} options={DATASET_KEYS.map((k) => ({ value: k, label: DATASET_FACTS[k].short }))} />
            <Segmented label="Algorithm" value={algo} onChange={setAlgo} options={[{ value: 'fedavg', label: 'FedAvg' }, { value: 'fedprox', label: 'FedProx' }]} />
          </div>
        } />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {cfg.map(([k, v]) => {
            const muOff = k === 'FedProx μ' && algo === 'fedavg';
            return (
              <Card key={k} lift className={`p-4 ${muOff ? 'opacity-55' : ''}`}>
                <p className="text-xs font-semibold text-slate-500">{k}</p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums text-slate-900">{v}</p>
                {muOff && <p className="text-[11px] text-slate-400">Used by FedProx only</p>}
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title={`${algoLabel} round-by-round results`} desc={`${DATASET_FACTS[dataset].label}: completed experiment history, not a live run.`} />
        <Async res={historyFor(dataset)} emptyTitle="No round history found" emptyMessage="The backend responded, but no per-round records for FedAvg or FedProx were recognised. Open Settings to inspect the raw response.">
          {(data) => {
            const rows = data[algo];
            if (!rows.length) return <Callout variant="warn" title={`No ${algoLabel} history`}>The response has no round records for {algoLabel} on this dataset.</Callout>;
            const split = rows.some((r) => r.downlink != null && r.uplink != null);
            const commSeries = split
              ? [{ key: 'downlink', name: 'Downlink', color: '#0ea5e9' }, { key: 'uplink', name: 'Uplink', color: '#8b5cf6' }]
              : [{ key: 'total', name: 'Total', color: '#6366f1' }];
            const hasComm = rows.some((r) => r.total != null);
            return (
              <>
                <div className="grid gap-4 xl:grid-cols-2">
                  <ChartFrame title="Accuracy and macro F1 per round" subtitle={`${algoLabel} · ${DATASET_FACTS[dataset].label}`} height={320}>
                    <ModernArea data={rows} series={[{ key: 'accuracy', name: 'Accuracy', color: '#6366f1' }, { key: 'f1', name: 'Macro F1', color: '#10b981' }]} yLabel="Score (%)" />
                  </ChartFrame>
                  <ChartFrame title="Communication cost per round" subtitle="Serialized model payload, KB" height={320}>
                    {hasComm ? (
                      <ModernBar data={rows} xKey="round" series={commSeries} domain={[0, 'auto']} stacked={split} tickFormatter={(v) => Number(v).toFixed(1)} formatter={(v) => kb(v)} xLabel="Federated round" yLabel="Communication (KB)" labelPrefix="Round " />
                    ) : (
                      <div className="grid h-full place-items-center px-6 text-center"><Unavailable>The history did not include communication cost per round. Reported payload: {kb(COMM_REPORTED[dataset].perRound)} per round.</Unavailable></div>
                    )}
                  </ChartFrame>
                </div>
                <DataTable
                  caption={`${algoLabel} per-round results`}
                  rows={rows}
                  rowKey={(r) => r.round}
                  minWidth={680}
                  columns={[
                    { key: 'round', header: 'Round', render: (r) => <span className="font-bold text-slate-900">{int(r.round)}</span> },
                    { key: 'accuracy', header: 'Accuracy', align: 'right', render: (r) => pct(r.accuracy) },
                    { key: 'f1', header: 'Macro F1', align: 'right', render: (r) => pct(r.f1) },
                    { key: 'downlink', header: 'Downlink', align: 'right', render: (r) => kb(r.downlink) },
                    { key: 'uplink', header: 'Uplink', align: 'right', render: (r) => kb(r.uplink) },
                    { key: 'total', header: 'Total', align: 'right', render: (r) => kb(r.total) },
                  ]}
                />
              </>
            );
          }}
        </Async>
      </section>
    </>
  );
}
