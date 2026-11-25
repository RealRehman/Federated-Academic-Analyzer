// Static project facts (taken from the project brief) and display metadata.
// Experiment RESULTS are never defined here except in DEMO_RESULTS, which is only
// used when the person explicitly switches on the demo fallback.

export const DATASET_KEYS = ['graduate_dropout', 'pass_fail'];

export const DATASET_FACTS = {
  graduate_dropout: {
    key: 'graduate_dropout',
    label: 'Graduate / Dropout',
    short: 'Grad / Dropout',
    source: 'UCI Machine Learning Repository',
    level: 'University students',
    original: 4424,
    binary: 3630,
    excluded: 794,
    train: 2904,
    test: 726,
    features: 30,
    classes: [
      { name: 'Graduate', value: 2209, color: '#6366f1' },
      { name: 'Dropout', value: 1421, color: '#f97316' },
    ],
  },
  pass_fail: {
    key: 'pass_fail',
    label: 'Pass / Fail',
    short: 'Pass / Fail',
    source: 'UCI Student Performance',
    level: 'Secondary school (Mathematics)',
    subject: 'Mathematics',
    original: 395,
    train: 316,
    test: 79,
    features: 31,
    classes: [
      { name: 'Pass', value: 265, color: '#10b981' },
      { name: 'Fail', value: 130, color: '#f97316' },
    ],
  },
};

export const METHODS = [
  { key: 'local_average', label: 'Local Baseline Average', short: 'Local Avg', color: '#94a3b8' },
  { key: 'centralized', label: 'Centralized', short: 'Centralized', color: '#0ea5e9' },
  { key: 'fedavg', label: 'FedAvg', short: 'FedAvg', color: '#6366f1' },
  { key: 'fedprox', label: 'FedProx', short: 'FedProx', color: '#8b5cf6' },
];

export const METRICS = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'precision', label: 'Macro Precision' },
  { key: 'recall', label: 'Macro Recall' },
  { key: 'f1', label: 'Macro F1' },
];

export const FL_CONFIG = {
  clients: 5,
  rounds: 10,
  localEpochs: 20,
  learningRate: 0.05,
  l2: 0.001,
  mu: 0.01,
  alpha: 0.5,
};

export const DEPT_COLORS = ['#6366f1', '#0ea5e9', '#8b5cf6'];

// Serialized model payload measurements reported in the project brief (KB).
export const COMM_REPORTED = {
  graduate_dropout: { perRound: 11.8887, total: 118.887 },
  pass_fail: { perRound: 3.5918, total: 35.918 },
};

// Optional demo fallback: the experiment figures reported in the project brief.
// Only used when "Use demo data" is switched on explicitly; always labelled in the UI.
const row = (accuracy, precision, recall, f1) => ({ accuracy, precision, recall, f1 });
export const DEMO_RESULTS = {
  graduate_dropout: {
    hasData: true,
    departments: [],
    methods: {
      local_average: row(69.01, 79.54, 69.79, 63.91),
      centralized: row(89.67, 90.05, 88.18, 88.92),
      fedavg: row(83.06, 84.68, 79.86, 81.11),
      fedprox: row(83.06, 84.68, 79.86, 81.11),
    },
  },
  pass_fail: {
    hasData: true,
    departments: [],
    methods: {
      local_average: row(64.13, 68.44, 63.8, 59.19),
      centralized: row(74.68, 71.53, 72.31, 71.87),
      fedavg: row(82.28, 80.74, 77.98, 79.05),
      fedprox: row(82.28, 80.74, 77.98, 79.05),
    },
  },
};
