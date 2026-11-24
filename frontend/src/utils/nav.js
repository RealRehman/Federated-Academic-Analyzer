import { LayoutDashboard, Database, BarChart3, Network, Building2, LineChart, Info, Settings } from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Dashboard', short: 'Dashboard', icon: LayoutDashboard, key: '1' },
  { to: '/datasets', label: 'Datasets', short: 'Datasets', icon: Database, key: '2' },
  { to: '/comparison', label: 'Model Comparison', short: 'Compare', icon: BarChart3, key: '3' },
  { to: '/federated', label: 'Federated Learning', short: 'Federated', icon: Network, key: '4' },
  { to: '/departments', label: 'Department Analysis', short: 'Departments', icon: Building2, key: '5' },
  { to: '/training', label: 'Training Analytics', short: 'Training', icon: LineChart, key: '6' },
  { to: '/about', label: 'About Project', short: 'About', icon: Info, key: '7' },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: Settings, key: '8' },
];

// Routes whose content depends on the globally selected dataset.
export const DATASET_ROUTES = ['/comparison', '/federated', '/departments', '/training'];
