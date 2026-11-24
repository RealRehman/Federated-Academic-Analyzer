
import {
  LayoutDashboard,
  Database,
  Brain,
  Network,
  ChartNoAxesCombined,
  Settings,
  GraduationCap
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Datasets", icon: Database },
  { label: "Models", icon: Brain },
  { label: "Federation", icon: Network },
  { label: "Analytics", icon: ChartNoAxesCombined }
];

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <div className="brand-icon">
          <GraduationCap size={25} />
        </div>

        <div>
          <h2>FedAcademic</h2>
          <span>Analyzer</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">WORKSPACE</p>

        <nav className="sidebar-nav">
          {navigation.map((item, index) => {
            const Icon = item.icon;

            return (
              <a
                href="#"
                key={item.label}
                className={`nav-item ${index === 0 ? "active" : ""}`}
                onClick={(event) => event.preventDefault()}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <Settings size={18} />
        <span>Settings</span>
      </div>

      <div className="sidebar-footer">
        <div className="status-dot"></div>
        <span>System Operational</span>
      </div>

    </aside>
  );
}

export default Sidebar;
