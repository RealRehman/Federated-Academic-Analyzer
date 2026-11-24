# Federated Academic Analyzer: Frontend

React + Vite dashboard for the Federated Academic Analyzer project: a privacy-preserving academic prediction platform that compares **local**, **centralized**, **FedAvg** and **FedProx** logistic regression across three simulated departments.

> This is a **simulated** federated environment (three department clients on one machine), not a production deployment with physically separated institutions. No encryption, differential privacy or secure aggregation is implemented.

## Stack
React 18 (JavaScript) · Vite · React Router DOM · Tailwind CSS 3 · Recharts · Lucide React · Axios

## Quick start

Requires Node.js 18+.

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
npm run build             # production build in dist/
npm run preview           # serve the production build
```

### Run alongside the FastAPI backend

1. Start the backend (it must listen on `http://127.0.0.1:8000`, or change `VITE_API_BASE_URL`):
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload   # adjust the module path to your project
   ```
2. Start this frontend with `npm run dev`.
3. The sidebar shows "Backend connected" once `GET /health` succeeds.

### CORS (required backend change)
The browser calls the API from another origin, so FastAPI must allow it. Add this to the backend (also shown in the app under *Settings*):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

## Configuration
| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | FastAPI base URL (no trailing slash) |

## Backend endpoints used (read-only)
`GET /health` · `GET /api/experiments/` · `GET /api/experiments/{graduate_dropout|pass_fail}` · `GET /api/experiments/{graduate_dropout|pass_fail}/history`

No other endpoints are called; there are no retraining, admin or auth controls.

## Pages
Dashboard · Datasets · Model Comparison · Federated Learning · Department Analysis · Training Analytics · About Project · Settings

**Settings** is functional: it shows the API URL and endpoint status, lets you inspect every raw API response, and holds the demo-data switch.

## Top bar keycaps
The header is a row of 3D keycaps with keyboard shortcuts: **1-8** open the pages, **R** refreshes. The dataset selector appears as keycaps on pages that depend on it. (Ignored while typing in form fields.)

## How data is handled
- All results come from the API. `src/utils/normalize.js` locates metrics by key name (`accuracy`, `macro_precision`, `macro_recall`, `macro_f1` and common variants) and classifies them by path (`fedavg`, `fedprox`, `centralized`, `local`/`department`...). Fractions (0-1) are shown as percentages.
- Because the response schema was not specified, **if a page shows "empty" or "unavailable", open Settings and check the raw response**, then adjust `normalize.js` (it is the single place to change).
- Per-department sizes, per-department baselines, class distributions and per-round communication are shown **only if the API returns them**; otherwise a labelled "unavailable" state appears. Nothing is invented.
- **Demo fallback** (Settings, off by default): shows the comparison figures from the project brief, with a persistent amber banner. It is never applied silently when the API fails; error states offer a "Use demo data" button instead.
- Dataset record counts, the training configuration and the reported communication measurements (11.8887 KB/round and 118.887 KB for Graduate / Dropout; 3.5918 KB/round and 35.918 KB for Pass / Fail) are project reference figures in `src/utils/constants.js`. Communication values are serialized model payload estimates and exclude protocol overhead, encryption and retransmissions.
- If the history has per-round communication under keys containing `downlink`/`uplink`/`total` (KB, or bytes when the key contains "byte"), they are used directly.

## Project structure
```
src/
  assets/        generated sample illustrations (SVG)
  components/    layout/ charts/ cards/ tables/ common/
  context/       DataContext (fetching, demo mode, selected dataset)
  hooks/         useData, useCountUp
  pages/         seven required pages + Settings
  services/api.js  Axios client
  utils/         constants, normalize, format, nav, results
```
