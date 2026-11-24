import { AlertTriangle, Database, GraduationCap, School, Users } from 'lucide-react';
import campus from '../assets/campus.svg';
import classroom from '../assets/classroom.svg';
import { useData } from '../hooks/useData';
import { DATASET_FACTS, DATASET_KEYS, FL_CONFIG } from '../utils/constants';
import { int } from '../utils/format';
import Card from '../components/common/Card';
import Callout from '../components/common/Callout';
import Badge from '../components/common/Badge';
import SectionTitle from '../components/common/SectionTitle';
import { Unavailable } from '../components/common/States';
import ChartFrame from '../components/charts/ChartFrame';
import ModernBar from '../components/charts/ModernBar';
import ModernDonut from '../components/charts/ModernDonut';
import DataTable from '../components/tables/DataTable';

const IMAGES = { graduate_dropout: campus, pass_fail: classroom };

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 transition hover:bg-indigo-50/60 hover:ring-indigo-100">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-0.5 text-xl font-extrabold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function DatasetSection({ f }) {
  const isGrad = f.key === 'graduate_dropout';
  const stats = isGrad
    ? [['Original records', f.original], ['Binary classification records', f.binary], ['Graduate records', f.classes[0].value], ['Dropout records', f.classes[1].value], ['Excluded Enrolled records', f.excluded], ['Training records', f.train], ['Test records', f.test], ['Input features', f.features]]
    : [['Original records', f.original], ['Pass records', f.classes[0].value], ['Fail records', f.classes[1].value], ['Training records', f.train], ['Test records', f.test], ['Input features', f.features]];
  return (
    <Card className="overflow-hidden" spotlight={false}>
      <div className="relative h-40 sm:h-48">
        <img src={IMAGES[f.key]} alt={isGrad ? 'Illustration of a university campus building' : 'Illustration of a classroom with a whiteboard'} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-2 text-white">
          <div>
            <h2 className="text-xl font-extrabold">{f.label} dataset</h2>
            <p className="text-sm text-slate-200">Source: {f.source}</p>
          </div>
          <Badge tone={isGrad ? 'indigo' : 'violet'}>{f.level}</Badge>
        </div>
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {stats.map(([l, v]) => <Stat key={l} label={l} value={int(v)} />)}
          </div>
          {isGrad ? (
            <Callout variant="info" title="Prediction-time features only">
              The original data has an Enrolled class, excluded here to make a binary Graduate / Dropout task. Second-semester information is excluded because it would not be available when the prediction is made; the {f.features} inputs are demographic, admission, financial and first-semester academic features.
            </Callout>
          ) : (
            <Callout variant="warn" title="Secondary-school data, not university data">
              This is the UCI Student Performance Mathematics dataset. Pass means G3 ≥ 10 and Fail means G3 &lt; 10. G1 is an input feature; G2 and G3 are excluded.
            </Callout>
          )}
        </div>
        <div className="h-64 lg:col-span-2" role="img" aria-label={`${f.label} class distribution donut chart`}>
          <p className="mb-1 text-sm font-extrabold text-slate-900">Target distribution</p>
          <div className="h-[calc(100%-1.5rem)]"><ModernDonut data={f.classes} centerLabel={isGrad ? 'Binary records' : 'Records'} /></div>
        </div>
      </div>
    </Card>
  );
}

export default function Datasets() {
  const { resultsFor } = useData();
  const ids = Array.from({ length: FL_CONFIG.clients }, (_, i) => i + 1);
  const sizes = Object.fromEntries(
    DATASET_KEYS.map((k) => {
      const deps = resultsFor(k).data?.departments || [];
      return [k, ids.map((id) => deps.find((d) => d.id === id)?.trainSize ?? null)];
    }),
  );
  const anySizes = DATASET_KEYS.some((k) => sizes[k].some((v) => v != null));
  const rows = ids.map((id, i) => ({ id, grad: sizes.graduate_dropout[i], pass: sizes.pass_fail[i] }));

  return (
    <>
      <p className="max-w-3xl text-sm text-slate-500">Two public datasets are used. Each is split into training and test sets, and the training set is partitioned across three simulated departments.</p>
      {DATASET_KEYS.map((k) => <DatasetSection key={k} f={DATASET_FACTS[k]} />)}

      <section>
        <SectionTitle icon={Users} title="Department data distribution" desc="Training records assigned to each simulated department." right={<Badge tone="violet">Non-IID · Dirichlet α = {FL_CONFIG.alpha}</Badge>} />
        <Callout variant="info" className="mb-4" title="Why the departments differ">
          Records are split with a Dirichlet distribution (α = {FL_CONFIG.alpha}). A low α produces uneven, skewed shards, so each department sees a different mix of students, which is the setting federated learning has to cope with.
        </Callout>
        {anySizes ? (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              {DATASET_KEYS.map((k) => (
                <ChartFrame key={k} title={DATASET_FACTS[k].label} subtitle="Training records per department" height={260}>
                  {sizes[k].some((v) => v != null) ? (
                    <ModernBar data={ids.map((id, i) => ({ dept: `Dept 0${id}`, records: sizes[k][i] }))} xKey="dept" series={[{ key: 'records', name: 'Training records', color: k === 'pass_fail' ? '#0ea5e9' : '#6366f1' }]} domain={[0, 'auto']} tickFormatter={int} formatter={int} xLabel="Department" yLabel="Records" />
                  ) : (
                    <div className="grid h-full place-items-center"><Unavailable>Department sizes unavailable for this dataset</Unavailable></div>
                  )}
                </ChartFrame>
              ))}
            </div>
            <DataTable
              caption="Training records per department"
              rows={rows}
              rowKey={(r) => r.id}
              minWidth={420}
              columns={[
                { key: 'dept', header: 'Department', render: (r) => <span className="font-bold text-slate-900">Department 0{r.id}</span> },
                { key: 'grad', header: 'Graduate / Dropout', align: 'right', render: (r) => (r.grad != null ? int(r.grad) : <Unavailable />) },
                { key: 'pass', header: 'Pass / Fail', align: 'right', render: (r) => (r.pass != null ? int(r.pass) : <Unavailable />) },
              ]}
            />
          </div>
        ) : (
          <Card className="flex items-start gap-3 p-5" spotlight={false}>
            <AlertTriangle className="mt-0.5 text-amber-500" size={20} aria-hidden="true" />
            <div>
              <p className="font-extrabold text-slate-900">Department sizes unavailable</p>
              <p className="text-sm text-slate-500">The backend response did not include per-department training counts (or the data is still loading, or demo data is on). Nothing is estimated. Check the raw responses in Settings.</p>
            </div>
          </Card>
        )}
      </section>
      <p className="flex items-center gap-2 text-xs text-slate-400"><GraduationCap size={14} aria-hidden="true" /><School size={14} aria-hidden="true" /><Database size={14} aria-hidden="true" /> Record counts for the two datasets are project reference figures; department counts come from the API.</p>
    </>
  );
}
