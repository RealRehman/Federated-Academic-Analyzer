
import { useEffect, useState } from 'react';
import {
  GraduationCap,
  BrainCircuit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { PREDICTION_GROUPS } from '../utils/predictionGroups';

import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import SectionTitle from '../components/common/SectionTitle';
import { api } from '../services/api';

const DATASETS = [
  { key: 'graduate_dropout', label: 'Graduate / Dropout', count: 30 },
  { key: 'pass_fail', label: 'Pass / Fail', count: 31 }
];

const METHODS = [
  { key: 'centralized', label: 'Centralized' },
  { key: 'fedavg', label: 'FedAvg' },
  { key: 'fedprox', label: 'FedProx' }
];

export default function StudentPrediction() {
  const [dataset, setDataset] = useState('graduate_dropout');
  const [method, setMethod] = useState('fedavg');
  const [schema, setSchema] = useState(null);
  const [features, setFeatures] = useState({});
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleMessage, setSampleMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSchema() {
      setLoadingSchema(true);
      setError('');
      setResult(null);
      setSchema(null);
      setFeatures({});

      try {
        const data = await api.getPredictionSchema(dataset);

        if (active) {
          setSchema(data);

          const initial = {};
          data.input_features.forEach((field) => {
            initial[field] = '';
          });

          setFeatures(initial);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoadingSchema(false);
      }
    }

    loadSchema();

    return () => {
      active = false;
    };
  }, [dataset]);

  function updateFeature(name, value) {
    setFeatures((previous) => ({
      ...previous,
      [name]: value
    }));

    setResult(null);
    setError('');
  }
  async function handleLoadSample() {
  setLoadingSample(true);
  setError('');
  setResult(null);
  setSampleMessage('');

  try {
    const response = await api.getPredictionSample(dataset);
    setFeatures(response.features);
    setSampleMessage('Sample student loaded successfully. You can now generate a prediction.');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoadingSample(false);
  }
}

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setResult(null);

    if (!schema) return;

    const missing = schema.input_features.filter(
      (field) =>
        features[field] === '' ||
        features[field] === null ||
        features[field] === undefined
    );

    if (missing.length > 0) {
      setError(`Please complete all fields. Missing: ${missing.join(', ')}`);
      return;
    }

    const numerical = new Set(schema.numerical_features);

    const preparedFeatures = {};

    try {
      for (const field of schema.input_features) {
        const value = features[field];

        if (numerical.has(field) || dataset === 'graduate_dropout') {
          const parsed = Number(value);

          if (!Number.isFinite(parsed)) {
            throw new Error(`${field} must contain a valid number.`);
          }

          preparedFeatures[field] = parsed;
        } else {
          preparedFeatures[field] = String(value).trim();
        }
      }

      setPredicting(true);

      const response = await api.predictStudent({
        dataset,
        method,
        features: preparedFeatures
      });

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setPredicting(false);
    }
  }

  function resetForm() {
    const cleared = {};

    schema?.input_features.forEach((field) => {
      cleared[field] = '';
    });

    setFeatures(cleared);
    setResult(null);
    setError('');
  }

  const isGraduate = dataset === 'graduate_dropout';

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={GraduationCap}
        title="Student Prediction"
        desc="Generate academic outcome predictions using your trained machine-learning models."
      />

      <Card className="p-5 sm:p-6" spotlight={false}>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900">
              Prediction configuration
            </h2>
            <p className="text-sm text-slate-500">
              Choose a dataset and trained model.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Dataset
            </span>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {DATASETS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Prediction model
            </span>
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {METHODS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="indigo">{DATASETS.find(d => d.key === dataset)?.count} input features</Badge>
          <Badge tone="violet">{method.toUpperCase()}</Badge>
          <Badge tone="success">Model trained</Badge>
        </div>
      </Card>

      <Card className="p-5 sm:p-6" spotlight={false}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Student information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter all required features to generate a prediction.
            </p>
          </div>

          {schema && (
            <Badge tone="info">
              {schema.input_features.length} fields
            </Badge>
          )}
        </div>


          <div className="mb-5 flex flex-wrap items-center gap-3">
  <button
    type="button"
    onClick={handleLoadSample}
    disabled={loadingSample || loadingSchema}
    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {loadingSample ? (
      <>
        <Loader2 size={16} className="animate-spin" />
        Loading sample...
      </>
    ) : (
      <>
        <BrainCircuit size={16} />
        Load Sample Student
      </>
    )}
  </button>

  <span className="text-xs text-slate-500">
    Loads an example from the independent test dataset.
  </span>
</div>

{sampleMessage && (
  <p className="mb-4 text-sm font-medium text-emerald-600">
    <CheckCircle2 size={16} className="mr-1 inline" />
    {sampleMessage}
  </p>
)}

        {loadingSchema ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading dataset schema...
          </div>
        ) : schema ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
  {PREDICTION_GROUPS[dataset].map((group, index) => {
    const groupFields = group.fields.filter(
      (field) => schema.input_features.includes(field)
    );

    return (
      <details
        key={group.title}
        open={index === 0}
        className="group rounded-xl border border-slate-200 bg-white"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl p-4 transition hover:bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-900">
              {group.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {group.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge>{groupFields.length} fields</Badge>
            <span className="text-slate-400 transition-transform group-open:rotate-180">
              ▼
            </span>
          </div>
        </summary>

        <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {groupFields.map((field) => {
            const numerical =
              schema.numerical_features.includes(field) ||
              isGraduate;

            return (
              <label key={field} className="block min-w-0">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">
                  {field}
                </span>

                <input
                  type={numerical ? 'number' : 'text'}
                  step={numerical ? 'any' : undefined}
                  required
                  value={features[field] ?? ''}
                  onChange={(e) =>
                    updateFeature(field, e.target.value)
                  }
                  placeholder={
                    numerical ? 'Enter a number' : 'Enter a category'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                    </label>
                        );
                        })}
                        </div>
                    </details>
                    );
                })}
            </div>

            {dataset === 'pass_fail' && (
              <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                <strong>Important:</strong> G2 and G3 are not accepted as
                prediction inputs. G3 is used only to define the target
                during dataset preparation.
              </div>
            )}

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={predicting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {predicting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={17} />
                    Generate prediction
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Reset form
              </button>
            </div>
          </form>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            Dataset schema could not be loaded.
          </p>
        )}
      </Card>

      {result && (
        <Card className="overflow-hidden" spotlight={false}>
          <div className="border-b border-slate-100 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={20} />
              <span className="font-extrabold">Prediction completed</span>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Predicted academic outcome
              </p>
              <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
                {result.prediction}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {result.dataset.replace('_', ' / ')} · {result.method.toUpperCase()}
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-extrabold text-slate-900">
                Class probabilities
              </h3>

              <div className="space-y-4">
                {Object.entries(result.probabilities).map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-slate-700">
                        {label}
                      </span>
                      <span className="font-extrabold tabular-nums text-slate-900">
                        {(value * 100).toFixed(2)}%
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                        style={{
                          width: `${Math.max(0, Math.min(100, value * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Probabilities are model outputs, not guaranteed academic
              outcomes or calibrated real-world risk estimates.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
