
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="top-header">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Dashboard Overview</h1>
          </div>

          <div className="header-right">
            <span className="system-label">
              Federated Learning System
            </span>

            <div className="user-avatar">FA</div>
          </div>
        </header>

        <section className="dashboard-content">
          <h2>Welcome to Federated Academic Analyzer</h2>
          <p>
            Monitor academic prediction models, federated training
            and department performance from one place.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
