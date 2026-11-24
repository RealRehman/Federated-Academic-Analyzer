export const pct = (v, d = 2) => (v == null || Number.isNaN(v) ? '—' : `${Number(v).toFixed(d)}%`);
export const kb = (v, d = 4) => (v == null || Number.isNaN(v) ? '—' : `${Number(v).toFixed(d)} KB`);
export const int = (v) => (v == null || Number.isNaN(v) ? '—' : Math.round(v).toLocaleString('en-US'));
export const signedPp = (v) => (v == null || Number.isNaN(v) ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(2)} pp`);
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
