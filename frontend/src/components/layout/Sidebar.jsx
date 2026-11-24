import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { NAV } from '../../utils/nav';
import { useData } from '../../hooks/useData';
import Logo from './Logo';
import ConnectionPill from './ConnectionPill';

export const APP_VERSION = '1.0.0';

export default function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onClose }) {
  const { connection, apiBase } = useData();
  return (
    <>
      {/* mobile overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-900 text-slate-300 shadow-2xl transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
        style={{ backgroundImage: 'radial-gradient(420px 260px at 0% 0%, rgba(99,102,241,.22), transparent 70%)' }}
      >
        <div className={`flex h-[72px] items-center justify-between border-b border-white/5 px-5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <Logo compact={collapsed && !mobileOpen} />
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${collapsed ? 'lg:justify-center' : ''} ${
                  isActive ? 'bg-gradient-to-r from-indigo-500/25 to-violet-500/10 text-white ring-1 ring-inset ring-indigo-400/30' : 'hover:translate-x-0.5 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-1 rounded-r-full bg-indigo-400" />}
                  <Icon size={19} className={isActive ? 'text-indigo-300' : 'text-slate-400 group-hover:text-indigo-300'} aria-hidden="true" />
                  <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/5 p-3">
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white lg:flex"
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> Collapse</>}
          </button>

          <div className={`rounded-xl bg-white/5 p-3 ring-1 ring-white/5 ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="mb-2 text-[11px] font-bold text-slate-400">FastAPI backend</p>
            <ConnectionPill />
            <p className="mt-2 truncate text-[11px] text-slate-500" title={apiBase}>{apiBase}</p>
          </div>
          {collapsed && <div className="hidden justify-center lg:flex"><ConnectionPill short /></div>}

          <div className={`flex items-center gap-3 rounded-xl p-2 ${collapsed ? 'lg:justify-center' : ''}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-extrabold text-white">DP</span>
            <div className={`min-w-0 leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-bold text-white">Demo profile</p>
              <p className="text-[11px] text-slate-500">Not signed in · v{APP_VERSION}</p>
            </div>
          </div>
          <span className="sr-only">Connection state: {connection}</span>
        </div>
      </aside>
    </>
  );
}
