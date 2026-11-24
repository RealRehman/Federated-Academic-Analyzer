/**
 * Tolerant adapters between the FastAPI JSON payloads and the shapes the UI uses.
 *
 * The backend contract only specifies endpoint paths, so these helpers locate
 * metrics by key name (accuracy / macro_precision / macro_recall / macro_f1 and
 * common variants) and classify them by the key path they were found under
 * (fedavg, fedprox, centralized, local / department ...).
 * Metric values given as fractions (0-1) are converted to percentages.
 * Nothing is invented: whatever cannot be found is returned as null / [].
 * The raw payloads are always inspectable in Settings.
 */

const ALIASES = {
  accuracy: ['accuracy', 'acc', 'test_accuracy'],
  precision: ['macro_precision', 'precision_macro', 'macro_prec', 'test_macro_precision', 'precision'],
  recall: ['macro_recall', 'recall_macro', 'test_macro_recall', 'recall'],
  f1: ['macro_f1', 'f1_macro', 'macro_f1_score', 'test_macro_f1', 'f1_score', 'f1'],
};
const NESTED = ['metrics', 'test_metrics', 'final_metrics', 'global_metrics', 'results', 'test'];
const HINT_KEYS = ['method', 'name', 'algorithm', 'model', 'approach', 'department', 'client', 'client_id', 'dept', 'id'];

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const asPct = (v) => (v <= 1 ? v * 100 : v);
const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);

function pickMetrics(src) {
  const out = {};
  for (const [k, names] of Object.entries(ALIASES)) {
    for (const n of names) {
      const v = num(src[n]);
      if (v !== undefined) {
        out[k] = asPct(v);
        break;
      }
    }
  }
  return out;
}

export function readMetrics(o) {
  if (!isObj(o)) return null;
  let m = pickMetrics(o);
  if (m.accuracy == null) {
    for (const n of NESTED) {
      if (isObj(o[n])) {
        const mm = pickMetrics(o[n]);
        if (mm.accuracy != null) {
          m = mm;
          break;
        }
      }
    }
  }
  if (m.accuracy == null && m.f1 == null) return null;
  return { accuracy: m.accuracy ?? null, precision: m.precision ?? null, recall: m.recall ?? null, f1: m.f1 ?? null };
}

function readDeptInfo(o) {
  const first = (names) => names.map((n) => o[n]).find((v) => v !== undefined);
  const size = num(first(['train_size', 'n_train', 'train_samples', 'num_train_samples', 'n_samples', 'num_samples', 'samples', 'train_records', 'records', 'size']));
  const dist = first(['class_distribution', 'class_counts', 'label_distribution']);
  return { trainSize: size ?? null, classDist: isObj(dist) ? dist : null };
}

function walk(node, path, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, [...path, String(i)], out));
    return;
  }
  if (typeof node.round === 'number' || typeof node.round_num === 'number') return; // per-round records belong to history
  const m = readMetrics(node);
  if (m) {
    const hint = HINT_KEYS.map((k) => (typeof node[k] === 'string' || typeof node[k] === 'number' ? String(node[k]) : '')).join(' ');
    out.push({
      label: `${path.join(' ')} ${hint}`.toLowerCase(),
      tail: `${hint} ${path[path.length - 1] ?? ''}`.toLowerCase(),
      metrics: m,
      info: readDeptInfo(node),
    });
    return;
  }
  for (const [k, v] of Object.entries(node)) walk(v, [...path, k], out);
}

function classify(label) {
  if (/fed[_\s-]?prox/.test(label)) return 'fedprox';
  if (/fed[_\s-]?avg|federated averaging/.test(label)) return 'fedavg';
  if (label.includes('central')) return 'centralized';
  if (label.includes('local') || /depart|client|dept/.test(label)) {
    return /avg|average|mean/.test(label) ? 'local_average' : 'local_department';
  }
  return null;
}

