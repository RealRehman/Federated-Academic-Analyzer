import { METHODS } from './constants';

/** [{...method meta, metrics}] for every method present in a normalized results object. */
export const methodList = (data) => METHODS.filter((m) => data?.methods?.[m.key]).map((m) => ({ ...m, metrics: data.methods[m.key] }));

/** Highest non-null value of `metric` among items ({ metrics }). */
export const maxOf = (items, metric) => {
  const vals = items.map((i) => i.metrics[metric]).filter((v) => v != null);
  return vals.length ? Math.max(...vals) : null;
};
