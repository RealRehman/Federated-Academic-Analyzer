import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { normalizeHistory, normalizeResults } from '../utils/normalize';
import { DATASET_KEYS, DEMO_RESULTS } from '../utils/constants';

export const DataContext = createContext(null);

const DEMO_KEY = 'faa-demo-data';

export function DataProvider({ children }) {
  const [dataset, setDataset] = useState('graduate_dropout');
  const [demo, setDemoState] = useState(() => {
    try {
      return localStorage.getItem(DEMO_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [state, setState] = useState({ loading: true, raw: {}, errors: {}, updatedAt: null });

  const setDemo = useCallback((on) => {
    setDemoState(on);
    try {
      localStorage.setItem(DEMO_KEY, on ? '1' : '0');
    } catch {
      /* storage unavailable: keep in-memory state only */
    }
  }, []);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const jobs = { health: api.health(), overview: api.listExperiments() };
    DATASET_KEYS.forEach((d) => {
      jobs[`${d}:results`] = api.getResults(d);
      jobs[`${d}:history`] = api.getHistory(d);
    });
    const keys = Object.keys(jobs);
    const settled = await Promise.allSettled(Object.values(jobs));
    const raw = {};
    const errors = {};
    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') raw[keys[i]] = r.value;
      else errors[keys[i]] = r.reason?.message || 'Request failed';
    });
    setState({ loading: false, raw, errors, updatedAt: new Date(), });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const connection = state.loading && !state.updatedAt ? 'checking' : state.errors.health ? 'offline' : 'online';

  const resultsFor = useCallback(
    (ds) => {
      if (demo) return { status: 'demo', data: DEMO_RESULTS[ds] };
      const key = `${ds}:results`;
      if (state.loading && !state.updatedAt) return { status: 'loading' };
      if (state.errors[key]) return { status: 'error', error: state.errors[key] };
      const data = normalizeResults(state.raw[key]);
      return data.hasData ? { status: 'ready', data } : { status: 'empty', data };
    },
    [demo, state],
  );

  const historyFor = useCallback(
    (ds) => {
      if (demo) return { status: 'demo-none' };
      const key = `${ds}:history`;
      if (state.loading && !state.updatedAt) return { status: 'loading' };
      if (state.errors[key]) return { status: 'error', error: state.errors[key] };
      const data = normalizeHistory(state.raw[key]);
      return data.hasData ? { status: 'ready', data } : { status: 'empty', data };
    },
    [demo, state],
  );

  const value = useMemo(
    () => ({
      apiBase: API_BASE_URL,
      dataset,
      setDataset,
      demo,
      setDemo,
      loading: state.loading,
      updatedAt: state.updatedAt,
      raw: state.raw,
      errors: state.errors,
      connection,
      refresh: load,
      resultsFor,
      historyFor,
    }),
    [dataset, demo, setDemo, state, connection, load, resultsFor, historyFor],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
