import { AlertTriangle, BookOpen, Compass, FlaskConical, Layers, Lightbulb, Ruler, ShieldQuestion, Target } from 'lucide-react';
import campus from '../assets/campus.svg';
import classroom from '../assets/classroom.svg';
import students from '../assets/students.svg';
import Card from '../components/common/Card';
import Callout from '../components/common/Callout';
import SectionTitle from '../components/common/SectionTitle';
import { FL_CONFIG } from '../utils/constants';

const LIMITS = [
  'The current implementation is a simulation: three department clients run on one machine.',
  'Shared preprocessing is fitted centrally using the combined training shards.',
  'The system does not yet represent strict decentralized privacy.',
  'The Pass / Fail dataset is based on secondary-school mathematics performance.',
  'FedAvg and FedProx currently show similar performance.',
  'Centralized and federated models use different optimization implementations, so comparisons need further controlled experimentation.',
];
const FUTURE = [
  'Fit preprocessing locally or with a privacy-preserving protocol instead of centrally.',
  'Run controlled experiments with identical optimizers for centralized and federated training.',
  'Explore stronger non-IID settings and more clients to separate FedProx from FedAvg.',
  'Evaluate additional models and university-level datasets for the Pass / Fail task.',
  'Study privacy mechanisms such as secure aggregation or differential privacy as future work; none is implemented today.',
];
const ALGOS = [
  ['Local Logistic Regression', 'Each department trains independently on its own shard. Used as the baseline; the average of the three is reported.'],
  ['Centralized Logistic Regression', 'All department training records are combined and trained in one place. A reference point, not privacy-preserving.'],
  ['FedAvg', 'Departments train locally each round; the server averages the weights, weighted by data size, into a global model.'],
  ['FedProx', `Like FedAvg, with a proximal term (μ = ${FL_CONFIG.mu}) that keeps local updates close to the global model, intended to help under non-IID data.`],
];
const METRICS = [
  ['Accuracy', 'Share of test students classified correctly.'],
  ['Macro precision', 'Precision averaged equally over both classes.'],
  ['Macro recall', 'Recall averaged equally over both classes.'],
  ['Macro F1', 'F1 averaged equally over both classes; less dominated by the larger class than accuracy.'],
];

function Block({ icon, title, children }) {
  return (
    <Card lift className="p-5">
      <SectionTitle icon={icon} title={title} />
      <div className="space-y-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </Card>
  );
}

export default function About() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {[[campus, 'Campus illustration'], [classroom, 'Classroom illustration'], [students, 'Student progress illustration']].map(([src, alt]) => (
          <div key={alt} className="group overflow-hidden rounded-xl border border-slate-200 shadow-card">
            <img src={src} alt={alt} className="h-36 w-full object-cover transition duration-500 group-hover:scale-105" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Block icon={Target} title="Project objective">
          <p>Federated Academic Analyzer shows how several academic departments can train a shared prediction model without exchanging their local training datasets.</p>
        </Block>
        <Block icon={Compass} title="Problem statement">
          <p>Student records are sensitive and held by separate departments. Pooling them can improve predictions, but it requires sharing raw data. The project asks how close federated training gets to a centralized model, and what it gains over each department training alone.</p>
        </Block>
        <Block icon={Layers} title="Federated learning motivation">
          <p>Each department keeps its records and sends only model updates to a central coordinator, which aggregates them into a global model. Departments with little or skewed data benefit from the others.</p>
        </Block>
        <Block icon={FlaskConical} title="Architecture and configuration">
          <p>Three simulated clients, Dirichlet partitioning (α = {FL_CONFIG.alpha}), logistic regression, {FL_CONFIG.rounds} rounds, {FL_CONFIG.localEpochs} local epochs, learning rate {FL_CONFIG.learningRate}, L2 {FL_CONFIG.l2}. A FastAPI backend serves the stored experiment results and this React app visualizes them.</p>
        </Block>
        <Block icon={BookOpen} title="Datasets">
          <p><b>Graduate / Dropout</b> (UCI): university students; the Enrolled class is excluded and only first-semester information is used.</p>
          <p><b>Pass / Fail</b> (UCI Student Performance, Mathematics): secondary-school students; Pass means G3 ≥ 10, G1 is an input, G2 and G3 are excluded.</p>
        </Block>
        <Block icon={Ruler} title="Evaluation metrics">
          <ul className="space-y-1.5">{METRICS.map(([k, v]) => <li key={k}><b className="text-slate-800">{k}:</b> {v}</li>)}</ul>
        </Block>
      </div>

      <section>
        <SectionTitle icon={Layers} title="Algorithms" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ALGOS.map(([k, v]) => (
            <Card key={k} lift className="p-5"><h3 className="font-extrabold text-slate-900">{k}</h3><p className="mt-1.5 text-sm text-slate-600">{v}</p></Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5" spotlight={false}>
          <SectionTitle icon={AlertTriangle} title="Limitations" desc="Read these before drawing conclusions." />
          <ol className="space-y-2.5 text-sm text-slate-700">
            {LIMITS.map((t, i) => <li key={t} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-extrabold text-amber-800">{i + 1}</span>{t}</li>)}
          </ol>
        </Card>
        <Card className="p-5" spotlight={false}>
          <SectionTitle icon={Lightbulb} title="Future improvements" />
          <ul className="space-y-2.5 text-sm text-slate-700">
            {FUTURE.map((t) => <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />{t}</li>)}
          </ul>
        </Card>
      </section>
      <Callout variant="warn" title="No production-grade privacy claims">
        <span className="inline-flex items-center gap-1"><ShieldQuestion size={14} aria-hidden="true" /></span> Encryption, differential privacy and secure aggregation are not implemented. Federated training here only means that raw training data is not exchanged between simulated clients.
      </Callout>
    </>
  );
}
