import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');


const client = axios.create({ baseURL: API_BASE_URL, timeout: 10000, headers: { Accept: 'application/json' } });

/** Turn an Axios error into a readable message for the UI. */
export function describeError(err) {
  if (err?.response) {
    const { status, statusText, data } = err.response;
    const detail = typeof data?.detail === 'string' ? data.detail : '';
    return `HTTP ${status} ${statusText || ''}${detail ? ` - ${detail}` : ''}`.trim();
  }
  if (err?.code === 'ECONNABORTED') return `The request to ${API_BASE_URL} timed out.`;
  return `Cannot reach the backend at ${API_BASE_URL}. Check that FastAPI is running and that CORS allows this origin (${window.location.origin}).`;
}

const get = async (path) => {
  try {
    const res = await client.get(path);
    return res.data;
  } catch (err) {
    throw new Error(describeError(err));
  }
};

// Only endpoints that exist in the backend are exposed here.
export const api = {
  health: () => get('/health'),
  listExperiments: () => get('/api/experiments/'),
  getResults: (dataset) => get(`/api/experiments/${dataset}`),
  getHistory: (dataset) => get(`/api/experiments/${dataset}/history`),

  getPredictionSchema: (dataset) =>
    get(`/api/predictions/${dataset}/schema`),

  getPredictionSample: async (dataset) => {
    try {
      const res = await client.get(
        `/api/predictions/${dataset}/sample`
      );
      return res.data;
    } catch (err) {
      throw new Error(describeError(err));
    }
  },

  predictStudent: async (payload) => {
    try {
      const res = await client.post('/api/predictions/', payload);
      return res.data;
    } catch (err) {
      throw new Error(describeError(err));
    }
  },
};