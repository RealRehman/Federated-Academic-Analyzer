import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Datasets from './pages/Datasets';
import ModelComparison from './pages/ModelComparison';
import FederatedLearning from './pages/FederatedLearning';
import DepartmentAnalysis from './pages/DepartmentAnalysis';
import TrainingAnalytics from './pages/TrainingAnalytics';
import About from './pages/About';
import Settings from './pages/Settings';
import { EmptyState } from './components/common/States';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="datasets" element={<Datasets />} />
        <Route path="comparison" element={<ModelComparison />} />
        <Route path="federated" element={<FederatedLearning />} />
        <Route path="departments" element={<DepartmentAnalysis />} />
        <Route path="training" element={<TrainingAnalytics />} />
        <Route path="about" element={<About />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<EmptyState title="Page not found" message="Use the sidebar or the keycaps above to open one of the available pages." />} />
      </Route>
    </Routes>
  );
}