/** Comparison payload -> { methods, departments, hasData, derivedLocalAverage } */
export function normalizeResults(raw) {
  const found = [];
  walk(raw, [], found);
  const methods = {};
  const depts = [];
  for (const e of found) {
    const c = classify(e.label);
    if (!c) continue;
    if (c === 'local_department') depts.push(e);
    else if (!methods[c]) methods[c] = e.metrics;
  }

  const parsed = depts.map((d) => {
    const m = d.tail.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  });
  const idsOk = depts.length > 0 && parsed.every((x) => x !== null) && new Set(parsed).size === parsed.length;
  const offset = idsOk && Math.min(...parsed) === 0 ? 1 : 0;
  const departments = depts
    .map((d, i) => {
      const id = idsOk ? parsed[i] + offset : i + 1;
      return { id, label: `Department ${String(id).padStart(2, '0')}`, metrics: d.metrics, ...d.info };
    })
    .sort((a, b) => a.id - b.id);

  let derivedLocalAverage = false;
  if (!methods.local_average && departments.length) {
    const avg = {};
    for (const k of Object.keys(ALIASES)) {
      const vals = departments.map((d) => d.metrics[k]).filter((v) => v != null);
      avg[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }
    methods.local_average = avg;
    derivedLocalAverage = true;
  }
  return { methods, departments, hasData: Object.keys(methods).length > 0, derivedLocalAverage };
}

// ---------- training history ----------
const ALGO_RX = { fedprox: /fed[_\s-]?prox/i, fedavg: /fed[_\s-]?avg/i };

function findAlgoNodes(obj, out = {}) {
  if (Array.isArray(obj)) {
    const groups = {};
    obj.forEach((r) => {
      if (!isObj(r)) return;
      const tag = String(r.algorithm ?? r.method ?? r.name ?? '');
      for (const [a, rx] of Object.entries(ALGO_RX)) if (rx.test(tag)) (groups[a] ||= []).push(r);
    });
    if (Object.keys(groups).length) {
      Object.entries(groups).forEach(([a, g]) => {
        if (!out[a]) out[a] = g;
      });
      return out;
    }
    obj.forEach((v) => findAlgoNodes(v, out));
    return out;
  }
  if (isObj(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      const a = Object.entries(ALGO_RX).find(([, rx]) => rx.test(k))?.[0];
      if (a && !out[a]) out[a] = v;
      else findAlgoNodes(v, out);
    }
  }
  return out;
}

function toRecords(node) {
  if (Array.isArray(node)) return node.filter(isObj);
  if (isObj(node)) {
    for (const k of ['history', 'rounds', 'per_round', 'round_history', 'records', 'metrics']) {
      if (node[k] !== undefined) {
        const r = toRecords(node[k]);
        if (r.length) return r;
      }
    }
    const cols = Object.entries(node).filter(([, v]) => Array.isArray(v) && v.length > 1 && v.every((x) => typeof x === 'number'));
    if (cols.length) {
      const n = Math.max(...cols.map(([, v]) => v.length));
      return Array.from({ length: n }, (_, i) => {
        const r = { round: i + 1 };
        cols.forEach(([k, v]) => {
          r[k] = v[i];
        });
        return r;
      });
    }
  }
  return [];
}

/** Communication value in KB. Keys containing "byte" (and not "kb") are converted from bytes. */
function commKb(r, which) {
  const rx = { down: /down/i, up: /(^|[^a-z])up(link|load)/i, total: /total|comm|cost/i }[which];
  for (const [k, v] of Object.entries(r)) {
    if (typeof v !== 'number' || !rx.test(k)) continue;
    if (which === 'total' && /down|up(link|load)/i.test(k)) continue;
    return /byte/i.test(k) && !/kb/i.test(k) ? v / 1024 : v;
  }
  return null;
}

function toRows(records) {
  return records
    .map((r, i) => {
      const m = readMetrics(r) || {};
      const down = commKb(r, 'down');
      const up = commKb(r, 'up');
      const total = commKb(r, 'total') ?? (down != null && up != null ? down + up : null);
      return {
        round: num(r.round) ?? num(r.round_num) ?? i + 1,
        accuracy: m.accuracy ?? null,
        precision: m.precision ?? null,
        recall: m.recall ?? null,
        f1: m.f1 ?? null,
        downlink: down,
        uplink: up,
        total,
      };
    })
    .sort((a, b) => a.round - b.round);
}

/** History payload -> { fedavg: rows[], fedprox: rows[], hasData } */
export function normalizeHistory(raw) {
  const nodes = findAlgoNodes(raw);
  const fedavg = nodes.fedavg ? toRows(toRecords(nodes.fedavg)) : [];
  const fedprox = nodes.fedprox ? toRows(toRecords(nodes.fedprox)) : [];
  return { fedavg, fedprox, hasData: fedavg.length > 0 || fedprox.length > 0 };
}
